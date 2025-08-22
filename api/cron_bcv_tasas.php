<?php
/**
 * Script para obtener tasas oficiales (USD, EUR) desde BCV y guardarlas en tipos_cambio.
 * Requerimientos:
 * 1. Obtener HTML vía cURL (fallback file_get_contents)
 * 2. Parsear con DOMDocument + DOMXPath
 * 3. Extraer tasa USD, tasa EUR y fecha de valor
 * 4. Guardar en la base de datos (tabla tipos_cambio)
 *
 * Modelo de conversión:
 * - La tabla tipos_cambio almacena usd_por_unidad (USD por 1 unidad de la moneda indicada).
 * - BCV publica VES por USD y VES por EUR.
 *   => usd_por_unidad (VES) = 1 / VES_por_USD  (muy pequeño)
 *   => usd_por_unidad (EUR) = VES_por_EUR / VES_por_USD
 *   => usd_por_unidad (USD) = 1 (ya suele existir)
 * - Se inserta un registro para VES y otro para EUR con efectivo_desde = fecha valor + hora actual
 */

require_once __DIR__.'/config.php';

// Forzar zona horaria de Caracas para coherencia en fecha/hora almacenada
date_default_timezone_set('America/Caracas');
// Parámetros de tolerancia y paths
$BCV_TOLERANCIA_REL = 0.000001; // 0.0001%
$BCV_TOLERANCIA_CAMBIO_SIGNIFICATIVO = 0.001; // 0.1% para registrar nuevo dentro de la misma hora
$BCV_LOG_FILE = __DIR__.'/logs/cron_bcv_tasas.log';
$BCV_LOG_RETENTION_DAYS = 15; // mantener solo últimos 15 días

function bcv_log(string $msg) {
    global $BCV_LOG_FILE;
    $line = '['.date('Y-m-d H:i:s').'] '.$msg."\n";
    @file_put_contents($BCV_LOG_FILE, $line, FILE_APPEND);
}

function bcv_rotate_and_prune_logs(): void {
    global $BCV_LOG_FILE, $BCV_LOG_RETENTION_DAYS;
    $dir = dirname($BCV_LOG_FILE);
    if (!is_dir($dir)) { @mkdir($dir, 0777, true); }

    $today = date('Y-m-d');
    if (file_exists($BCV_LOG_FILE)) {
        $mtime = filemtime($BCV_LOG_FILE);
        if ($mtime !== false) {
            $logDate = date('Y-m-d', $mtime);
            if ($logDate !== $today) {
                $rotateName = $dir.'/cron_bcv_tasas-'.$logDate.'.log';
                // Evitar sobrescritura si ya existe (añadir sufijo incremental)
                $candidate = $rotateName; $i = 1;
                while (file_exists($candidate)) { $candidate = $rotateName.'-'.$i; $i++; }
                @rename($BCV_LOG_FILE, $candidate);
            }
        }
    }

    // Purgar logs antiguos
    $pattern = $dir.'/cron_bcv_tasas-*.log*';
    $files = glob($pattern);
    if ($files) {
        $cutoff = time() - ($BCV_LOG_RETENTION_DAYS * 86400);
        foreach ($files as $f) {
            $mtime = filemtime($f);
            if ($mtime !== false && $mtime < $cutoff) {
                @unlink($f);
            }
        }
    }
}

// ---------------- Utilidades de descarga ----------------
function bcv_fetch_html(string $url, int $timeout = 20): string {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (BCV Rate Fetcher)',
            CURLOPT_HTTPHEADER => ['Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8']
        ]);
        $html = curl_exec($ch);
        $err = curl_error($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($html !== false && $code >= 200 && $code < 300) return $html;
        if ($err) throw new RuntimeException('Error cURL: '.$err);
    }
    $html = @file_get_contents($url);
    if ($html === false) throw new RuntimeException('No se pudo obtener el HTML de BCV');
    return $html;
}

// ---------------- Parse helpers ----------------
function bcv_parse_number(?string $raw): ?float {
    if ($raw === null) return null;
    $raw = trim($raw);
    if ($raw === '') return null;
    $raw = str_replace(["\xC2\xA0", ' '], '', $raw); // espacios duros
    $raw = str_replace(['.'], '', $raw);   // puntos miles
    $raw = str_replace([','], '.', $raw);  // coma decimal a punto
    if (!is_numeric($raw)) return null;
    return (float)$raw;
}

function bcv_extract_data(string $html): array {
    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $dom->loadHTML($html);
    $xp = new DOMXPath($dom);

    // Fecha precisa desde atributo content del span con property=dc:date
    $fecha = null;
    $dateAttr = $xp->query("//span[@property='dc:date']/@content");
    if ($dateAttr->length) {
        $iso = $dateAttr->item(0)->nodeValue; // 2025-08-21T00:00:00-04:00
        if (preg_match('/^(\d{4}-\d{2}-\d{2})T/', $iso, $m)) {
            $fecha = $m[1];
        }
    }
    // Fallback a dd/mm/yyyy si no
    if (!$fecha && preg_match('/(\d{2}\/\d{2}\/\d{4})/', $html, $m)) {
        [$d,$mm,$yy] = explode('/', $m[1]);
        if (checkdate((int)$mm,(int)$d,(int)$yy)) $fecha = sprintf('%04d-%02d-%02d',$yy,$mm,$d);
    }

    // Extraer VES por USD y VES por EUR usando IDs directos
    $vesPorUsd = null; $vesPorEur = null;
    $usdNode = $xp->query("//div[@id='dolar']//strong");
    if ($usdNode->length) {
        $vesPorUsd = bcv_parse_number($usdNode->item(0)->textContent);
    }
    $eurNode = $xp->query("//div[@id='euro']//strong");
    if ($eurNode->length) {
        $vesPorEur = bcv_parse_number($eurNode->item(0)->textContent);
    }

    // Validaciones simples
    if ($vesPorUsd !== null && ($vesPorUsd < 5 || $vesPorUsd > 10000)) $vesPorUsd = null;
    if ($vesPorEur !== null && ($vesPorEur < 5 || $vesPorEur > 10000)) $vesPorEur = null;

    // Fallback regex si falta algo
    if (!$vesPorUsd || !$vesPorEur) {
        $compact = preg_replace('/\s+/', ' ', $html);
        if (!$vesPorUsd && preg_match('/USD[^0-9]{0,20}([0-9]{1,3}(?:[.,][0-9]{2,}){1,})/i', $compact, $m)) {
            $vesPorUsd = bcv_parse_number($m[1]);
        }
        if (!$vesPorEur && preg_match('/EUR[^0-9]{0,20}([0-9]{1,3}(?:[.,][0-9]{2,}){1,})/i', $compact, $m)) {
            $vesPorEur = bcv_parse_number($m[1]);
        }
    }

    if (!$fecha || !$vesPorUsd || !$vesPorEur) {
        throw new RuntimeException('No se pudieron extraer todas las tasas (USD='.$vesPorUsd.' EUR='.$vesPorEur.' fecha='.(string)$fecha.')');
    }

    return [
        'fecha' => $fecha,
        'ves_por_usd' => $vesPorUsd,
        'ves_por_eur' => $vesPorEur,
    ];
}

function bcv_store_rates(mysqli $conn, string $fecha, float $vesPorUsd, float $vesPorEur): array {
    $efectivoDesde = $fecha.' '.date('H:i:s');
    $usdPorVes = 1 / $vesPorUsd;              // USD por 1 VES
    $usdPorEur = $vesPorEur / $vesPorUsd;      // USD por 1 EUR
    $out = [];
    global $BCV_TOLERANCIA_REL, $BCV_TOLERANCIA_CAMBIO_SIGNIFICATIVO;
    $tolerancia = $BCV_TOLERANCIA_REL;

    // Preparar consultas
    $sel = $conn->prepare("SELECT id, usd_por_unidad, efectivo_desde FROM tipos_cambio WHERE moneda=? AND fuente='bcv' AND DATE(efectivo_desde)=? ORDER BY efectivo_desde DESC LIMIT 1");
    $ins = $conn->prepare("INSERT INTO tipos_cambio (moneda, usd_por_unidad, fuente, efectivo_desde) VALUES (?,?,'bcv',?)");

    $pairs = [
        ['moneda' => 'VES', 'valor' => $usdPorVes],
        ['moneda' => 'EUR', 'valor' => $usdPorEur],
    ];

    foreach ($pairs as $p) {
        $m = $p['moneda'];
        $nuevo = $p['valor'];
        // Buscar último del día
        $sel->bind_param('ss', $m, $fecha);
        if ($sel->execute()) {
            $res = $sel->get_result();
            if ($row = $res->fetch_assoc()) {
                $prev = (float)$row['usd_por_unidad'];
                // Comparar diferencia relativa
                $diffRel = $prev > 0 ? abs($prev - $nuevo) / $prev : 0;
                // Si es prácticamente igual, saltar
                if ($prev > 0 && $diffRel < $tolerancia) {
                    $out[$m] = $prev;
                    $out[$m.'_status'] = 'skipped_duplicate';
                    bcv_log("$m duplicado (diffRel=".number_format($diffRel,8).") se omite");
                    continue;
                }
                // Si dentro de la misma hora y cambio pequeño (< significativo) saltar
                $prevHora = substr($row['efectivo_desde'],0,13); // YYYY-MM-DD HH
                $horaActual = substr($efectivoDesde,0,13);
                if ($prevHora === $horaActual && $diffRel < $BCV_TOLERANCIA_CAMBIO_SIGNIFICATIVO) {
                    $out[$m] = $prev;
                    $out[$m.'_status'] = 'skipped_same_hour_minor_change';
                    bcv_log("$m cambio menor dentro de la misma hora (diffRel=".number_format($diffRel,6).") se omite");
                    continue;
                }
            }
        }
        // Insertar nuevo
        $ed = $efectivoDesde;
        $ins->bind_param('sds', $m, $nuevo, $ed);
        if ($ins->execute()) {
            $out[$m] = $nuevo;
            $out[$m.'_status'] = 'inserted';
            bcv_log("$m insertado usd_por_unidad=$nuevo efectivo_desde=$ed");
        } else {
            $out[$m.'_error'] = $ins->error;
            bcv_log("ERROR insertando $m: ".$ins->error);
        }
    }

    return $out;
}

function bcv_run(): array {
    // Rotar y podar logs antes de iniciar
    bcv_rotate_and_prune_logs();
    $url = 'https://www.bcv.org.ve/';
    $html = bcv_fetch_html($url);
    $data = bcv_extract_data($html);
    $conn = get_db_connection();
    $result = bcv_store_rates($conn, $data['fecha'], $data['ves_por_usd'], $data['ves_por_eur']);
    return [
        'ok' => true,
        'fuente' => 'BCV',
        'fecha_valor' => $data['fecha'],
        'ves_por_usd' => $data['ves_por_usd'],
        'ves_por_eur' => $data['ves_por_eur'],
        'almacenado' => $result,
    ];
}

if (php_sapi_name() === 'cli') {
    try {
        $res = bcv_run();
        echo json_encode($res, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE)."\n";
    bcv_log('Ejecución CLI exitosa');
    } catch (Throwable $e) {
        fwrite(STDERR, 'ERROR: '.$e->getMessage()."\n");
    bcv_log('ERROR CLI: '.$e->getMessage());
        exit(1);
    }
} else {
    header('Content-Type: application/json');
    try {
        $res = bcv_run();
        echo json_encode($res);
    bcv_log('Ejecución HTTP exitosa');
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    bcv_log('ERROR HTTP: '.$e->getMessage());
    }
}

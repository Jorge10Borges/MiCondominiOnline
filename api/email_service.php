<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Config SMTP (añade estas constantes en config.php si quieres parametrizar)
if (!defined('SMTP_HOST')) define('SMTP_HOST', 'smtp.example.com');
if (!defined('SMTP_PORT')) define('SMTP_PORT', 587);
if (!defined('SMTP_USER')) define('SMTP_USER', 'user@example.com');
if (!defined('SMTP_PASS')) define('SMTP_PASS', 'password');
if (!defined('SMTP_FROM')) define('SMTP_FROM', 'no-reply@example.com');
if (!defined('SMTP_FROM_NAME')) define('SMTP_FROM_NAME', 'MiCondominioOnline');

function sendTemporaryPasswordEmail(string $toEmail, string $toName, string $tempPassword): array {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;

        $mail->setFrom(SMTP_FROM, SMTP_FROM_NAME);
        $mail->addAddress($toEmail, $toName ?: $toEmail);
        $mail->isHTML(true);
        $mail->Subject = 'Acceso temporal a MiCondominioOnline';
        $body = '<p>Hola ' . htmlspecialchars($toName ?: $toEmail) . ',</p>' .
                '<p>Se ha creado tu usuario en MiCondominioOnline.</p>' .
                '<p>Tu contraseña temporal es: <strong>' . htmlspecialchars($tempPassword) . '</strong></p>' .
                '<p>Por seguridad, cámbiala al iniciar sesión.</p>' .
                '<p>Saludos.</p>';
        $mail->Body = $body;
        $mail->AltBody = "Se ha creado tu usuario. Contraseña temporal: $tempPassword";

        $mail->send();
        return ['ok' => true];
    } catch (Exception $e) {
        return ['ok' => false, 'error' => $mail->ErrorInfo ?: $e->getMessage()];
    }
}

function generateTemporaryPassword(int $length = 10): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    $out = '';
    $max = strlen($chars) - 1;
    for ($i = 0; $i < $length; $i++) {
        $out .= $chars[random_int(0, $max)];
    }
    return $out;
}
?>

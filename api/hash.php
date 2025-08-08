<?php
// Script para generar hashes de contraseñas
$usuarios = [
    'Juan Pérez' => '12345678',
    'Ana Gómez' => '87654321',
    'Pedro Torres' => '11223344',
    'ROOT' => '11818946',
    'Superusuario' => '11111111',
    'Administrador' => '1234567890'
];

foreach ($usuarios as $nombre => $clave) {
    $hash = password_hash($clave, PASSWORD_DEFAULT);
    echo "$nombre: $hash\n";
}

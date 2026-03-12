<?php
// Database connection shared by all API endpoints.
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'angular_app3_books';

$connection = new mysqli($host, $username, $password, $database);

if ($connection->connect_error) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed']);
    exit;
}

$connection->set_charset('utf8mb4');

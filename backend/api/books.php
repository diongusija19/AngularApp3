<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$methodOverride = $_POST['_method'] ?? null;
$method = $method === 'POST' && $methodOverride ? strtoupper($methodOverride) : $method;
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$payload = getRequestData();

function getRequestData(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'multipart/form-data') !== false) {
        return $_POST;
    }

    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function validateBook(array $book): bool
{
    return isset($book['title'], $book['author'], $book['description'])
        && trim($book['title']) !== ''
        && trim($book['author']) !== ''
        && trim($book['description']) !== '';
}

function sendJson(array $body, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($body);
    exit;
}

function getUploadBaseUrl(): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $basePath = dirname(dirname($_SERVER['SCRIPT_NAME']));

    return rtrim($scheme . '://' . $host . $basePath, '/');
}

function addImageUrls(array $book): array
{
    if (!empty($book['coverImage'])) {
        $book['coverImageUrl'] = getUploadBaseUrl() . '/' . ltrim($book['coverImage'], '/');
    } else {
        $book['coverImageUrl'] = null;
    }

    return $book;
}

function deleteCoverImage(?string $coverImage): void
{
    if (!$coverImage) {
        return;
    }

    $filePath = realpath(__DIR__ . '/../') . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $coverImage);

    if ($filePath && is_file($filePath)) {
        unlink($filePath);
    }
}

function uploadCoverImage(?array $file): ?string
{
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        sendJson(['message' => 'Cover image upload failed'], 422);
    }

    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $mimeType = mime_content_type($file['tmp_name']);

    if (!in_array($mimeType, $allowedMimeTypes, true)) {
        sendJson(['message' => 'Only image uploads are allowed'], 422);
    }

    $uploadDirectory = __DIR__ . '/../uploads';

    if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0777, true) && !is_dir($uploadDirectory)) {
        sendJson(['message' => 'Unable to prepare upload directory'], 500);
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) ?: 'jpg';
    $safeFilename = uniqid('book_', true) . '.' . $extension;
    $relativePath = 'uploads/' . $safeFilename;
    $destination = $uploadDirectory . '/' . $safeFilename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        sendJson(['message' => 'Unable to save uploaded cover image'], 500);
    }

    return $relativePath;
}

function getExistingCoverImage(mysqli $connection, int $id): ?string
{
    $stmt = $connection->prepare('SELECT cover_image FROM books WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    return $result['cover_image'] ?? null;
}

// Route the single endpoint by HTTP verb so Angular can call one URL for CRUD operations.
if ($method === 'GET') {
    if ($id) {
        $stmt = $connection->prepare('SELECT id, title, author, description, published_year AS publishedYear, cover_image AS coverImage, created_at AS createdAt FROM books WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        if (!$result) {
            sendJson(['message' => 'Book not found'], 404);
        }

        sendJson(addImageUrls($result));
    }

    $result = $connection->query('SELECT id, title, author, description, published_year AS publishedYear, cover_image AS coverImage, created_at AS createdAt FROM books ORDER BY created_at DESC');
    $books = [];

    while ($row = $result->fetch_assoc()) {
        $books[] = addImageUrls($row);
    }

    sendJson($books);
}

if ($method === 'POST') {
    if (!validateBook($payload)) {
        sendJson(['message' => 'Invalid book payload'], 422);
    }

    $publishedYear = isset($payload['publishedYear']) && $payload['publishedYear'] !== ''
        ? (int) $payload['publishedYear']
        : null;
    $coverImage = uploadCoverImage($_FILES['cover'] ?? null);

    $stmt = $connection->prepare('INSERT INTO books (title, author, description, published_year, cover_image) VALUES (?, ?, ?, ?, ?)');
    $stmt->bind_param(
        'sssis',
        $payload['title'],
        $payload['author'],
        $payload['description'],
        $publishedYear,
        $coverImage
    );
    $stmt->execute();

    sendJson(['message' => 'Book created', 'id' => $connection->insert_id], 201);
}

if ($method === 'PUT') {
    if (!$id || !validateBook($payload)) {
        sendJson(['message' => 'Invalid update payload'], 422);
    }

    $publishedYear = isset($payload['publishedYear']) && $payload['publishedYear'] !== ''
        ? (int) $payload['publishedYear']
        : null;
    $existingCoverImage = getExistingCoverImage($connection, $id);
    $coverImage = $existingCoverImage;

    if (!empty($payload['removeCover']) && $existingCoverImage) {
        deleteCoverImage($existingCoverImage);
        $coverImage = null;
    }

    $newCoverImage = uploadCoverImage($_FILES['cover'] ?? null);

    if ($newCoverImage) {
        deleteCoverImage($existingCoverImage);
        $coverImage = $newCoverImage;
    }

    $stmt = $connection->prepare('UPDATE books SET title = ?, author = ?, description = ?, published_year = ?, cover_image = ? WHERE id = ?');
    $stmt->bind_param(
        'sssisi',
        $payload['title'],
        $payload['author'],
        $payload['description'],
        $publishedYear,
        $coverImage,
        $id
    );
    $stmt->execute();

    sendJson(['message' => 'Book updated']);
}

if ($method === 'DELETE') {
    if (!$id) {
        sendJson(['message' => 'Book id is required'], 422);
    }

    deleteCoverImage(getExistingCoverImage($connection, $id));

    $stmt = $connection->prepare('DELETE FROM books WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();

    sendJson(['message' => 'Book deleted']);
}

sendJson(['message' => 'Method not allowed'], 405);

<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;
$payload = json_decode(file_get_contents('php://input'), true) ?? [];

function validateBook(array $book): bool
{
    return isset($book['title'], $book['author'], $book['description'])
        && trim($book['title']) !== ''
        && trim($book['author']) !== ''
        && trim($book['description']) !== '';
}

if ($method === 'GET') {
    if ($id) {
        $stmt = $connection->prepare('SELECT id, title, author, description, published_year AS publishedYear, created_at AS createdAt FROM books WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        if (!$result) {
            http_response_code(404);
            echo json_encode(['message' => 'Book not found']);
            exit;
        }

        echo json_encode($result);
        exit;
    }

    $result = $connection->query('SELECT id, title, author, description, published_year AS publishedYear, created_at AS createdAt FROM books ORDER BY created_at DESC');
    $books = [];

    while ($row = $result->fetch_assoc()) {
        $books[] = $row;
    }

    echo json_encode($books);
    exit;
}

if ($method === 'POST') {
    if (!validateBook($payload)) {
        http_response_code(422);
        echo json_encode(['message' => 'Invalid book payload']);
        exit;
    }

    $publishedYear = isset($payload['publishedYear']) && $payload['publishedYear'] !== ''
        ? (int) $payload['publishedYear']
        : null;

    $stmt = $connection->prepare('INSERT INTO books (title, author, description, published_year) VALUES (?, ?, ?, ?)');
    $stmt->bind_param(
        'sssi',
        $payload['title'],
        $payload['author'],
        $payload['description'],
        $publishedYear
    );
    $stmt->execute();

    http_response_code(201);
    echo json_encode(['message' => 'Book created', 'id' => $connection->insert_id]);
    exit;
}

if ($method === 'PUT') {
    if (!$id || !validateBook($payload)) {
        http_response_code(422);
        echo json_encode(['message' => 'Invalid update payload']);
        exit;
    }

    $publishedYear = isset($payload['publishedYear']) && $payload['publishedYear'] !== ''
        ? (int) $payload['publishedYear']
        : null;

    $stmt = $connection->prepare('UPDATE books SET title = ?, author = ?, description = ?, published_year = ? WHERE id = ?');
    $stmt->bind_param(
        'sssii',
        $payload['title'],
        $payload['author'],
        $payload['description'],
        $publishedYear,
        $id
    );
    $stmt->execute();

    echo json_encode(['message' => 'Book updated']);
    exit;
}

if ($method === 'DELETE') {
    if (!$id) {
        http_response_code(422);
        echo json_encode(['message' => 'Book id is required']);
        exit;
    }

    $stmt = $connection->prepare('DELETE FROM books WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();

    echo json_encode(['message' => 'Book deleted']);
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed']);

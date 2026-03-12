CREATE DATABASE IF NOT EXISTS angular_app3_books;
USE angular_app3_books;

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  author VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  published_year INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO books (title, author, description, published_year) VALUES
('Clean Code', 'Robert C. Martin', 'A handbook of agile software craftsmanship.', 2008),
('The Pragmatic Programmer', 'Andrew Hunt and David Thomas', 'Classic guidance on practical software development.', 1999);

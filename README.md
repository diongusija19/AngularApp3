<<<<<<< HEAD
# AngularApp3
=======
# AngularApp3

This repository has two project directories:

- `frontend`: Angular app with routing and HTTP data access.
- `backend`: PHP + MySQL API for books data.

## Frontend setup

1. `cd frontend`
2. `npm install --legacy-peer-deps --cache .npm-cache`
3. `npm start`
4. Open `http://localhost:4200`

Routes:

- `/list`: list all books
- `/add`: add a new book

## Backend setup (XAMPP)

1. Copy this `backend` folder into `XAMPP/htdocs/AngularApp3/backend` (or keep the same path if this repo is already under htdocs).
2. Start Apache and MySQL in XAMPP.
3. Run `backend/sql/books.sql` in phpMyAdmin to create schema/data.
4. API endpoint will be available at:
   `http://localhost/AngularApp3/backend/api/books.php`

## Notes

- Angular `BookService` is CRUD-ready with `getBooks`, `getBook`, `addBook`, `updateBook`, and `deleteBook` methods.
- Current UI demonstrates read and create flows via `/list` and `/add`.
>>>>>>> 1810068 (Build Angular books app with PHP MySQL backend)

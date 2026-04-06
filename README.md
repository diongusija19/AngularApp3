# AngularApp5

This repository has two project directories:

- `frontend`: Angular app with routing, forms, and HTTP data access.
- `backend`: PHP + MySQL API for books data.

## Frontend setup

1. `cd frontend`
2. `npm install --legacy-peer-deps --cache .npm-cache`
3. `npm start`
4. Open `http://localhost:4200`

Routes:

- `/list`: list all books
- `/add`: add a new book
- `/update`: update an existing book and replace/remove its uploaded cover image
- `/delete`: delete an existing book

## Backend setup (XAMPP)

1. Copy this `backend` folder into `XAMPP/htdocs/AngularApp3/backend` or keep the repo itself under `htdocs/AngularApp3`.
2. Start Apache and MySQL in XAMPP.
3. Run `backend/sql/books.sql` in phpMyAdmin to create the schema and sample data.
4. Confirm the API is reachable at `http://localhost/AngularApp3/backend/api/books.php`.

## Notes

- Angular `BookService` exposes `getBooks`, `getBook`, `addBook`, `updateBook`, and `deleteBook`.
- Create and update requests use `FormData` so the app can upload optional cover images to `backend/uploads`.
- The UI demonstrates read, create, update, delete, and file upload flows against the PHP/MySQL backend.

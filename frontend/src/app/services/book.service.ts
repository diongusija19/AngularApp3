import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, BookFormValue } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  // This URL matches the XAMPP path used by the PHP backend in htdocs/AngularApp3/backend.
  private readonly apiUrl = 'http://localhost/AngularApp3/backend/api/books.php';

  constructor(private readonly http: HttpClient) {}

  // Read the full catalog for the /list and /delete routed views.
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  // Read a single book record when edit/detail flows are added later.
  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}?id=${id}`);
  }

  // Insert a new book from the reactive form on /add.
  addBook(book: BookFormValue): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, this.buildFormData(book));
  }

  // Use a method override because PHP only parses multipart uploads on POST requests.
  updateBook(id: number, book: BookFormValue): Observable<{ message: string }> {
    const payload = this.buildFormData(book);
    payload.append('_method', 'PUT');

    return this.http.post<{ message: string }>(`${this.apiUrl}?id=${id}`, payload);
  }

  // Delete is used by the dedicated /delete route.
  deleteBook(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}?id=${id}`);
  }

  private buildFormData(book: BookFormValue): FormData {
    const formData = new FormData();
    formData.append('title', book.title);
    formData.append('author', book.author);
    formData.append('description', book.description);

    if (book.publishedYear !== null && book.publishedYear !== undefined) {
      formData.append('publishedYear', String(book.publishedYear));
    }

    if (book.coverFile) {
      formData.append('cover', book.coverFile);
    }

    if (book.removeCover) {
      formData.append('removeCover', '1');
    }

    return formData;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

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
  addBook(book: Omit<Book, 'id' | 'createdAt'>): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, book);
  }

  // Update stays available so the service already exposes the full CRUD surface.
  updateBook(id: number, book: Omit<Book, 'id' | 'createdAt'>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}?id=${id}`, book);
  }

  // Delete is used by the dedicated /delete route.
  deleteBook(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}?id=${id}`);
  }
}

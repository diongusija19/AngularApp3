import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  // For XAMPP, place backend folder under htdocs/AngularApp3/backend.
  private readonly apiUrl = 'http://localhost/AngularApp3/backend/api/books.php';

  constructor(private readonly http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}?id=${id}`);
  }

  addBook(book: Omit<Book, 'id' | 'createdAt'>): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, book);
  }

  updateBook(id: number, book: Omit<Book, 'id' | 'createdAt'>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}?id=${id}`, book);
  }

  deleteBook(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}?id=${id}`);
  }
}

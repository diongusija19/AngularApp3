import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  isLoading = true;
  isDeleting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private readonly bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  // Centralized data loader so it can be reused after create/update/delete.
  loadBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load books from backend.';
        this.isLoading = false;
      }
    });
  }

  deleteBook(book: Book): void {
    if (!book.id || this.isDeleting) {
      return;
    }

    const confirmed = window.confirm(`Delete "${book.title}" by ${book.author}?`);

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.bookService.deleteBook(book.id).subscribe({
      next: () => {
        this.successMessage = `"${book.title}" was deleted.`;
        this.isDeleting = false;
        this.loadBooks();
      },
      error: () => {
        this.errorMessage = 'Failed to delete the selected book.';
        this.isDeleting = false;
      }
    });
  }
}

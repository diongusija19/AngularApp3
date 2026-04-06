import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-delete',
  imports: [CommonModule, RouterLink],
  templateUrl: './book-delete.component.html',
  styleUrl: './book-delete.component.css'
})
export class BookDeleteComponent implements OnInit {
  books: Book[] = [];
  selectedBookId: number | null = null;
  isLoading = true;
  isDeleting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private readonly bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  // Refresh the delete screen after each successful mutation so the UI stays in sync.
  loadBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.selectedBookId = null;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load books from backend.';
        this.isLoading = false;
      }
    });
  }

  toggleSelection(bookId: number | undefined): void {
    if (!bookId) {
      return;
    }

    this.selectedBookId = this.selectedBookId === bookId ? null : bookId;
  }

  deleteSelectedBook(): void {
    const book = this.books.find((item) => item.id === this.selectedBookId);

    if (!book?.id || this.isDeleting) {
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

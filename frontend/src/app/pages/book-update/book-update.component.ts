import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-update',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './book-update.component.html',
  styleUrl: './book-update.component.css'
})
export class BookUpdateComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private selectedFile: File | null = null;

  books: Book[] = [];
  selectedBookId: number | null = null;
  currentCoverUrl: string | null = null;
  selectedFileName = 'No file selected';
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  bookForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    author: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    publishedYear: [null as number | null],
    removeCover: [false]
  });

  constructor(
    private readonly bookService: BookService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.isLoading = false;

        if (books.length > 0) {
          const requestedBookId = Number(this.route.snapshot.queryParamMap.get('id'));
          const requestedBook = books.find((book) => book.id === requestedBookId);

          if (requestedBook) {
            this.selectBook(requestedBook);
          } else {
            this.selectedBookId = null;
          }
        }
      },
      error: () => {
        this.errorMessage = 'Unable to load books from backend.';
        this.isLoading = false;
      }
    });
  }

  toggleSelection(book: Book): void {
    if (!book.id) {
      return;
    }

    if (this.selectedBookId === book.id) {
      this.selectedBookId = null;
      this.currentCoverUrl = null;
      this.selectedFile = null;
      this.selectedFileName = 'No file selected';
      this.successMessage = '';
      this.bookForm.reset({
        title: '',
        author: '',
        description: '',
        publishedYear: null,
        removeCover: false
      });
      return;
    }

    this.selectBook(book);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = file;
    this.selectedFileName = file ? file.name : 'No file selected';
  }

  onSubmit(): void {
    if (!this.selectedBookId || this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const { title, author, description, publishedYear, removeCover } = this.bookForm.getRawValue();
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.bookService
      .updateBook(this.selectedBookId, {
        title: title ?? '',
        author: author ?? '',
        description: description ?? '',
        publishedYear: publishedYear ?? null,
        coverFile: this.selectedFile,
        removeCover: removeCover ?? false
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.successMessage = 'Book updated successfully.';
          this.selectedFile = null;
          this.selectedFileName = 'No file selected';
          this.loadBooks();
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to update the selected book.';
        }
      });
  }

  private selectBook(book: Book): void {
    this.selectedBookId = book.id ?? null;
    this.currentCoverUrl = book.coverImageUrl ?? null;
    this.selectedFile = null;
    this.selectedFileName = 'No file selected';
    this.successMessage = '';

    this.bookForm.reset({
      title: book.title,
      author: book.author,
      description: book.description,
      publishedYear: book.publishedYear ?? null,
      removeCover: false
    });
  }
}

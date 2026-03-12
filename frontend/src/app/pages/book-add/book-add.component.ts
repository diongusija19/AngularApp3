import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-add',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './book-add.component.html',
  styleUrl: './book-add.component.css'
})
export class BookAddComponent {
  private readonly formBuilder = inject(FormBuilder);

  isSubmitting = false;
  errorMessage = '';

  bookForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    author: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    publishedYear: [null as number | null]
  });

  constructor(
    private readonly bookService: BookService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { title, author, description, publishedYear } = this.bookForm.getRawValue();

    this.bookService
      .addBook({
        title: title ?? '',
        author: author ?? '',
        description: description ?? '',
        publishedYear: publishedYear ?? null
      })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigateByUrl('/list');
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to save the book.';
        }
      });
  }
}

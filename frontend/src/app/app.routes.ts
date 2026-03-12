import { Routes } from '@angular/router';
import { BookListComponent } from './pages/book-list/book-list.component';
import { BookAddComponent } from './pages/book-add/book-add.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'list' },
  { path: 'list', component: BookListComponent },
  { path: 'add', component: BookAddComponent },
  { path: '**', redirectTo: 'list' }
];

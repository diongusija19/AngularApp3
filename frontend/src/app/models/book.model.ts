export interface Book {
  id?: number;
  title: string;
  author: string;
  description: string;
  publishedYear?: number | null;
  createdAt?: string;
}

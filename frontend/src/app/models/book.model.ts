export interface Book {
  id?: number;
  title: string;
  author: string;
  description: string;
  publishedYear?: number | null;
  createdAt?: string;
  coverImage?: string | null;
  coverImageUrl?: string | null;
}

export interface BookFormValue {
  title: string;
  author: string;
  description: string;
  publishedYear?: number | null;
  coverFile?: File | null;
  removeCover?: boolean;
}

import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the navigation links', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.top-nav a');

    expect(links.length).toBe(4);
    expect(compiled.textContent).toContain('Book List');
    expect(compiled.textContent).toContain('Add Book');
    expect(compiled.textContent).toContain('Update Book');
    expect(compiled.textContent).toContain('Delete Book');
  });
});

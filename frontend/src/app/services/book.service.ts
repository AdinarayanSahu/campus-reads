import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8080/api/books';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getAllBooks(): Observable<any> {
    console.log('Fetching all books from:', this.apiUrl);
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  getBookById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  addBook(bookData: any): Observable<any> {
    console.log('Adding book with data:', bookData);
    return this.http.post(this.apiUrl, bookData, { headers: this.getHeaders() });
  }

  updateBook(id: number, bookData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, bookData, { headers: this.getHeaders() });
  }

  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

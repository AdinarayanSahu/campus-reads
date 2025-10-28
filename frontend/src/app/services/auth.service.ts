import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { SessionService } from './session.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private router: Router
  ) { }

  register(registerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, registerData).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.sessionService.setSession(response.token, response);
        }
      })
    );
  }

  login(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginData).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.sessionService.setSession(response.token, response);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.sessionService.clearSession();
        this.router.navigate(['/login']);
      })
    );
  }

  validateSession(): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate`);
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh`, {}).pipe(
      tap((response: any) => {
        if (response && response.token) {
          const userData = this.sessionService.getUserData();
          this.sessionService.setSession(response.token, { ...userData, ...response });
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return this.sessionService.isLoggedIn();
  }

  getCurrentUser(): any {
    return this.sessionService.getUserData();
  }

  hasRole(role: string): boolean {
    return this.sessionService.hasRole(role);
  }
}

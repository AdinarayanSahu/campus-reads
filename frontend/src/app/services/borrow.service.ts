import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BorrowService {
    
    // API endpoint for borrow operations
    private apiUrl = 'http://localhost:8080/api/borrows';

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        let token = '';
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('token') || '';
        }
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    borrowBook(borrowRequest: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/borrow`, borrowRequest, {
            headers: this.getAuthHeaders()
        });
    }

    returnBook(borrowId: number): Observable<any> {
        const returnRequest = {
            borrowRecordId: borrowId,
            reportDamage: false
        };
        return this.http.post(`${this.apiUrl}/return`, returnRequest, {
            headers: this.getAuthHeaders()
        });
    }

    getUserBorrows(userId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/user/${userId}`, {
            headers: this.getAuthHeaders()
        });
    }

    getUserActiveBorrows(userId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/user/${userId}/active`, {
            headers: this.getAuthHeaders()
        });
    }

    getAllBorrows(): Observable<any> {
        return this.http.get(`${this.apiUrl}/all`, {
            headers: this.getAuthHeaders()
        });
    }

    getActiveBorrows(): Observable<any> {
        return this.http.get(`${this.apiUrl}/active`, {
            headers: this.getAuthHeaders()
        });
    }

    getOverdueBorrows(): Observable<any> {
        return this.http.get(`${this.apiUrl}/overdue`, {
            headers: this.getAuthHeaders()
        });
    }

    getPendingRequests(): Observable<any> {
        return this.http.get(`${this.apiUrl}/pending`, {
            headers: this.getAuthHeaders()
        });
    }

    getUserPendingRequests(userId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/user/${userId}/pending`, {
            headers: this.getAuthHeaders()
        });
    }

    approveBorrowRequest(borrowRecordId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/approve/${borrowRecordId}`, {}, {
            headers: this.getAuthHeaders()
        });
    }

    rejectBorrowRequest(borrowRecordId: number, reason?: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/reject/${borrowRecordId}`, 
            { reason: reason || 'Request rejected by librarian' }, {
            headers: this.getAuthHeaders()
        });
    }
}

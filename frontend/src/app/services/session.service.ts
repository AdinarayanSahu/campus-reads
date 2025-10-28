import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SessionData {
    token: string;
    email: string;
    role: string;
    name?: string;
    id?: number;
    gender?: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
    private readonly TOKEN_KEY = 'token';
    private readonly USER_KEY = 'user';
    private readonly SESSION_TIMEOUT = 2 * 60 * 60 * 1000;
    private readonly LAST_ACTIVITY_KEY = 'lastActivity';

    private sessionSubject = new BehaviorSubject<SessionData | null>(this.getSessionData());
    public session$: Observable<SessionData | null> = this.sessionSubject.asObservable();

    constructor() {
        this.initializeSession();
        this.startSessionCheck();
    }

    private initializeSession(): void {
        if (this.isSessionExpired()) {
            this.clearSession();
        } else {
            this.updateLastActivity();
        }
    }

    private startSessionCheck(): void {
        setInterval(() => {
            if (this.isSessionExpired()) {
                this.clearSession();
            }
        }, 60000);
    }

    setSession(token: string, userData: any): void {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
        this.updateLastActivity();
        const sessionData: SessionData = {
            token,
            email: userData.email,
            role: userData.role,
            name: userData.name,
            id: userData.id,
            gender: userData.gender
        };
        this.sessionSubject.next(sessionData);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getUserData(): any {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    getSessionData(): SessionData | null {
        const token = this.getToken();
        const userData = this.getUserData();
        if (token && userData) {
            return {
                token,
                email: userData.email,
                role: userData.role,
                name: userData.name,
                id: userData.id,
                gender: userData.gender
            };
        }
        return null;
    }

    isLoggedIn(): boolean {
        return this.getToken() !== null && !this.isSessionExpired();
    }

    hasRole(role: string): boolean {
        const userData = this.getUserData();
        return userData && userData.role && userData.role.toUpperCase() === role.toUpperCase();
    }

    clearSession(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.LAST_ACTIVITY_KEY);
        this.sessionSubject.next(null);
    }

    updateLastActivity(): void {
        localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
    }

    getLastActivity(): number {
        const lastActivity = localStorage.getItem(this.LAST_ACTIVITY_KEY);
        return lastActivity ? parseInt(lastActivity, 10) : 0;
    }

    isSessionExpired(): boolean {
        const lastActivity = this.getLastActivity();
        if (!lastActivity) {
            return true;
        }
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivity;
        return timeSinceLastActivity > this.SESSION_TIMEOUT;
    }

    getSessionTimeRemaining(): number {
        const lastActivity = this.getLastActivity();
        if (!lastActivity) {
            return 0;
        }
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivity;
        const remaining = this.SESSION_TIMEOUT - timeSinceLastActivity;
        return remaining > 0 ? remaining : 0;
    }
}

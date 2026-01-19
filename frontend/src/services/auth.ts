import { apiClient } from './client';
import type { LoginCredentials, AuthResponse } from './types'; 

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; 
};

export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

/**
 * Decode JWT token to check expiration (without verification)
 * Returns null if token is invalid or expired
 */
const decodeToken = (token: string): { exp?: number } | null => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

/**
 * Check if token exists and is not expired
 */
export const isAuthenticated = (): boolean => {
    const token = getToken();
    if (!token) return false;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return false;
    
    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
        // Clean up expired token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
    }
    
    return true;
};
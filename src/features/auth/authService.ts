// src/features/auth/authService.ts
import { api } from '@/lib/api';
// 1. Import shared types
import type { UserRole, AuthResponse as ApiAuthResponse } from '@/types';

// 2. Define a clear type for the API response data
// (We can't use AuthResponse from @/types directly as it has 'success' in it)
interface AuthSuccessData {
  username: string;
  role: UserRole;
}

// 3. Define the return types for our service functions
type AuthResult = {
    success: true;
    data: AuthSuccessData;
} | {
    success: false;
    error: string;
}

type LogoutResult = {
    success: true;
} | {
    success: false;
    error: string;
}

type AuthStatus = {
    is_authenticated: true;
    username: string;
    role: UserRole;
} | {
    is_authenticated: false;
    error: string;
}

/**
 * Attempts to log in a user.
 */
export async function loginUser(username: string, password: string): Promise<AuthResult> {
    try {
        // 4. Use the generic to type the expected successful response
        const data = await api.post<AuthSuccessData>('/auth/login', { username, password });
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message || 'Login failed.' };
    }
}

/**
 * Attempts to register a new user.
 */
export async function registerUser(username: string, email: string, password: string): Promise<AuthResult> {
    try {
        const data = await api.post<AuthSuccessData>('/auth/register', { username, email, password });
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message || 'Registration failed.' };
    }
}

/**
 * Logs out the current user.
 */
export async function logoutUser(): Promise<LogoutResult> {
    try {
        // 5. For POSTs that don't return data, we can use 'unknown' or a specific "empty" type
        await api.post<unknown>('/auth/logout');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Logout failed.' };
    }
}

/**
 * Checks if a user is authenticated.
 */
export async function checkAuthStatus(): Promise<AuthStatus> {
    try {
        const data = await api.get<AuthSuccessData>('/auth/me'); 
        
        // If the line above succeeds, we are authenticated
        return { is_authenticated: true, username: data.username, role: data.role };
    } catch (error: any) {
        // If it throws (401 or network error), we are not authenticated
        return { is_authenticated: false, error: error.message || 'Failed to check authentication status.' };
    }
}
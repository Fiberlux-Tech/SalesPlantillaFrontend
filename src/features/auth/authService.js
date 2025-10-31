// src/features/auth/authService.js

import { api } from '@/lib/api';

/**
 * Attempts to log in a user.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{success: boolean, data: object, error: string}>}
 */
export async function loginUser(username, password) {
    try {
        const data = await api.post('/auth/login', { username, password });
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message || 'Login failed.' };
    }
}

/**
 * Attempts to register a new user.
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, data: object, error: string}>}
 */
export async function registerUser(username, email, password) {
    try {
        const data = await api.post('/auth/register', { username, email, password });
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message || 'Registration failed.' };
    }
}

/**
 * Logs out the current user.
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function logoutUser() {
    try {
        await api.post('/auth/logout');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message || 'Logout failed.' };
    }
}

/**
 * Checks if a user is authenticated.
 * @returns {Promise<{is_authenticated: boolean, username: string, role: string, error: string}>}
 */
export async function checkAuthStatus() {
    try {
        // api.get will now THROW an error if not authenticated (401)
        const data = await api.get('/auth/me'); 
        
        // If the line above succeeds, we are authenticated
        return { is_authenticated: true, username: data.username, role: data.role };
    } catch (error) {
        // If it throws (401 or network error), we are not authenticated
        return { is_authenticated: false, error: error.message || 'Failed to check authentication status.' };
    }
}
// src/lib/api.ts
import type { BaseApiResponse } from '@/types'; // Import our new type

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * A centralized request function that handles responses and errors.
 * We use a generic <T> to type the successful response.
 * @param {string} url - The endpoint URL (e.g., '/auth/login')
 * @param {object} options - The standard 'fetch' options object
 * @returns {Promise<T>} - The JSON response data
 * @throws {Error} - Throws an error for non-successful HTTP responses
 */
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    // 1. Set default options
    const config: RequestInit = {
        ...options,
        credentials: 'include', // Always send cookies
    };

    // 2. Set default headers, but allow overrides
    const headers = new Headers(config.headers);

    // 3. Smartly set Content-Type, unless it's FormData
    if (config.body && !(config.body instanceof FormData)) {
        // Default to JSON if not specified
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        // Stringify body if it's a JS object
        config.body = JSON.stringify(config.body);
    }
    
    config.headers = headers;

    // 4. Make the request
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    // 5. GLOBAL 401 HANDLER
    if (response.status === 401) {
        window.location.href = '/'; 
        throw new Error('Not authenticated');
    }

    // 6. GLOBAL ERROR HANDLER (for non-401 errors)
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const err = await response.json();
            errorMessage = err.message || err.error || errorMessage;
        } catch (e) {
            // Ignore if response is not JSON
        }
        throw new Error(errorMessage);
    }

    // 7. SUCCESS HANDLER
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json() as Promise<T>; // Parse and return typed JSON
    }
    
    // Return undefined for 204 No Content, cast as T
    return undefined as T; 
}

// --- Our clean, typed API methods ---

export const api = {
    get: <T>(url: string) => request<T>(url, { method: 'GET' }),

    post: <T>(url: string, data: any) => request<T>(url, { method: 'POST', body: data }),

    postForm: <T>(url: string, formData: FormData) => request<T>(url, { method: 'POST', body: formData }),
};
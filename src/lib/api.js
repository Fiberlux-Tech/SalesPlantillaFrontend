// This reads the base URL set in the environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// A simple API helper to make requests and handle JSON
// We add "export" so App.jsx can import it
export const api = {
    post: async (url, data) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include' 
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'An error occurred');
        }
        return response.json();
    },
    get: async (url) => {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            credentials: 'include' 
        });
        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, message: 'Not authenticated' };
            }
            const err = await response.json();
            throw new Error(err.message || 'An error occurred');
        }
        return response.json();
    }
};
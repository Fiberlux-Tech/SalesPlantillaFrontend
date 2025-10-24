// fiberlux-tech/salesplantillafrontend/SalesPlantillaFrontend-64ed8b30ed6e79e4876344359d7698df855dbf56/src/features/admin/adminService.js

import { api } from '@/lib/api'; // Import the central API utility

// --- REMOVED: API_BASE_URL constant is no longer needed

/**
 * Fetches the list of all users from the backend.
 * @returns {Promise<{success: boolean, data: Array, error: string}>}
 */
export async function getAllUsers() {
    try {
        // Use the centralized api.get helper. 
        // This returns the JSON body (e.g., { users: [...] }) on success.
        // It will also throw a standardized error for non-OK responses (like 403 Forbidden).
        const data = await api.get('/api/admin/users');
        
        // Extract the users array from the response body for the component
        return { success: true, data: data.users || [] };
    } catch (error) {
        // Catch errors thrown by api.get (including unauthorized/network)
        return { success: false, error: error.message || "Failed to load user data." };
    }
}

/**
 * Updates the role of a specific user.
 * @param {number} userId 
 * @param {string} newRole (e.g., "ADMIN", "SALES")
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function updateUserRole(userId, newRole) {
    try {
        // Use the centralized api.post helper
        await api.post(`/api/admin/users/${userId}/role`, { role: newRole.toUpperCase() });

        return { success: true };
    } catch (error) {
        // Catch errors thrown by api.post
        return { success: false, error: error.message || "Failed to update role." };
    }
}

/**
 * Resets the password for a specific user.
 * @param {number} userId 
 * @param {string} newPassword
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function resetUserPassword(userId, newPassword) {
    try {
        // Use the centralized api.post helper
        await api.post(`/api/admin/users/${userId}/reset-password`, { new_password: newPassword });

        return { success: true };
    } catch (error) {
        // Catch errors thrown by api.post
        return { success: false, error: error.message || "Failed to reset password." };
    }
}
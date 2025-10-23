// src/features/admin/adminService.js

// The Admin module requires direct fetch calls to handle custom error parsing and the API_BASE_URL 
// which was the pattern established in the original AdminUserManagement.tsx
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Fetches the list of all users from the backend.
 * @returns {Promise<{success: boolean, data: Array, error: string}>}
 */
export async function getAllUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
            credentials: 'include' 
        });

        if (!response.ok) {
            let errorMessage = 'Failed to fetch users.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = `Server returned status ${response.status}.`;
            }
            return { success: false, error: errorMessage };
        }

        const data = await response.json();
        // Return the raw list of users for the component to handle.
        return { success: true, data: data.users };
    } catch (err) {
        return { success: false, error: err.message || "Failed to load user data." };
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
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', 
            body: JSON.stringify({ role: newRole.toUpperCase() }), 
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData.error || `Failed to update role.` };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: err.message || "Failed to update role." };
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
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', 
            body: JSON.stringify({ new_password: newPassword }), 
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData.error || 'Failed to reset password.' };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: err.message || "Failed to reset password." };
    }
}
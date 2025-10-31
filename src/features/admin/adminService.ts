// src/features/admin/adminService.ts
import { api } from '@/lib/api'; 
import type { User, BaseApiResponse } from '@/types'; // 1. Import shared types

// 2. Define a more specific type for the service function's return
interface GetUsersResult {
    success: boolean;
    data?: User[];
    error?: string;
}

/**
 * Fetches the list of all users from the backend.
 */
export async function getAllUsers(): Promise<GetUsersResult> {
    try {
        // 3. Type the expected API response
        const data = await api.get<{ users: User[] }>('/api/admin/users');
        
        return { success: true, data: data.users || [] };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to load user data." };
    }
}

/**
 * Updates the role of a specific user.
 * We can reuse BaseApiResponse for simple success/error messages
 */
export async function updateUserRole(userId: number, newRole: string): Promise<BaseApiResponse> {
    try {
        await api.post<BaseApiResponse>(`/api/admin/users/${userId}/role`, { role: newRole.toUpperCase() });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update role." };
    }
}

/**
 * Resets the password for a specific user.
 */
export async function resetUserPassword(userId: number, newPassword: string): Promise<BaseApiResponse> {
    try {
        await api.post<BaseApiResponse>(`/api/admin/users/${userId}/reset-password`, { new_password: newPassword });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to reset password." };
    }
}
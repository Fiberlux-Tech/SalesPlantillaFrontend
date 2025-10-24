// src/features/sales/salesService.js

import { api } from '@/lib/api';

/**
 * Fetches transactions for the Sales Dashboard.
 * @param {number} page - The current page number.
 * @returns {Promise<{success: boolean, data: Array, pages: number, status: number}>}
 */
export async function getSalesTransactions(page) {
    try {
        const response = await fetch(`/api/transactions?page=${page}&per_page=30`);

        // Handle 401 Unauthorized outside of api.js for this dashboard's specific onLogout logic
        if (response.status === 401) {
            return { success: false, status: 401, error: 'Unauthorized. Logging out.' };
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Apply the necessary formatting logic here in the service layer
            const formattedTransactions = result.data.transactions.map(tx => ({
                id: tx.id,
                client: tx.clientName,
                salesman: tx.salesman,
                grossMarginRatio: tx.grossMarginRatio,
                payback: tx.payback,
                submissionDate: new Date(tx.submissionDate).toISOString().split('T')[0],
                approvalDate: tx.approvalDate ? new Date(tx.approvalDate).toISOString().split('T')[0] : 'N/A',
                status: tx.ApprovalStatus,
            }));
            return { 
                success: true, 
                data: formattedTransactions, 
                pages: result.data.pages 
            };
        } else {
            return { success: false, error: result.error || 'Failed to fetch transactions.' };
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to the server.' };
    }
}

/**
 * Uploads an Excel file for preview data extraction.
 * @param {File} file - The Excel file to upload.
 * @returns {Promise<{success: boolean, data: object, error: string, status: number}>}
 */
export async function uploadExcelForPreview(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/process-excel', {
            method: 'POST',
            body: formData,
        });

        if (response.status === 401) {
            return { success: false, status: 401, error: 'Unauthorized. Logging out.' };
        }

        const result = await response.json();

        if (result.success) {
            // Include the filename in the payload here, keeping the Dashboard clean
            const dataWithFilename = { ...result.data, fileName: file.name };
            return { success: true, data: dataWithFilename };
        } else {
            return { success: false, error: result.error || 'An unknown error occurred during processing.' };
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to the server for upload.' };
    }
}

/**
 * Submits the final, validated transaction payload to the backend.
 * @param {object} finalPayload - The full transaction data including Gigalan inputs.
 * @returns {Promise<{success: boolean, error: string, status: number}>}
 */
export async function submitFinalTransaction(finalPayload) {
    try {
        const response = await fetch('/api/submit-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload),
        });

        if (response.status === 401) {
            return { success: false, status: 401, error: 'Unauthorized. Logging out.' };
        }
        
        const result = await response.json();

        if (result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error || 'An unknown error occurred during submission.' };
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to the server for submission.' };
    }
}

/**
 * Sends the current modal data to the backend for KPI recalculation.
 * @param {object} payload - The full data package (original + edits).
 * @returns {Promise<{success: boolean, data: object, error: string, status: number}>}
 */
export async function calculatePreview(payload) {
    try {
        // Use fetch directly to handle potential 401s specifically if needed,
        // or use the api.post helper if it handles credentials correctly.
        // Assuming api.post includes credentials ('include') as configured in api.js
        const result = await api.post('/api/calculate-preview', payload);

        // Assuming api.post throws an error for non-OK responses or handles 401
        // If api.post returns structured errors like { success: false, ...}:
        if (result && result.success) {
            return { success: true, data: result.data };
        } else {
             // Check if the api helper returns a specific status for auth errors
             if (result.status === 401) {
                 return { success: false, status: 401, error: 'Unauthorized. Logging out.' };
             }
             // Otherwise, use the error message provided by the helper or a default
             return { success: false, error: result.error || 'Failed to calculate preview.' };
        }

    } catch (error) {
         // Handle network errors or errors thrown by api.post
         // Check if the error object contains status information (useful for 401)
         const status = error.response?.status; // Example if using axios-like error structure
         if (status === 401) {
              return { success: false, status: 401, error: 'Unauthorized. Logging out.' };
         }
        return { success: false, error: error.message || 'Failed to connect to the server for preview calculation.' };
    }
}
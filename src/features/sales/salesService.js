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
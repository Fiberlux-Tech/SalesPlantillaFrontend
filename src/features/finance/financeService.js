// src/features/finance/financeService.js

import { api } from '@/lib/api';

/**
 * Fetches transactions for the Finance Dashboard.
 * @param {number} page - The current page number.
 * @returns {Promise<{success: boolean, data: Array, pages: number, error: string, status: number}>}
 */
export async function getFinanceTransactions(page) {
    try {
        // Direct fetch is used here as a standard pattern, matching the original code style for handling 401.
        const response = await fetch(`/api/transactions?page=${page}&per_page=30`); 
        
        if (response.status === 401) {
            return { success: false, status: 401, error: 'Unauthorized. Logging out.' };
        }

        const result = await response.json();

        if (result.success) {
            // Data formatting logic moved here from FinanceDashboard.jsx
            const formattedTransactions = result.data.transactions.map(tx => ({
                id: tx.id,
                unidadNegocio: tx.unidadNegocio,
                clientName: tx.clientName,
                salesman: tx.salesman,
                MRC: tx.MRC,
                plazoContrato: tx.plazoContrato,
                grossMarginRatio: tx.grossMarginRatio,
                payback: tx.payback,
                submissionDate: new Date(tx.submissionDate).toISOString().split('T')[0],
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
 * Fetches detailed data for a specific transaction by ID.
 * @param {number} transactionId - The ID of the transaction.
 * @returns {Promise<{success: boolean, data: object, error: string, status: number}>}
 */
export async function getTransactionDetails(transactionId) {
    try {
        const response = await fetch(`/api/transaction/${transactionId}`);
        
        if (response.status === 401) {
            return { success: false, status: 401, error: 'Unauthorized. Logging out.' };
        }
        
        const result = await response.json();

        if (result.success) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error || 'Failed to fetch transaction details.' };
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to the server.' };
    }
}


/**
 * Sends a command to approve or reject a transaction, optionally including modified data.
 * @param {number} transactionId - The ID of the transaction.
 * @param {('approve'|'reject')} action - The action to take.
 * @param {object} [modifiedData] - Optional payload of modified transaction fields.
 * @returns {Promise<{success: boolean, error: string, status: number}>}
 */
export async function updateTransactionStatus(transactionId, action, modifiedData = {}) { // MODIFIED to accept modifiedData
    const endpoint = action === 'approve' ? 'approve' : 'reject';
    
    // If there is modifiedData, send it as JSON body
    const body = Object.keys(modifiedData).length > 0 ? JSON.stringify({ transactions: modifiedData }) : null;
    const headers = body ? { 'Content-Type': 'application/json' } : {};
    
    try {
        const response = await fetch(`/api/transaction/${endpoint}/${transactionId}`, {
            method: 'POST',
            headers: headers, // Pass headers if body exists
            body: body, // Pass body if body exists
        });

        if (response.status === 401) {
            return { success: false, status: 401, error: 'Unauthorized. Logging out.' };
        }
        
        // Handle non-successful responses (e.g., 400 Bad Request, 403 Forbidden)
        if (!response.ok) {
            const errorData = await response.json();
            return { 
                success: false, 
                error: errorData.error || `Failed to ${action} transaction.`,
                status: response.status 
            };
        }

        const result = await response.json();
        
        if (result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error || `Failed to ${action} transaction.` };
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to the server.' };
    }
}

/**
 * Requests the backend to calculate the commission for a transaction.
 * @param {number} transactionId - The ID of the transaction.
 * @returns {Promise<{success: boolean, data: object, error: string, status: number}>}
 */
export async function calculateCommission(transactionId) {
    try {
        const response = await fetch(`/api/transaction/${transactionId}/calculate-commission`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, 
            credentials: 'include', 
        });

        if (response.status === 401) {
            return { success: false, status: 401, error: 'Unauthorized. Logging out.' };
        }

        // Handle non-successful responses (e.g., 403 Forbidden for immutable data)
        if (!response.ok) {
            const errorData = await response.json();
             return { 
                success: false, 
                error: errorData.error || `Failed to calculate commission. Server returned status ${response.status}`,
                status: response.status
            };
        }
        
        const result = await response.json();
        
        if (result.success) { 
            return { success: true, data: result.data };
        } else {
             return { success: false, error: result.error || `Failed to calculate commission.` };
        }
    } catch (error) {
        return { success: false, error: 'Failed to connect to the server for commission calculation.' };
    }
}


/**
 * Sends modified data to the backend for KPI recalculation (PREVIEW ONLY).
 * This function mirrors the one in salesService.js but is used by FinanceDashboard.
 * @param {object} payload - The full data package (original + edits).
 * @returns {Promise<{success: boolean, data: object, error: string, status: number}>}
 */
export async function calculatePreview(payload) {
    try {
        const result = await api.post('/api/calculate-preview', payload); 

        if (result && result.success) {
            return { success: true, data: result.data };
        } else {
             if (result.status === 401) {
                 return { success: false, status: 401, error: 'Unauthorized. Logging out.' };
             }
             return { success: false, error: result.error || 'Failed to calculate preview.' };
        }

    } catch (error) {
         if (error.message && error.message.includes('Not authenticated')) {
              return { success: false, status: 401, error: 'Unauthorized. Logging out.' };
         }
        return { success: false, error: error.message || 'Failed to connect to the server for preview calculation.' };
    }
}
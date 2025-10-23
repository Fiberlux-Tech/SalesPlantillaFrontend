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
 * Sends a command to approve or reject a transaction.
 * @param {number} transactionId - The ID of the transaction.
 * @param {('approve'|'reject')} action - The action to take.
 * @returns {Promise<{success: boolean, error: string, status: number}>}
 */
export async function updateTransactionStatus(transactionId, action) {
    const endpoint = action === 'approve' ? 'approve' : 'reject';
    try {
        const response = await fetch(`/api/transaction/${endpoint}/${transactionId}`, {
            method: 'POST',
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
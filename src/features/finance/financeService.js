// src/features/finance/financeService.js (Refactored)

import { api } from '@/lib/api';

/**
 * Fetches transactions for the Finance Dashboard.
 * @param {number} page - The current page number.
 * @returns {Promise<{success: boolean, data: Array, pages: number, error: string, status: number}>}
 */
export async function getFinanceTransactions(page) {
    try {
        // REPLACED: fetch and manual 401 check
        const result = await api.get(`/api/transactions?page=${page}&per_page=30`); 
 
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
        return { success: false, error: error.message || 'Failed to connect to the server.' };
     }
}


/**
 * Fetches detailed data for a specific transaction by ID.
 * @param {number} transactionId - The ID of the transaction.
 * @returns {Promise<{success: boolean, data: object, error: string, status: number}>}
 */
export async function getTransactionDetails(transactionId) {
    try {
        // REPLACED: fetch and manual 401 check
        const result = await api.get(`/api/transaction/${transactionId}`);

        if (result.success) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error || 'Failed to fetch transaction details.' };
        }
    } catch (error) {
        return { success: false, error: error.message || 'Failed to connect to the server.' };
    }
}


/**
 * Sends a command to approve or reject a transaction, optionally including modified data.
 * @param {number} transactionId - The ID of the transaction.
 * @param {('approve'|'reject')} action - The action to take.
 * @param {object} [modifiedData] - Optional payload of modified transaction fields.
 * @param {Array} [fixedCosts] - Optional array of modified fixed costs.
 * @param {Array} [recurringServices] - Optional array of modified recurring services.
 * @returns {Promise<{success: boolean, error: string, status: number}>}
 */
export async function updateTransactionStatus(transactionId, action, modifiedData = {}, fixedCosts = null, recurringServices = null) {
    const endpoint = action === 'approve' ? 'approve' : 'reject';
    
    const payload = {
        transactions: modifiedData
    };
    
    if (fixedCosts) {
        payload.fixed_costs = fixedCosts;
    }
    if (recurringServices) {
        payload.recurring_services = recurringServices;
    }
    
    try {
        // REPLACED: fetch and all manual error/status checks
        const result = await api.post(`/api/transaction/${endpoint}/${transactionId}`, payload);
        
        if (result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error || `Failed to ${action} transaction.` };
        }
    } catch (error) {
        // This catch block now handles 401, 403, 400, 500, etc.
        return { success: false, error: error.message || 'Failed to connect to the server.' };
    }
}

/**
 * Requests the backend to calculate the commission for a transaction.
 * @param {number} transactionId - The ID of the transaction.
 * @returns {Promise<{success: boolean, data: object, error: string, status: number}>}
 */
export async function calculateCommission(transactionId) {
    try {
        // REPLACED: fetch and all manual error/status checks
        const result = await api.post(`/api/transaction/${transactionId}/calculate-commission`);
        
        if (result.success) { 
            return { success: true, data: result.data };
        } else {
             return { success: false, error: result.error || `Failed to calculate commission.` };
        }
    } catch (error) {
        return { success: false, error: error.message || 'Failed to connect to the server for commission calculation.' };
    }
}


/**
 * Sends modified data to the backend for KPI recalculation (PREVIEW ONLY).
 * @param {object} payload - The full data package (original + edits).
 * @returns {Promise<{success: boolean, data: object, error: string, status: number}>}
 */
export async function calculatePreview(payload) {
    try {
        const result = await api.post('/api/calculate-preview', payload); 

        if (result && result.success) {
            return { success: true, data: result.data };
        } else {
             return { success: false, error: result.error || 'Failed to calculate preview.' };
        }

    } catch (error) {
        // SIMPLIFIED: Catches all errors
        return { success: false, error: error.message || 'Failed to connect to the server for preview calculation.' };
    }
}
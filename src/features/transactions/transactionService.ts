// src/features/transactions/transactionService.ts
import { api } from '@/lib/api';
import type {
    SalesTransactionListResponse,
    TransactionDetailResponse,
    KpiCalculationResponse,
    BaseApiResponse,
    Transaction,
    FixedCost,
    RecurringService,
    FinanceTransactionListResponse
} from '@/types';

// --- Types from salesService.ts ---

export interface FormattedSalesTransaction {
    id: number;
    client: string;
    salesman: string;
    grossMarginRatio: number;
    payback: number;
    submissionDate: string;
    approvalDate: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
}

interface GetSalesTransactionsResult {
    success: boolean;
    data?: FormattedSalesTransaction[];
    pages?: number;
    error?: string;
}

// --- Types from financeService.ts ---

export interface FormattedFinanceTransaction {
    id: number;
    unidadNegocio: string;
    clientName: string;
    salesman: string;
    MRC: number;
    plazoContrato: number;
    grossMarginRatio: number;
    payback: number;
    submissionDate: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
}

interface GetFinanceTransactionsResult {
    success: boolean;
    data?: FormattedFinanceTransaction[];
    pages?: number;
    error?: string;
}

// --- Functions from salesService.ts ---

export async function getSalesTransactions(page: number): Promise<GetSalesTransactionsResult> {
    try {
        const result = await api.get<SalesTransactionListResponse>(`/api/transactions?page=${page}&per_page=30`);
        
        if (result.success) {
            const formattedTransactions: FormattedSalesTransaction[] = result.data.transactions.map((tx: Transaction) => ({
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
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to connect to the server.' };
    }
}

interface UploadExcelResult {
    success: boolean;
    data?: TransactionDetailResponse['data']; // Reuse the data shape
    error?: string;
}

export async function uploadExcelForPreview(file: File): Promise<UploadExcelResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const result = await api.postForm<TransactionDetailResponse>(`/api/process-excel`, formData);

        if (result.success) {
            const dataWithFilename = { ...result.data, fileName: file.name };
            return { success: true, data: dataWithFilename };
        } else {
            return { success: false, error: result.error || 'An unknown error occurred during processing.' };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to connect to the server for upload.' };
    }
}

export async function submitFinalTransaction(finalPayload: any): Promise<BaseApiResponse> {
    try {
        const result = await api.post<BaseApiResponse>('/api/submit-transaction', finalPayload);

        if (result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error || 'An unknown error occurred during submission.' };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to connect to the server for submission.' };
    }
}

// --- Type for Calculate Preview ---
type CalculatePreviewResult = {
    success: true;
    data: KpiCalculationResponse['data'];
} | {
    success: false;
    error: string;
    data?: undefined;
};

/**
 * Sends modified data to the backend for KPI recalculation (PREVIEW ONLY).
 * This function is used by both Sales and Finance.
 */
export async function calculatePreview(payload: any): Promise<CalculatePreviewResult> {
    try {
        // The API response is expected to match KpiCalculationResponse on success
        const result = await api.post<KpiCalculationResponse>('/api/calculate-preview', payload); 

        if (result && result.success) {
            // This now matches the { success: true, data: ... } part of the union
            return { success: true, data: result.data };
        } else {
             // This now matches the { success: false, error: ... } part of the union
             return { success: false, error: (result as any).error || 'Failed to calculate preview.' };
        }

    } catch (error: any) {
        // This also matches the { success: false, error: ... } part of the union
        return { success: false, error: error.message || 'Failed to connect to the server for preview calculation.' };
    }
}

export async function getFixedCostsByCodes(codes: string[]): Promise<{ success: true; data: FixedCost[] } | { success: false; error: string; data?: undefined }> {
    try {
        const payload = { investment_codes: codes };
        const result = await api.post<{ success: boolean, data: { fixed_costs: FixedCost[] }, error?: string }>(
            '/api/fixed-costs/lookup', 
            payload
        );
        if (result.success) {
            const fixedCosts = result.data?.fixed_costs || [];
            return { success: true, data: fixedCosts };
        } else {
            return { success: false, error: result.error || 'Failed to fetch fixed costs.' };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Network error during code lookup.' };
    }
}

// --- Functions from financeService.ts ---

export async function getFinanceTransactions(page: number): Promise<GetFinanceTransactionsResult> {
    try {
        const result = await api.get<FinanceTransactionListResponse>(`/api/transactions?page=${page}&per_page=30`); 
 
        if (result.success) {
            const formattedTransactions: FormattedFinanceTransaction[] = result.data.transactions.map((tx: Transaction) => ({
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
 
 	} catch (error: any) {
        return { success: false, error: error.message || 'Failed to connect to the server.' };
 	}
}

type GetTransactionDetailsResult = {
    success: true;
    data: TransactionDetailResponse['data'];
} | {
    success: false;
    error: string;
    data?: undefined;
}

export async function getTransactionDetails(transactionId: number): Promise<GetTransactionDetailsResult> {
    try {
        const result = await api.get<TransactionDetailResponse>(`/api/transaction/${transactionId}`);
        if (result.success) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error || 'Failed to fetch transaction details.' };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to connect to the server.' };
    }
}

export async function updateTransactionStatus(
    transactionId: number, 
    action: 'approve' | 'reject', 
    modifiedData: Partial<Transaction> = {}, 
    fixedCosts: FixedCost[] | null = null, 
    recurringServices: RecurringService[] | null = null
): Promise<BaseApiResponse> {
    
    const endpoint = action === 'approve' ? 'approve' : 'reject';
    
    const payload: {
        transactions: Partial<Transaction>;
        fixed_costs?: FixedCost[] | null;
        recurring_services?: RecurringService[] | null;
    } = {
        transactions: modifiedData
    };
    
    if (fixedCosts) {
        payload.fixed_costs = fixedCosts;
    }
    if (recurringServices) {
        payload.recurring_services = recurringServices;
    }
    
    try {
        const result = await api.post<BaseApiResponse>(`/api/transaction/${endpoint}/${transactionId}`, payload);
        
        if (result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error || `Failed to ${action} transaction.` };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to connect to the server.' };
    }
}

type CalculateCommissionResult = {
    success: true;
    data: TransactionDetailResponse['data'];
} | {
    success: false;
    error: string;
    data?: undefined;
}

export async function calculateCommission(transactionId: number): Promise<CalculateCommissionResult> {
    try {
        const result = await api.post<TransactionDetailResponse>(
            `/api/transaction/${transactionId}/calculate-commission`, 
            {} 
        );
        
        if (result.success) { 
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error || `Failed to calculate commission.` };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to connect to the server for commission calculation.' };
    }
}
// src/features/sales/salesService.ts
import { api } from '@/lib/api';
import type { 
    SalesTransactionListResponse, 
    TransactionDetailResponse,
    KpiCalculationResponse,
    BaseApiResponse,
    Transaction // Import the Transaction type itself
} from '@/types';

// Define a type for the formatted, local-state transaction
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

// Define a type for the service's return value
interface GetSalesTransactionsResult {
    success: boolean;
    data?: FormattedSalesTransaction[];
    pages?: number;
    error?: string;
}

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

// Type for the upload function's return
interface UploadExcelResult {
    success: boolean;
    data?: TransactionDetailResponse['data']; // Reuse the data shape
    error?: string;
}

export async function uploadExcelForPreview(file: File): Promise<UploadExcelResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        // The response from process-excel is a full TransactionDetail object
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

interface CalculatePreviewResult {
    success: boolean;
    data?: KpiCalculationResponse['data'];
    error?: string;
}

export async function calculatePreview(payload: any): Promise<CalculatePreviewResult> {
    try {
        const result = await api.post<KpiCalculationResponse>('/api/calculate-preview', payload);

        if (result && result.success) {
            return { success: true, data: result.data };
        } else {
             return { success: false, error: result.error || 'Failed to calculate preview.' };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to connect to the server for preview calculation.' };
    }
}
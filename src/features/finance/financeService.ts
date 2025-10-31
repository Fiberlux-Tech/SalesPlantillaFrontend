// src/features/finance/financeService.ts
import { api } from '@/lib/api';
import type { 
    Transaction, 
    TransactionDetailResponse, 
    KpiCalculationResponse,
    BaseApiResponse,
    FinanceTransactionListResponse, // This is an alias for ApiListResponse<Transaction>
    FixedCost,
    RecurringService
} from '@/types';

// 1. Define the formatted type for the finance list
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

// 2. Define a clear return type for the list function
interface GetFinanceTransactionsResult {
    success: boolean;
    data?: FormattedFinanceTransaction[];
    pages?: number;
    error?: string;
}

/**
 * Fetches transactions for the Finance Dashboard.
 */
export async function getFinanceTransactions(page: number): Promise<GetFinanceTransactionsResult> {
    try {
        const result = await api.get<FinanceTransactionListResponse['data']>(`/api/transactions?page=${page}&per_page=30`); 
 
 
        // Data formatting logic moved here
        const formattedTransactions: FormattedFinanceTransaction[] = result.transactions.map((tx: Transaction) => ({
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
            pages: result.pages 
        };
 
 	} catch (error: any) {
        return { success: false, error: error.message || 'Failed to connect to the server.' };
 	}
}

// 3. Define a clear return type for the details function
type GetTransactionDetailsResult = {
    success: true;
    data: TransactionDetailResponse['data'];
} | {
    success: false;
    error: string;
}

/**
 * Fetches detailed data for a specific transaction by ID.
 */
export async function getTransactionDetails(transactionId: number): Promise<GetTransactionDetailsResult> {
    try {
        const result = await api.get<TransactionDetailResponse>(`/api/transaction/${transactionId}`);

        if (result.success) {
            return { success: true, data: result.data };
        } else {
            // Handle API-level error { success: false, error: '...' }
            return { success: false, error: result.error || 'Failed to fetch transaction details.' };
        }
    } catch (error: any) {
        // Handle network/exception-level error
        return { success: false, error: error.message || 'Failed to connect to the server.' };
    }
}


/**
 * Sends a command to approve or reject a transaction, optionally including modified data.
 */
export async function updateTransactionStatus(
    transactionId: number, 
    action: '
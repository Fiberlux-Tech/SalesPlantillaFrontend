// src/features/transactions/footers/FinancePreviewFooter.tsx
import type { Transaction, FixedCost, RecurringService } from '@/types';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext';

// --- PROPS INTERFACE (No change) ---
interface FinancePreviewFooterProps {
    onApprove: (transactionId: number, status: 'approve' | 'reject', modifiedData: Partial<Transaction>, fixedCosts: FixedCost[] | null, recurringServices: RecurringService[] | null) => void;
    onReject: (transactionId: number, status: 'approve' | 'reject', modifiedData: Partial<Transaction>, fixedCosts: FixedCost[] | null, recurringServices: RecurringService[] | null) => void;
    onCalculateCommission: (transactionId: number) => void;
}

export function FinancePreviewFooter({
    onApprove,
    onReject,
    onCalculateCommission
}: FinancePreviewFooterProps) {

    // --- 1. GET DATA FROM CONTEXT (Refactored) ---
    // We now get 'draftState' which contains all our draft data
    const {
        baseTransaction,
        draftState
    } = useTransactionPreview();

    // 2. Destructure the state we need from draftState
    const {
        liveEdits,
        currentFixedCosts,
        currentRecurringServices
    } = draftState;

    const tx = baseTransaction.transactions;
    const canModify = tx.ApprovalStatus === 'PENDING';

    // 3. Handlers now read from draftState variables
    const handleApproveClick = () => {
        if (window.confirm('¿Estás seguro/a de aprobar esta transacción?')) {
            const modifiedFields = { ...tx, ...liveEdits };
            // Pass the current draft state up to the parent handler
            onApprove(tx.id, 'approve', modifiedFields, currentFixedCosts, currentRecurringServices);
        }
    };

    const handleRejectClick = () => {
        if (window.confirm('¿Estás seguro/a de rechazar esta transacción?')) {
            const modifiedFields = { ...tx, ...liveEdits };
            // Pass the current draft state up to the parent handler
            onReject(tx.id, 'reject', modifiedFields, currentFixedCosts, currentRecurringServices);
        }
    };

    const handleCalculateCommissionClick = () => {
        if (window.confirm('¿Estás seguro/a de realizar el cálculo de comisión? Esto actualizará la base de datos.')) {
            onCalculateCommission(tx.id);
        }
    };

    return (
        <div className="flex justify-between items-center p-5 border-t bg-white space-x-3">
             <div className="flex-grow"></div> 
             <button
                onClick={handleCalculateCommissionClick}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                disabled={!canModify}
            >
                Comisiones
            </button>

            <button
                onClick={handleRejectClick}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                disabled={!canModify}
            >
                Rechazar
            </button>

            <button
                onClick={handleApproveClick}
                className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                disabled={!canModify}
            >
                Aprobar
            </button>
        </div>
    );
}
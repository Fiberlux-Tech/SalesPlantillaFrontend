// src/features/finance/components/FinancePreviewFooter.tsx
import type { Transaction, FixedCost, RecurringService } from '@/types'; // Import types
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext'; // <-- NEW IMPORT

// --- MODIFIED PROPS ---
// These props now expect the complex 5-argument function signature
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
    
    // --- GET DATA FROM CONTEXT ---
    // No longer needs 'tx' passed as a prop
    const {
        baseTransaction,
        liveEdits,
        editedFixedCosts,
        editedRecurringServices
    } = useTransactionPreview();
    
    const tx = baseTransaction.transactions;
    const canModify = tx.ApprovalStatus === 'PENDING';
    
    // These handlers now get the live data from context to pass up
    const handleApproveClick = () => {
        if (window.confirm('¿Estás seguro/a de aprobar esta transacción?')) {
            const modifiedFields = { ...tx, ...liveEdits };
            onApprove(tx.id, 'approve', modifiedFields, editedFixedCosts, editedRecurringServices);
        }
    };

    const handleRejectClick = () => {
        if (window.confirm('¿Estás seguro/a de rechazar esta transacción?')) {
            const modifiedFields = { ...tx, ...liveEdits };
            onReject(tx.id, 'reject', modifiedFields, editedFixedCosts, editedRecurringServices);
        }
    };

    const handleCalculateCommissionClick = () => {
        if (window.confirm('¿Estás seguro/a de realizar el cálculo de comisión? Esto actualizará la base de datos.')) {
            onCalculateCommission(tx.id);
        }
    };

    return (
        <div className="flex justify-end items-center p-5 border-t bg-white space-x-3">
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
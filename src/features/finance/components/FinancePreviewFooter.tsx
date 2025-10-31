// src/features/finance/components/FinancePreviewFooter.tsx
import type { Transaction } from '@/types'; // 1. Import the Transaction type

// 2. Define the props interface
interface FinancePreviewFooterProps {
    tx: Transaction; // Use the imported type
    onApprove: (transactionId: number) => void;
    onReject: (transactionId: number) => void;
    onCalculateCommission: (transactionId: number) => void;
}

export function FinancePreviewFooter({ 
    tx, 
    onApprove, 
    onReject, 
    onCalculateCommission 
}: FinancePreviewFooterProps) {
    
    const canModify = tx.ApprovalStatus === 'PENDING';
    
    // 3. Type event handlers
    const handleApproveClick = () => {
        if (window.confirm('¿Estás seguro/a de aprobar esta transacción?')) {
            onApprove(tx.id);
        }
    };

    const handleRejectClick = () => {
        if (window.confirm('¿Estás seguro/a de rechazar esta transacción?')) {
            onReject(tx.id);
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
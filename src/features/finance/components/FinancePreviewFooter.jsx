import React from 'react';

export function FinancePreviewFooter({ tx, onApprove, onReject, onCalculateCommission }) {
    
    // Core Immutability Check: Can only modify if status is 'PENDING'
    const canModify = tx.ApprovalStatus === 'PENDING';
    const statusText = tx.ApprovalStatus;
    
    // Handlers use window.confirm() as a final barrier before calling the backend service
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
            
            {/* Display message if modification is blocked */}
            <div className="flex-grow">
                 {!canModify && (
                    <p className="text-sm font-medium text-red-600">
                        La transaccion esta {statusText}. No se puede modificar de nuevo.
                    </p>
                 )}
            </div>

            {/* Recalculate Commission Button - Disabled if not PENDING */}
            <button 
                onClick={handleCalculateCommissionClick} 
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                disabled={!canModify} 
            >
                Recalculate Comisiones
            </button>
            
            {/* Reject Button - Disabled if not PENDING (relying on backend 400/403 for final check) */}
            <button 
                onClick={handleRejectClick} 
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                disabled={!canModify}
            >
                Reject
            </button>
            
            {/* Approve Button - Disabled if not PENDING (relying on backend 400/403 for final check) */}
            <button 
                onClick={handleApproveClick} 
                className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                disabled={!canModify}
            >
                Approve
            </button>
        </div>
    );
}

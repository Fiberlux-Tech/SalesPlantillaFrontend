// src/features/transactions/components/FinanceTransactionList.tsx
import React from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
// 1. Import the formatted type from the *new* service file
import type { FormattedFinanceTransaction } from '../transactionService';

// 2. Define the props interface
interface TransactionListProps {
    isLoading: boolean;
    transactions: FormattedFinanceTransaction[]; // Use the formatted type
    onRowClick: (transaction: FormattedFinanceTransaction) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: React.Dispatch<React.SetStateAction<number>>;
}

export function TransactionList({ 
    isLoading, 
    transactions, 
    onRowClick, 
    currentPage, 
    totalPages, 
    onPageChange 
}: TransactionListProps) {
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-center">Transaction ID</th>
                            <th scope="col" className="px-6 py-3 text-center">Unidad de Negocio</th>
                            <th scope="col" className="px-6 py-3 text-center">Cliente</th>
                            <th scope="col" className="px-6 py-3 text-center">Vendedor</th>
                            <th scope="col" className="px-6 py-3 text-center">MRC</th>
                            <th scope="col" className="px-6 py-3 text-center">Plazo de Contrato</th>
                            <th scope="col" className="px-6 py-3 text-center">Margen %</th>
                            <th scope="col" className="px-6 py-3 text-center">Payback (Meses)</th>
                            <th scope="col" className="px-6 py-3 text-center">Fecha</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={10} className="text-center py-4">Loading transactions...</td></tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr 
                                    key={tx.id} 
                                    className="bg-white border-b hover:bg-gray-50 cursor-pointer" 
                                    onClick={() => onRowClick(tx)} // 'tx' is now strongly typed
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900 text-center">{tx.id}</td>
                                    <td className="px-6 py-4 text-center">{tx.unidadNegocio}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900 text-center">{tx.clientName}</td>
                                    <td className="px-6 py-4 text-center">{tx.salesman}</td>
                                    <td className="px-6 py-4 text-center">{tx.MRC.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">{tx.plazoContrato}</td>
                                    <td className="px-6 py-4 font-medium text-blue-600 text-center">{`${(tx.grossMarginRatio * 100).toFixed(2)}%`}</td>
                                    <td className="px-6 py-4 text-center">{tx.payback}</td>
                                    <td className="px-6 py-4 text-center">{tx.submissionDate}</td>
                                    <td className="px-6 py-4 text-center"><StatusBadge status={tx.status} /></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center pt-4">
                <button
                    onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    Previo
                </button>
                <span className="text-sm text-gray-700">
                    Pagina {currentPage} de {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
        </>
    );
}
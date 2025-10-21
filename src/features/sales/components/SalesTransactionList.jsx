import React from 'react';
import StatusBadge from '../../../components/shared/StatusBadge'; // From shared components

export function SalesTransactionList({
    isLoading,
    transactions,
    currentPage,
    totalPages,
    onPageChange
}) {
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Transaction ID</th>
                            <th scope="col" className="px-6 py-3">Client</th>
                            <th scope="col" className="px-6 py-3">Salesman</th>
                            <th scope="col" className="px-6 py-3">Margin %</th>
                            <th scope="col" className="px-6 py-3">Payback (Months)</th>
                            <th scope="col" className="px-6 py-3">Submission Date</th>
                            <th scope="col" className="px-6 py-3">Approval Date</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="8" className="text-center py-4">Loading transactions...</td></tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                                    <td className="px-6 py-4 font-medium text-gray-900">{tx.id}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{tx.client}</td>
                                    <td className="px-6 py-4">{tx.salesman}</td>
                                    <td className="px-6 py-4 font-medium text-blue-600">{`${(tx.grossMarginRatio * 100).toFixed(2)}%`}</td>
                                    <td className="px-6 py-4">{tx.payback}</td>
                                    <td className="px-6 py-4">{tx.submissionDate}</td>
                                    <td className="px-6 py-4">{tx.approvalDate}</td>
                                    <td className="px-6 py-4"><StatusBadge status={tx.status} /></td>
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
                    Previous
                </button>
                <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </>
    );
}
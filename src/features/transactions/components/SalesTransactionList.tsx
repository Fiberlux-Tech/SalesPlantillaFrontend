// src/features/transactions/components/SalesTransactionList.tsx
import React from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { PaginatedTable, type ColumnDef } from '@/components/shared/PaginatedTable';
import { TableCell, TableRow } from '@/components/ui/table';
import type { FormattedSalesTransaction } from '../services/sales.service';

// 1. Define Columns
const columns: ColumnDef<FormattedSalesTransaction>[] = [
    { header: 'ID Transacción', className: 'px-6 py-3' },
    { header: 'Cliente', className: 'px-6 py-3' },
    { header: 'Vendedor', className: 'px-6 py-3' },
    { header: 'Margen %', className: 'px-6 py-3' },
    { header: 'Payback (Months)', className: 'px-6 py-3' },
    { header: 'Fecha Carga', className: 'px-6 py-3' },
    { header: 'Fecha Aprobación', className: 'px-6 py-3' },
    { header: 'Status', className: 'px-6 py-3' },
];

// 2. Define Props
interface SalesTransactionListProps {
    isLoading: boolean;
    transactions: FormattedSalesTransaction[];
    currentPage: number;
    totalPages: number;
    onPageChange: React.Dispatch<React.SetStateAction<number>>;
}

export function SalesTransactionList({
    transactions,
    ...props // Pass through isLoading, currentPage, totalPages, onPageChange
}: SalesTransactionListProps) {
    
    // 3. Define the specific row render function
    const renderRow = (tx: FormattedSalesTransaction) => (
        <TableRow key={tx.id} className="bg-white border-b hover:bg-gray-50">
            <TableCell className="px-6 py-4 font-medium text-gray-900">{tx.id}</TableCell>
            <TableCell className="px-6 py-4 font-bold text-gray-900">{tx.client}</TableCell>
            <TableCell className="px-6 py-4">{tx.salesman}</TableCell>
            <TableCell className="px-6 py-4 font-medium text-blue-600">{`${(tx.grossMarginRatio * 100).toFixed(2)}%`}</TableCell>
            <TableCell className="px-6 py-4">{tx.payback}</TableCell>
            <TableCell className="px-6 py-4">{tx.submissionDate}</TableCell>
            <TableCell className="px-6 py-4">{tx.approvalDate}</TableCell>
            <TableCell className="px-6 py-4"><StatusBadge status={tx.status} /></TableCell>
        </TableRow>
    );

    // 4. Render the generic table
    return (
        <PaginatedTable
            {...props}
            columns={columns}
            data={transactions}
            renderRow={renderRow}
            emptyStateMessage="No transactions found matching your criteria."
        />
    );
}
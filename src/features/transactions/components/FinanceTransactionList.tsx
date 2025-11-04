// src/features/transactions/components/FinanceTransactionList.tsx
import React from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { PaginatedTable, type ColumnDef } from '@/components/shared/PaginatedTable';
import { TableCell, TableRow } from '@/components/ui/table';
import type { FormattedFinanceTransaction } from '../services/finance.service';

// 1. Define Columns (Unchanged)
const columns: ColumnDef<FormattedFinanceTransaction>[] = [
    { header: 'ID', className: 'px-6 py-3 text-center' },
    { header: 'Unidad de Negocio', className: 'px-6 py-3 text-center' },
    { header: 'Cliente', className: 'px-6 py-3 text-center' },
    { header: 'Vendedor', className: 'px-6 py-3 text-center' },
    { header: 'MRC', className: 'px-6 py-3 text-center' },
    { header: 'Plazo', className: 'px-6 py-3 text-center' },
    { header: 'Margen %', className: 'px-6 py-3 text-center' },
    { header: 'Payback (Meses)', className: 'px-6 py-3 text-center' },
    { header: 'Fecha', className: 'px-6 py-3 text-center' },
    { header: 'Status', className: 'px-6 py-3 text-center' },
];

// 2. Define Props
interface TransactionListProps {
    isLoading: boolean;
    transactions: FormattedFinanceTransaction[];
    onRowClick: (transaction: FormattedFinanceTransaction) => void;
    currentPage: number;
    totalPages: number;
    // --- 1. PROP TYPE CHANGED ---
    // This now matches the new prop type
    onPageChange: (newPage: number) => void;
}

export function TransactionList({
    transactions,
    onRowClick,
    ...props // Pass through isLoading, currentPage, totalPages, onPageChange
}: TransactionListProps) {

    // 3. Define the specific row render function (Unchanged)
    const renderRow = (tx: FormattedFinanceTransaction) => (
        <TableRow
            key={tx.id}
            className="bg-white border-b hover:bg-gray-50 cursor-pointer"
            onClick={() => onRowClick(tx)}
        >
            <TableCell className="px-6 py-4 font-medium text-gray-900 text-center">{tx.id}</TableCell>
            <TableCell className="px-6 py-4 text-center">{tx.unidadNegocio}</TableCell>
            <TableCell className="px-6 py-4 font-bold text-gray-900 text-center">{tx.clientName}</TableCell>
            <TableCell className="px-6 py-4 text-center">{tx.salesman}</TableCell>
            <TableCell className="px-6 py-4 text-center">{tx.MRC.toLocaleString()}</TableCell>
            <TableCell className="px-6 py-4 text-center">{tx.plazoContrato}</TableCell>
            <TableCell className="px-6 py-4 font-medium text-blue-600 text-center">{`${(tx.grossMarginRatio * 100).toFixed(2)}%`}</TableCell>
            <TableCell className="px-6 py-4 text-center">{tx.payback}</TableCell>
            <TableCell className="px-6 py-4 text-center">{tx.submissionDate}</TableCell>
            <TableCell className="px-6 py-4 text-center"><StatusBadge status={tx.status} /></TableCell>
        </TableRow>
    );

    // 4. Render the generic table (Unchanged)
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
// src/features/transactions/components/SalesTransactionList.tsx
import StatusBadge from '@/features/transactions/components/StatusBadge';
import { PaginatedTable, type ColumnDef } from './PaginatedTable';
import { TableCell, TableRow } from '@/components/ui/table';
import type { FormattedSalesTransaction } from '../services/sales.service';

// 1. Define Columns (Unchanged)
const columns: ColumnDef<FormattedSalesTransaction>[] = [
    { header: 'ID Transacción', className: 'px-6 py-3' },
    // ... other columns
    { header: 'Status', className: 'px-6 py-3' },
];

// 2. Define Props
interface SalesTransactionListProps {
    isLoading: boolean;
    transactions: FormattedSalesTransaction[];
    currentPage: number;
    totalPages: number;
    // --- 1. PROP TYPE CHANGED ---
    onPageChange: (newPage: number) => void;
}

export function SalesTransactionList({
    transactions,
    ...props // Pass through isLoading, currentPage, totalPages, onPageChange
}: SalesTransactionListProps) {

    // 3. Define the specific row render function (Unchanged)
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
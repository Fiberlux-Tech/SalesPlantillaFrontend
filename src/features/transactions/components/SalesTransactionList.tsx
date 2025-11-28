// src/features/transactions/components/SalesTransactionList.tsx
import StatusBadge from '@/features/transactions/components/StatusBadge';
import { PaginatedTable, type ColumnDef } from './PaginatedTable';
import { TableCell, TableRow } from '@/components/ui/table';
import type { FormattedSalesTransaction } from '../services/sales.service';
import { UI_LABELS, EMPTY_STATE_MESSAGES } from '@/config';

// 1. Define Columns (Unchanged)
const columns: ColumnDef[] = [
    { header: UI_LABELS.ID_TRANSACCION, className: 'px-6 py-3' },
    { header: UI_LABELS.CLIENTE, className: 'px-6 py-3' },
    { header: UI_LABELS.VENDEDOR, className: 'px-6 py-3' },
    { header: UI_LABELS.MARGEN_PERCENT, className: 'px-6 py-3' },
    { header: UI_LABELS.PAYBACK_MESES, className: 'px-6 py-3' },
    { header: UI_LABELS.FECHA, className: 'px-6 py-3' },
    { header: UI_LABELS.FECHA_APROBACION, className: 'px-6 py-3' },
    { header: UI_LABELS.STATUS, className: 'px-6 py-3' },
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
            emptyStateMessage={EMPTY_STATE_MESSAGES.NO_TRANSACTIONS_FOUND}
        />
    );
}
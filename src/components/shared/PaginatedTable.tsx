// src/components/shared/PaginatedTable.tsx
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Define a type for our column definitions
export interface ColumnDef<T> {
    header: string;
    className?: string;
}

// Define the props for our generic table
interface PaginatedTableProps<T> {
    isLoading: boolean;
    columns: ColumnDef<T>[];
    data: T[];
    renderRow: (item: T) => React.ReactNode;
    emptyStateMessage?: string;
    currentPage: number;
    totalPages: number;
    // --- 1. PROP TYPE CHANGED ---
    // No longer a React.Dispatch. It's a simple callback.
    onPageChange: (newPage: number) => void;
}

export function PaginatedTable<T>({
    isLoading,
    columns,
    data,
    renderRow,
    emptyStateMessage = "No data available.",
    currentPage,
    totalPages,
    onPageChange,
}: PaginatedTableProps<T>) {

    const colSpan = columns.length;

    return (
        <>
            <div className="overflow-x-auto">
                <Table className="w-full text-sm text-left text-gray-500">
                    <TableHeader className="text-xs text-gray-700 uppercase bg-gray-50">
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead
                                    key={col.header}
                                    className={col.className}
                                >
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={colSpan} className="text-center py-4">
                                    Loading transactions...
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={colSpan} className="text-center py-4">
                                    {emptyStateMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map(renderRow)
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-4">
                <button
                    // --- 2. LOGIC UPDATED ---
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    Previo
                </button>
                <span className="text-sm text-gray-700">
                    Pagina {currentPage} de {totalPages}
                </span>
                <button
                    // --- 3. LOGIC UPDATED ---
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
        </>
    );
}
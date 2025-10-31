// src/features/masterdata/components/HistoryTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge'; 
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';
// FIX: Import the type from the single source of truth (masterDataService)
import type { HistoryItem as HistoryRecord } from '../masterDataService'; 


// 1. Removed local definition of HistoryRecord, using imported alias

// 2. Define the props interface
interface HistoryTableProps {
    isLoading: boolean;
    history: HistoryRecord[]; // This now correctly matches the imported type
}

// Utility to map category string to the new badge variant 
const getCategoryVariant = (category: string): VariantProps<typeof badgeVariants>['variant'] => {
    switch (category) {
        case 'Finance':
            return 'categoryFinance';
        case 'Sales':
            return 'categorySales';
        case 'Mayorista':
            return 'categoryMayorista';
        case 'Admin':
            return 'categoryAdmin';
        default:
            return 'categoryUser'; // Fallback
    }
};

const formatDate = (isoString: string): string => {
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString; // Use getTime() for invalid date check
        
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} | ${hh}:${min}`;
    } catch (e) {
        return isoString;
    }
};

// 3. Apply the props interface
export function HistoryTable({ isLoading, history }: HistoryTableProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-semibold mb-4">Update History</h2>
            <p className="text-sm text-gray-500 mb-6">Recent variable updates and changes</p>

            <div className="overflow-x-auto">
                {isLoading && history.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">Loading history...</p>
                ) : history.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No update history available.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="w-[120px]">Variable</TableHead>
                                <TableHead className="w-[100px]">Category</TableHead>
                                <TableHead className="text-right w-[80px]">Value</TableHead>
                                <TableHead className="text-center w-[150px]">Date Updated</TableHead>
                                <TableHead className="w-[150px]">User Updater</TableHead>
                                <TableHead className="w-[200px]">Comment</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((record, index) => (
                                <TableRow key={record.id || index} className="hover:bg-gray-50"> 
                                    <TableCell className="font-medium">{record.variable_name}</TableCell>
                                    <TableCell>
                                        <Badge variant={getCategoryVariant(record.category)}>
                                            {record.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{record.variable_value}</TableCell>
                                    <TableCell className="text-center text-xs">{formatDate(record.date_recorded)}</TableCell>
                                    <TableCell>{record.recorder_username}</TableCell>
                                    <TableCell className="text-sm max-w-xs truncate" title={record.comment || undefined}>{record.comment || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
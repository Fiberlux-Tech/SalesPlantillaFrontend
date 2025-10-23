import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Local helper component (should be extracted if used outside this module)
const CategoryBadge = ({ category }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full inline-flex items-center";
    const categoryClasses = {
        'Finance': "bg-blue-100 text-blue-800",
        'Sales': "bg-purple-100 text-purple-800",
        'Mayorista': "bg-green-100 text-green-800",
        'Admin': "bg-slate-100 text-slate-800",
    };
    return <span className={`${baseClasses} ${categoryClasses[category] || "bg-gray-100 text-gray-800"}`}>{category}</span>;
};

// Local date formatting utility (kept here as it's specific to the history table's format)
const formatDate = (isoString) => {
    try {
        const date = new Date(isoString);
        if (isNaN(date)) return isoString;
        
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


export function HistoryTable({ isLoading, history }) {
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
                                    <TableCell><CategoryBadge category={record.category} /></TableCell>
                                    <TableCell className="text-right font-mono">{record.variable_value}</TableCell>
                                    <TableCell className="text-center text-xs">{formatDate(record.date_recorded)}</TableCell>
                                    <TableCell>{record.recorder_username}</TableCell>
                                    <TableCell className="text-sm max-w-xs truncate" title={record.comment}>{record.comment || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
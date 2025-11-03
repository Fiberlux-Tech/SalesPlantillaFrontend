// src/components/shared/FixedCostsTable.tsx
import { formatCurrency, formatCellData } from '@/lib/formatters';
import { EditableTableCell } from '@/components/shared/EditableTableCell'; 
import { EditableCurrencyCell } from '@/components/shared/EditableCurrencyCell'; 
import type { FixedCost } from '@/types'; 
import type { ReactNode } from 'react';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext'; // <-- NEW IMPORT

// --- MODIFIED PROPS INTERFACE (REMOVED CONTEXT PROPS) ---
interface FixedCostsTableProps {
    EmptyStateComponent?: React.FC<{ canEdit: boolean }> | (() => ReactNode);
}

const FixedCostsTable = ({ EmptyStateComponent }: FixedCostsTableProps) => {
    
    // +++ GET PROPS FROM CONTEXT +++
    const {
        baseTransaction,
        currentFixedCosts, // This replaces 'data'
        canEdit,
        handleFixedCostChange
    } = useTransactionPreview();

    const data = currentFixedCosts; // Rename for minimal changes
    
    // +++ Create the onCostChange handler +++
    const onCostChange = (index: number, field: keyof FixedCost, value: any) => {
        handleFixedCostChange(index, field, value, baseTransaction);
    }

    if (!data || data.length === 0) {
        if (EmptyStateComponent) {
            return <EmptyStateComponent canEdit={canEdit} />; 
        }
        return <p className="text-center text-gray-500 py-4">No fixed cost data available.</p>;
    }
  
    return (
        <div className="overflow-x-auto bg-white rounded-lg">
            <table className="min-w-full text-sm divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                    {/* ... (table header is unchanged) ... */}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50">
                            {/* ... (other cells are unchanged) ... */}
                            
                            {/* This cell will now use the new onCostChange handler */}
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">
                                <EditableTableCell
                                    currentValue={item.periodo_inicio ?? 0}
                                    onConfirm={(newValue) => onCostChange(index, 'periodo_inicio', newValue)}
                                    canEdit={canEdit}
                                    min={0}
                                />
                            </td>
                            {/* This cell will now use the new onCostChange handler */}
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">
                                <EditableTableCell
                                    currentValue={item.duracion_meses ?? 1}
                                    onConfirm={(newValue) => onCostChange(index, 'duracion_meses', newValue)}
                                    canEdit={canEdit}
                                    min={1}
                                />
                            </td>
                            {/* This cell will now use the new onCostChange handler */}
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">
                                <EditableCurrencyCell
                                    currentValue={item.costo_currency ?? 'USD'}
                                    onConfirm={(newValue) => onCostChange(index, 'costo_currency', newValue)}
                                    canEdit={canEdit}
                                />
                            </td>
                            
                            {/* ... (other cells are unchanged) ... */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FixedCostsTable;
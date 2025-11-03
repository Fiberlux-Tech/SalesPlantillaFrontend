// src/components/shared/RecurringServicesTable.tsx
import { EditableCurrencyCell } from '@/components/shared/EditableCurrencyCell'; 
import type { RecurringService } from '@/types';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext'; // <-- NEW IMPORT

// --- REMOVED PROPS INTERFACE ---

const RecurringServicesTable = () => {

    // +++ GET PROPS FROM CONTEXT +++
    const {
        baseTransaction,
        currentRecurringServices, // This replaces 'data'
        canEdit,
        handleRecurringServiceChange
    } = useTransactionPreview();

    const data = currentRecurringServices; // Rename
    
    // +++ Create the onServiceChange handler +++
    const onServiceChange = (index: number, field: keyof RecurringService, value: any) => {
        handleRecurringServiceChange(index, field, value, baseTransaction);
    }

    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500 py-4">No recurring services data available.</p>;
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg">
            <table className="w-full text-sm divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                    {/* ... (table header is unchanged) ... */}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50">
                            {/* ... (other cells are unchanged) ... */}

                            {/* This cell will now use the new onServiceChange handler */}
                            <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                                <EditableCurrencyCell
                                    currentValue={item.p_currency ?? 'PEN'}
                                    onConfirm={(newValue) => onServiceChange(index, 'p_currency', newValue)}
                                    canEdit={canEdit}
                                />
                            </td>
                            
                            {/* ... (other cells are unchanged) ... */}

                             {/* This cell will now use the new onServiceChange handler */}
                            <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                                <EditableCurrencyCell
                                    currentValue={item.cu_currency ?? 'USD'}
                                    onConfirm={(newValue) => onServiceChange(index, 'cu_currency', newValue)}
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

export default RecurringServicesTable;
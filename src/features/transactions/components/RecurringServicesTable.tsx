// src/components/shared/RecurringServicesTable.tsx
import { EditableCurrencyCell } from '@/features/transactions/components/EditableCurrencyCell';
import type { RecurringService } from '@/types';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext';
import { formatCurrency, formatCellData } from '@/lib/formatters';
import type { ReactNode } from 'react';
import { CURRENCIES, UI_LABELS, EMPTY_STATE_MESSAGES } from '@/config';

interface RecurringServicesTableProps {
    EmptyStateComponent?: React.FC<{ canEdit: boolean }> | (() => ReactNode);
}

const RecurringServicesTable = ({ EmptyStateComponent }: RecurringServicesTableProps) => {

    // 1. Get dispatch and draftState from the context
    const {
        canEdit,
        draftState, // Get the draft state
        dispatch    // Get the dispatch function
    } = useTransactionPreview();

    // 2. Get the services from the draftState
    const data = draftState.currentRecurringServices;

    // 3. The onServiceChange handler now uses dispatch
    const onServiceChange = (index: number, field: keyof RecurringService, value: any) => {
        // No longer needs baseTransaction, just dispatch the action
        dispatch({
            type: 'UPDATE_RECURRING_SERVICE',
            payload: { index, field, value }
        });
    }

    if (!data || data.length === 0) {
        if (EmptyStateComponent) {
            // Use the passed-in empty state
            return <EmptyStateComponent canEdit={canEdit} />;
        }
        return <p className="text-center text-gray-500 py-4">{EMPTY_STATE_MESSAGES.NO_RECURRING_SERVICES}</p>;
    }

    // 4. The entire JSX render tree remains UNCHANGED
    return (
        <div className="overflow-x-auto bg-white rounded-lg">
            <table className="w-full text-sm divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                    {/* --- THIS SECTION WAS COMMENTED OUT --- */}
                    <tr>
                        <th scope="col" className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.TIPO_SERVICIO}</th>
                        <th scope="col" className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.UBICACION}</th>
                        <th scope="col" className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.Q}</th>
                        <th scope="col" className="w-24 px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.P}</th>
                        <th scope="col" className="w-24 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.MONEDA}</th>
                        <th scope="col" className="w-28 px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.INGRESO}</th>
                        <th scope="col" className="w-24 px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.CU1}</th>
                        <th scope="col" className="w-24 px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.CU2}</th>
                        <th scope="col" className="w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.PROVEEDOR}</th>
                        <th scope="col" className="w-24 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.MONEDA}</th>
                        <th scope="col" className="w-28 px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.EGRESO}</th>
                    </tr>
                    {/* --- END OF FIX --- */}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                        <tr key={`recurring-service-${item.id}-${index}`} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-800 align-middle whitespace-nowrap">{formatCellData(item.tipo_servicio)}</td>
                            <td className="px-3 py-2 text-gray-800 align-middle truncate"title={item.ubicacion || undefined}>{formatCellData(item.ubicacion)}</td>
                            <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">{formatCellData(item.Q)}</td>
                            <td className="px-3 py-2 text-gray-800 align-middle text-right whitespace-nowrap">{formatCurrency(item.P)}</td>

                            <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                                <EditableCurrencyCell
                                    currentValue={item.p_currency ?? CURRENCIES.DEFAULT_RECURRING_P}
                                    onConfirm={(newValue) => onServiceChange(index, 'p_currency', newValue)}
                                    canEdit={canEdit}
                                />
                            </td>

                            <td className="px-3 py-2 text-green-600 font-medium align-middle text-right whitespace-nowrap">{formatCurrency(item.ingreso)}</td>
                            <td className="px-3 py-2 text-gray-800 align-middle text-right whitespace-nowrap">{formatCurrency(item.CU1)}</td>
                            <td className="px-3 py-2 text-gray-800 align-middle text-right whitespace-nowrap">{formatCurrency(item.CU2)}</td>
                            <td className="px-3 py-2 text-gray-800 align-middle whitespace-nowrap">{formatCellData(item.proveedor)}</td>

                            <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                                <EditableCurrencyCell
                                    currentValue={item.cu_currency ?? CURRENCIES.DEFAULT_RECURRING_CU}
                                    onConfirm={(newValue) => onServiceChange(index, 'cu_currency', newValue)}
                                    canEdit={canEdit}
                                />
                            </td>

                            <td className="px-3 py-2 text-red-600 font-medium align-middle text-right whitespace-nowrap">{formatCurrency(item.egreso)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecurringServicesTable;
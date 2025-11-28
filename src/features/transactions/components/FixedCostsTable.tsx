// src/components/shared/FixedCostsTable.tsx
import { useState } from 'react';
import { EditableTableCell } from '@/features/transactions/components/EditableTableCell';
import type { FixedCost } from '@/types';
import type { ReactNode } from 'react';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext';
import { formatCurrency, formatCellData } from '@/lib/formatters';
import { UI_LABELS, EMPTY_STATE_MESSAGES } from '@/config';
import { TableActionIcons } from '@/components/shared/TableActionIcons';
import { FixedCostDetailModal } from '@/features/transactions/components/FixedCostDetailModal';

interface FixedCostsTableProps {
    EmptyStateComponent?: React.FC<{ canEdit: boolean }> | (() => ReactNode);
}

const FixedCostsTable = ({ EmptyStateComponent }: FixedCostsTableProps) => {

    // 1. Get dispatch and draftState from the context
    const {
        canEdit,
        draftState, // Get the draft state
        dispatch    // Get the dispatch function
    } = useTransactionPreview();

    // 2. Get the costs from the draftState
    const data = draftState.currentFixedCosts;

    // 3. The onCostChange handler now uses dispatch
    const onCostChange = (index: number, field: keyof FixedCost, value: any) => {
        // No longer needs baseTransaction, just dispatch the action
        dispatch({
            type: 'UPDATE_FIXED_COST',
            payload: { index, field, value }
        });
    }

    // 4. Handler to delete fixed cost
    const handleDeleteCost = (cost: FixedCost) => {
        if (window.confirm(`¿Estás seguro de eliminar el costo "${cost.tipo_servicio}" (Ticket: ${cost.ticket})?`)) {
            dispatch({
                type: 'REMOVE_FIXED_COST',
                payload: cost.ticket
            });
        }
    };

    if (!data || data.length === 0) {
        if (EmptyStateComponent) {
            return <EmptyStateComponent canEdit={canEdit} />;
        }
        return <p className="text-center text-gray-500 py-4">{EMPTY_STATE_MESSAGES.NO_FIXED_COSTS}</p>;
    }

    // 4. The entire JSX render tree remains UNCHANGED
    return (
        <div className="overflow-x-auto bg-white rounded-lg">
            <table className="min-w-full text-sm divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="w-40 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.TIPO_SERVICIO}</th>
                        <th scope="col" className="w-32 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.TICKET}</th>
                        <th scope="col" className="w-24 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.INICIO}</th>
                        <th scope="col" className="w-24 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.DURACION}</th>
                        <th scope="col" className="w-32 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.TOTAL_USD}</th>
                        <th scope="col" className="w-28 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{UI_LABELS.ACCIONES}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                        <tr key={`fixed-cost-${item.id}-${index}`} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800">{formatCellData(item.tipo_servicio)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800">{formatCellData(item.ticket)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">
                                <EditableTableCell
                                    currentValue={item.periodo_inicio ?? 0}
                                    onConfirm={(newValue) => onCostChange(index, 'periodo_inicio', newValue)}
                                    canEdit={canEdit}
                                    min={0}
                                />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">
                                <EditableTableCell
                                    currentValue={item.duracion_meses ?? 1}
                                    onConfirm={(newValue) => onCostChange(index, 'duracion_meses', newValue)}
                                    canEdit={canEdit}
                                    min={1}
                                />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-red-600 font-medium text-right">{formatCurrency(item.total)}</td>
                            <td className="px-4 py-2 align-middle">
                                <TableActionIcons
                                    onView={() => {/* TODO: Implement view functionality */}}
                                    onEdit={() => {/* TODO: Implement edit functionality */}}
                                    onDelete={canEdit ? () => handleDeleteCost(item) : undefined}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FixedCostsTable;
// src/components/shared/FixedCostsTable.tsx
import { EditableTableCell } from '@/components/shared/EditableTableCell'; 
import { EditableCurrencyCell } from '@/components/shared/EditableCurrencyCell'; 
import type { FixedCost } from '@/types'; 
import type { ReactNode } from 'react';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext';
import { formatCurrency, formatCellData } from '@/lib/formatters'; // <-- Import formatters

interface FixedCostsTableProps {
    EmptyStateComponent?: React.FC<{ canEdit: boolean }> | (() => ReactNode);
}

const FixedCostsTable = ({ EmptyStateComponent }: FixedCostsTableProps) => {
    
    const {
        baseTransaction,
        currentFixedCosts, 
        canEdit,
        handleFixedCostChange
    } = useTransactionPreview();

    const data = currentFixedCosts;
    
    const onCostChange = (index: number, field: keyof FixedCost, value: any) => {
        handleFixedCostChange(index, field, value, baseTransaction);
    }

    if (!data || data.length === 0) {
        if (EmptyStateComponent) {
            // Pass canEdit to the EmptyStateComponent
            return <EmptyStateComponent canEdit={canEdit} />; 
        }
        return <p className="text-center text-gray-500 py-4">No fixed cost data available.</p>;
    }
  
    return (
        <div className="overflow-x-auto bg-white rounded-lg">
            <table className="min-w-full text-sm divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                    {/* --- THIS SECTION WAS COMMENTED OUT --- */}
                    <tr>
                        <th scope="col" className="w-32 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                        <th scope="col" className="w-40 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Servicio</th>
                        <th scope="col" className="w-32 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                        <th scope="col" className="w-40 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                        <th scope="col" className="w-20 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th scope="col" className="w-28 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Unitario</th>
                        <th scope="col" className="w-24 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio (Mes)</th>
                        <th scope="col" className="w-24 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Duración (Meses)</th>
                        <th scope="col" className="w-24 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Moneda</th>
                        <th scope="col" className="w-28 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                    {/* --- END OF FIX --- */}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800">{formatCellData(item.categoria)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800">{formatCellData(item.tipo_servicio)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800">{formatCellData(item.ticket)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800">{formatCellData(item.ubicacion)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">{formatCellData(item.cantidad)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-right">{formatCurrency(item.costoUnitario)}</td>
                            
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
                            <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">
                                <EditableCurrencyCell
                                    currentValue={item.costo_currency ?? 'USD'}
                                    onConfirm={(newValue) => onCostChange(index, 'costo_currency', newValue)}
                                    canEdit={canEdit}
                                />
                            </td>
                            
                            <td className="px-4 py-2 whitespace-nowrap text-red-600 font-medium text-right">{formatCurrency(item.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FixedCostsTable;
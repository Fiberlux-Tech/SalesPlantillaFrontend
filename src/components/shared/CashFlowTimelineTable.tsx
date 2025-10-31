// src/components/shared/CashFlowTimelineTable.tsx
import type { ReactNode } from 'react'; // FIX: Import type explicitly
import type { CashFlowTimeline } from '@/types';

// 2. Define the props interface
interface CashFlowTimelineTableProps {
    timeline: CashFlowTimeline | null | undefined;
}

// A local formatter that shows '0.00' instead of '-' for zero values
const formatFlowValue = (value: number | string | null | undefined): string => {
    const numValue = parseFloat(value as string);
    if (!numValue || isNaN(numValue) || numValue === 0) {
        return '-';
    }
    return numValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const isRowEmpty = (values: number[] | null | undefined): boolean => {
    if (!values || values.length === 0) {
        return true;
    }
    return !values.some(val => val); // true if *no* value is truthy (not 0)
};

const CashFlowTimelineTable = ({ timeline }: CashFlowTimelineTableProps) => { // 3. Apply props
    if (!timeline || !timeline.periods) {
        return <p className="text-center text-gray-500 py-4">No cash flow data available.</p>;
    }

    const {
        periods = [],
        revenues,
        expenses,
        net_cash_flow = []
    } = timeline;

    /**
     * Renders a single row in the timeline table.
     */
    // 4. Type the helper function's parameters
    const renderRow = (
        title: string, 
        values: number[], 
        isNegative = false, 
        isBold = false, 
        isIndented = false
    ): ReactNode => { // 5. Define return type (FIX: Use imported type)
        
        const formattedValues = values.map(formatFlowValue); 
        
        return (
            <tr className={isBold ? "bg-gray-100" : ""}>
                <td className={`py-2 text-left text-xs whitespace-nowrap 
                    ${isBold ? "font-bold text-gray-800 px-3" : "font-medium text-gray-600"} 
                    ${isIndented ? "pl-6 pr-3" : "px-3"}`}
                >
                    {title}
                </td>
                
                {formattedValues.map((formattedValue, index) => {
                    const numValue = parseFloat(values[index] as any);
                    const isZero = formattedValue === '-';
                    
                    const colorClass = isZero
                        ? "text-gray-500"
                        : isBold
                            ? (numValue < 0 ? "text-red-600 font-bold" : "text-black font-bold")
                            : isNegative
                                ? "text-red-600"
                                : "text-green-600";
                    
                    return (
                        <td key={index} className={`px-3 py-2 text-right text-xs whitespace-nowrap font-mono ${colorClass}`}>
                            {formattedValue}
                        </td>
                    );
                })}
            </tr>
        );
    };

    return (
        <div className="overflow-x-auto bg-white rounded-lg">
            <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="w-40 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Flujo de Caja
                        </th>
                        {periods.map(period => (
                            <th 
                                key={period}
                                className="w-24 px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {period}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* Revenues */}
                    {revenues?.nrc && !isRowEmpty(revenues.nrc) && 
                        renderRow('Ingreso (NRC)', revenues.nrc, false)}
                        
                    {revenues?.mrc && !isRowEmpty(revenues.mrc) && 
                        renderRow('Ingreso (MRC)', revenues.mrc, false)}
                    
                    {/* Expenses */}
                    {expenses?.comisiones && !isRowEmpty(expenses.comisiones) && 
                        renderRow('Egreso (Comisiones)', expenses.comisiones, true)}
                        
                    {expenses?.egreso && !isRowEmpty(expenses.egreso) && 
                        renderRow('Egreso (Recurrente)', expenses.egreso, true)}
                    
                    {/* Fixed Costs (Loop) */}
                    {expenses?.fixed_costs && expenses.fixed_costs.map((cost) => (
                        !isRowEmpty(cost.timeline_values) && 
                            renderRow(
                                cost.tipo_servicio || cost.categoria || `Costo Fijo (ID ${cost.id})`,
                                cost.timeline_values,
                                true,  // isNegative
                                false, // isBold
                                true   // isIndented
                            )
                    ))}

                    {/* Net Cash Flow (Always show this row) */}
                    {net_cash_flow.length > 0 && 
                        renderRow('Net Cash Flow', net_cash_flow, false, true)}
                </tbody>
            </table>
        </div>
    );
};

export default CashFlowTimelineTable;
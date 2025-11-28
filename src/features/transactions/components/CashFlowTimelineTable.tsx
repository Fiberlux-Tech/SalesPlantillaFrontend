// src/components/shared/CashFlowTimelineTable.tsx
import type { ReactNode } from 'react';
import type { CashFlowTimeline } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { UI_LABELS, EMPTY_STATE_MESSAGES } from '@/config';

// Define the props interface
interface CashFlowTimelineTableProps {
    timeline: CashFlowTimeline | null | undefined;
}

const isRowEmpty = (values: number[] | null | undefined): boolean => {
    if (!values || values.length === 0) {
        return true;
    }
    return !values.some(val => val); // true if *no* value is truthy (not 0)
};

const CashFlowTimelineTable = ({ timeline }: CashFlowTimelineTableProps) => {
    if (!timeline || !timeline.periods) {
        return <p className="text-center text-gray-500 py-4">{EMPTY_STATE_MESSAGES.NO_CASH_FLOW}</p>;
    }

    const {
        periods = [],
        revenues,
        expenses,
        net_cash_flow = []
    } = timeline;

    // Calculate total investment by aggregating all fixed costs
    const totalInversion = periods.map((_, periodIndex) => {
        if (!expenses?.fixed_costs || expenses.fixed_costs.length === 0) {
            return 0;
        }
        return expenses.fixed_costs.reduce((sum, cost) => {
            const value = cost.timeline_values?.[periodIndex] || 0;
            return sum + value;
        }, 0);
    });

    /**
     * Renders a single row in the timeline table.
     */
    const renderRow = (
        title: string,
        values: number[],
        isNegative = false,
        isBold = false,
        isIndented = false
    ): ReactNode => {

        const formattedValues = values.map(val => formatCurrency(val, { decimals: 0 }));

        return (
            <tr className={isBold ? "bg-gray-100" : ""}>
                <td className={`py-2 text-left text-xs whitespace-nowrap
                    ${isBold ? "font-bold text-gray-800 px-3" : "font-medium text-gray-600"}
                    ${isIndented ? "pl-6 pr-3" : "px-3"}`}
                >
                    {title}
                </td>

                {formattedValues.map((formattedValue, index) => {
                    const numValue = typeof values[index] === 'number' ? values[index] : parseFloat(String(values[index]));
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
                            {UI_LABELS.FLUJO_CAJA}
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
                    {/* Ingresos */}
                    {revenues?.nrc && !isRowEmpty(revenues.nrc) &&
                        renderRow('Ingreso (NRC)', revenues.nrc, false)}

                    {revenues?.mrc && !isRowEmpty(revenues.mrc) &&
                        renderRow('Ingreso (MRC)', revenues.mrc, false)}

                    {/* Costos (formerly Egreso Recurrente) */}
                    {expenses?.egreso && !isRowEmpty(expenses.egreso) &&
                        renderRow('Costos', expenses.egreso, true)}

                    {/* Inversion (aggregated fixed costs) */}
                    {!isRowEmpty(totalInversion) &&
                        renderRow('Inversión', totalInversion, true)}

                    {/* Otros (formerly Comisiones) */}
                    {expenses?.comisiones && !isRowEmpty(expenses.comisiones) &&
                        renderRow('Otros', expenses.comisiones, true)}

                    {/* Net Cash Flow (Always show this row) */}
                    {net_cash_flow.length > 0 &&
                        renderRow(UI_LABELS.NET_CASH_FLOW, net_cash_flow, false, true)}
                </tbody>
            </table>
        </div>
    );
};

export default CashFlowTimelineTable;

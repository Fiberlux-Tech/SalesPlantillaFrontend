import React from 'react';

// A local formatter that shows '0.00' instead of '-' for zero values
const formatFlowValue = (value) => {
    const numValue = parseFloat(value);
    // Check for 0, null, undefined, or NaN
    if (!numValue || isNaN(numValue) || numValue === 0) {
        return '-';
    }
    return numValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const isRowEmpty = (values) => {
    if (!values || values.length === 0) {
        return true;
    }
    // .some() returns true if *any* value is truthy (not 0, null, undefined)
    // We return the inverse: true if *no* value is truthy.
    return !values.some(val => val); 
};

const CashFlowTimelineTable = ({ timeline }) => {
    if (!timeline || !timeline.periods) {
        return <p className="text-center text-gray-500 py-4">No cash flow data available.</p>;
    }

    const {
        periods = [],
        revenues = {},
        expenses = {},
        net_cash_flow = []
    } = timeline;

    /**
     * Renders a single row in the timeline table.
     * @param {string} title - The title for the row header.
     * @param {Array<number>} values - The array of numbers for the periods.
     * @param {boolean} [isNegative=false] - Are these values expenses (for color)?
     * @param {boolean} [isBold=false] - Should this row be bold (for NCF)?
     * @param {boolean} [isIndented=false] - Should the title be indented (for fixed costs)?
     */
    const renderRow = (title, values, isNegative = false, isBold = false, isIndented = false) => {
        // Format all values *before* rendering
        const formattedValues = values.map(formatFlowValue); 
        
        return (
            <tr className={isBold ? "bg-gray-100" : ""}>
                {/* Title Cell: Apply indentation if needed */}
                <td className={`py-2 text-left text-xs whitespace-nowrap 
                    ${isBold ? "font-bold text-gray-800 px-3" : "font-medium text-gray-600"} 
                    ${isIndented ? "pl-6 pr-3" : "px-3"}`}
                >
                    {title}
                </td>
                
                {/* Value Cells */}
                {formattedValues.map((formattedValue, index) => {
                    const numValue = parseFloat(values[index]);
                    const isZero = formattedValue === '-';
                    
                    // Determine color logic
                    const colorClass = isZero
                        ? "text-gray-500" // Always neutral gray for "-"
                        : isBold
                            ? (numValue < 0 ? "text-red-600 font-bold" : "text-black font-bold") // NCF logic
                            : isNegative
                                ? "text-red-600" // Expenses
                                : "text-green-600"; // Revenues
                    
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
                    {/* --- MODIFIED: Rows are now conditionally rendered --- */}

                    {/* Revenues */}
                    {revenues.nrc && !isRowEmpty(revenues.nrc) && 
                        renderRow('Ingreso (NRC)', revenues.nrc, false)}
                        
                    {revenues.mrc && !isRowEmpty(revenues.mrc) && 
                        renderRow('Ingreso (MRC)', revenues.mrc, false)}
                    
                    {/* Expenses */}
                    {expenses.comisiones && !isRowEmpty(expenses.comisiones) && 
                        renderRow('Egreso (Comisiones)', expenses.comisiones, true)}
                        
                    {expenses.egreso && !isRowEmpty(expenses.egreso) && 
                        renderRow('Egreso (Recurrente)', expenses.egreso, true)}
                    
                    {/* Fixed Costs (Loop) */}
                    {expenses.fixed_costs && expenses.fixed_costs.map((cost, index) => (
                        // Conditionally render *each* fixed cost row
                        !isRowEmpty(cost.timeline_values) && 
                            renderRow(
                                cost.tipo_servicio || cost.categoria || `Costo Fijo (ID ${cost.id})`,
                                cost.timeline_values,
                                true,  // isNegative = true
                                false, // isBold = false
                                true   // isIndented = true
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
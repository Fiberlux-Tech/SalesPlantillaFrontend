import React from 'react';

const KpiCard = ({ title, value, subtext, isNegative = false }) => {
    const displayValue = value === null || value === undefined ? 'N/A' : value;
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${isNegative ? 'text-red-600' : 'text-gray-800'}`}>{displayValue}</p>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
    );
}

export default KpiCard;
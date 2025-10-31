import React from 'react';

const KpiCard = ({ title, value, subtext, currency, isNegative = false }) => {
    const displayValue = value === null || value === undefined ? 'N/A' : value;
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
            
            {/* --- MODIFIED --- */}
            {/* The value is now in a flex container to align the currency */}
            <div className="flex items-baseline mt-1">
                <p className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-gray-800'}`}>
                    {displayValue}
                </p>
                {/* NEW: Render the currency label with the requested styling */}
                {currency && (
                    <span className="text-lg font-normal text-gray-400 ml-1.5">
                        ({currency})
                    </span>
                )}
            </div>
            
            {/* Subtext remains the same */}
            <p className="text-xs text-gray-400 mt-1">{subtext || '\u00A0'}</p>
        </div>
    );
}

export default KpiCard;
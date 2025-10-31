import React from 'react';

const KpiCard = ({ title, value, subtext, isNegative = false }) => {
    const displayValue = value === null || value === undefined ? 'N/A' : value;
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${isNegative ? 'text-red-600' : 'text-gray-800'}`}>{displayValue}</p>
            
            {/* MODIFIED: 
              We now always render the <p> tag. If 'subtext' is empty,
              we render a non-breaking space ('\u00A0') to force the 
              element to take up vertical space and align all cards.
            */}
            <p className="text-xs text-gray-400 mt-1">{subtext || '\u00A0'}</p>
        </div>
    );
}

export default KpiCard;
// src/components/StatsCard.jsx

import React from 'react';

function StatsCard({ title, value, icon, iconBgColor }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}>{icon}</div>
            <div className="ml-4">
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

export default StatsCard;
import React from 'react';

function StatusBadge({ status }) {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
    const statusClasses = {
        PENDING: "bg-yellow-100 text-yellow-800",
        APPROVED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
}

export default StatusBadge;
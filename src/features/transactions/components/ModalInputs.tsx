import React from 'react';

export const NumberInput: React.FC<{
    value: number;
    onChange: (value: number) => void;
    label: string;
    step?: string;
}> = ({ value, onChange, label, step = "0.01" }) => (
    <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-full text-2xl font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            step={step}
        />
    </div>
);

export const TextInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    label: string;
    className?: string;
}> = ({ value, onChange, label, className = "col-span-2" }) => (
    <div className={className}>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-xl font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
    </div>
);

export const CurrencySelect: React.FC<{
    value: "PEN" | "USD";
    onChange: (value: "PEN" | "USD") => void;
}> = ({ value, onChange }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value as "PEN" | "USD")}
        className="text-base font-medium text-gray-600 ml-1 border border-gray-300 rounded px-1 focus:ring-2 focus:ring-blue-500"
    >
        <option value="PEN">PEN</option>
        <option value="USD">USD</option>
    </select>
);

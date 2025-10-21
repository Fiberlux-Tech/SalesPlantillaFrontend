import React from 'react';

// Renamed from Card to ModuleCard for clarity
export const ModuleCard = ({ module, onNavigate }) => {
    return (
        <div
            className="hover:shadow-lg transition-shadow cursor-pointer bg-white rounded-lg border border-slate-200"
            onClick={() => onNavigate(module.id)}
        >
            <div className="p-8">
                <div className="flex items-start gap-4">
                    <div className="text-5xl">{module.icon}</div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900">{module.name}</h3>
                        <p className="text-slate-600 text-sm mt-2">{module.description}</p>
                        <button
                            tabIndex="-1" // Makes the button not focusable, as the parent handles the click
                            className="mt-4 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800"
                        >
                            Open Module
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
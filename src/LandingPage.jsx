// src/LandingPage.jsx
import React from 'react';

// --- Card Component ---
const Card = ({ module, onNavigate }) => {
    return (
        <div
            className="hover:shadow-lg transition-shadow cursor-pointer bg-white rounded-lg border border-slate-200"
            onClick={() => onNavigate(module.id)}
        >
            <div className="p-8">
                <div className="flex items-start gap-4">
                    {/* Using an emoji for the icon as shown in the example */}
                    <div className="text-5xl">{module.icon}</div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900">{module.name}</h3>
                        <p className="text-slate-600 text-sm mt-2">{module.description}</p>
                        {/* The button is primarily a visual cue since the whole card is clickable */}
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


// --- Main LandingPage Component ---
export default function LandingPage({ user, onNavigate }) {
    // Determine access based on role, same logic as before
    const isSales = user.role === 'SALES' || user.role === 'ADMIN';
    const isFinance = user.role === 'FINANCE' || user.role === 'ADMIN';

    // The modules the user has access to, now with emoji icons
    const availableModules = [
        { id: 'sales', name: 'Sales Deal Portal', icon: '📝', description: 'Submit and track your deal proposals.', available: isSales },
        { id: 'finance', name: 'Finance Dashboard', icon: '📊', description: 'Review and approve financial projections.', available: isFinance }
    ].filter(module => module.available);

    return (
        // The main container sets the background for the entire content area
        <div>
            {/* Main Content Area - now entirely on the bg-slate-50 background */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-slate-900">Available Modules</h2>
                    <p className="text-slate-600 text-sm mt-1">Select a module to get started</p>
                </div>

                {/* Module Cards Grid */}
                {availableModules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {availableModules.map((module) => (
                            <Card
                                key={module.id}
                                module={module}
                                onNavigate={onNavigate}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-600">No modules available for your role ({user.role})</p>
                    </div>
                )}
            </div>
        </div>
    );
}
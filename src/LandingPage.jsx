import React from 'react';
import { FileTextIcon, DollarSignIcon } from './components/Icons';

// This is the card for selecting a module (no changes)
function ModuleCard({ title, description, icon, onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out text-left w-full"
        >
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 bg-gray-800 p-4 rounded-full">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <p className="text-gray-600 mt-1">{description}</p>
                </div>
            </div>
        </button>
    );
}

// The component is now just the content area
export default function LandingPage({ user, onNavigate }) {
    return (
        <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome, {user.username}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                
                {/* Show Sales Module */}
                {(user.role === 'SALES' || user.role === 'ADMIN') && (
                    <ModuleCard
                        title="Deal Approval Portal"
                        description="Submit and track your deal proposals."
                        icon={<FileTextIcon color="white" />}
                        onClick={() => onNavigate('sales')}
                    />
                )}

                {/* Show Finance Module */}
                {(user.role === 'FINANCE' || user.role === 'ADMIN') && (
                    <ModuleCard
                        title="Finance Dashboard"
                        description="Review and approve submitted deals."
                        icon={<DollarSignIcon color="white" />}
                        onClick={() => onNavigate('finance')}
                    />
                )}
            </div>
        </div>
    );
}
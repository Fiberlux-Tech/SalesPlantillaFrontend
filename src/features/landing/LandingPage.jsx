// src/features/landing/LandingPage.jsx
import React from 'react';
import { ModuleCard } from './components/ModuleCard'; // <-- IMPORT the new component

// --- Main LandingPage Component ---
export default function LandingPage({ user, onNavigate }) {
    // 1. Define access based on roles
    const isSales = user.role === 'SALES' || user.role === 'ADMIN';
    const isFinance = user.role === 'FINANCE' || user.role === 'ADMIN';
    const isAdmin = user.role === 'ADMIN';

    // The modules the user has access to, now with emoji icons
    const availableModules = [
        { id: 'sales', name: 'Sales Deal Portal', icon: '📝', description: 'Submit and track your deal proposals.', available: isSales },
        { id: 'finance', name: 'Finance Dashboard', icon: '📊', description: 'Review and approve financial projections.', available: isFinance },
        { id: 'admin-management', name: 'Permission Management', icon: '🔒', description: 'Manage users, roles, and module assignments.', available: isAdmin }
    ].filter(module => module.available);

    return (
        <div>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-slate-900">Available Modules</h2>
                    <p className="text-slate-600 text-sm mt-1">Select a module to get started</p>
                </div>

                {/* Module Cards Grid */}
                {availableModules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {availableModules.map((module) => (
                            <ModuleCard  // <-- USE the imported component
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
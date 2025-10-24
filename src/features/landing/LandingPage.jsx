// src/features/landing/LandingPage.jsx
import React from 'react';
import { ModuleCard } from './components/ModuleCard'; // <-- IMPORT the new component

// --- Main LandingPage Component ---
export default function LandingPage({ user, onNavigate }) {
    // 1. Define access based on roles
    const isSales = user.role === 'SALES' || user.role === 'ADMIN';
    const isFinance = user.role === 'FINANCE' || user.role === 'ADMIN';
    const isAdmin = user.role === 'ADMIN';
    const isMasterData = true;

    // The modules the user has access to, now with emoji icons
    const availableModules = [
        { id: 'sales', name: 'Plantillas Economicas', icon: '📝', description: 'Ingresa y revisa el estado de tus plantillas.', available: isSales },
        { id: 'finance', name: 'Aprobación de Plantillas Economicas', icon: '📊', description: 'Aprueba las plantillas economicas.', available: isFinance },
        { id: 'admin-management', name: 'Manejo de Permisos', icon: '🔒', description: 'Maneja usuarios, roles y asignación de modulos.', available: isAdmin },
        { id: 'variable-master', name: 'Maestro de Variables', icon: '⚙️', description: 'Visualiza y actualizar variables clave.', available: isMasterData }
    ].filter(module => module.available);

    return (
        <div>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <p className="text-slate-600 text-sm mt-1">Selecciona uno para iniciar</p>
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
                        <p className="text-slate-600">No hay modulos disponible para ti ({user.role})</p>
                    </div>
                )}
            </div>
        </div>
    );
}
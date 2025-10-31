// src/features/landing/LandingPage.tsx
import React from 'react';
import { ModuleCard } from './components/ModuleCard'; // Will auto-resolve to .tsx or .jsx
import type { User } from '@/types'; // 1. Import User type

// 2. Define the props interface
interface LandingPageProps {
  user: User;
  onNavigate: (page: string) => void;
}

// 3. Apply the interface directly to the destructured props
export default function LandingPage({ user, onNavigate }: LandingPageProps) {
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
            <div className="container mx-auto px-8 py-12">
                {/* Module Cards Grid */}
                {availableModules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {availableModules.map((module) => (
                            <ModuleCard
                                key={module.id}
                                module={module} // Its own component (ModuleCard.jsx) will also need props typed
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
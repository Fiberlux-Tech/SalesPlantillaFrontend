// src/features/landing/LandingPage.tsx
import { ModuleCard } from './components/ModuleCard';
import type { User } from '@/types';

interface LandingPageProps {
  user: User;
  // onNavigate: (page: string) => void; // <-- 1. REMOVE this prop
}

// 2. Apply the updated interface
export default function LandingPage({ user }: LandingPageProps) {
    const isSales = user.role === 'SALES' || user.role === 'ADMIN';
    const isFinance = user.role === 'FINANCE' || user.role === 'ADMIN';
    const isAdmin = user.role === 'ADMIN';
    const isMasterData = true;

    // 3. Add a 'path' property to each module
    const availableModules = [
        { id: 'sales', name: 'Plantillas Economicas', icon: '📝', description: 'Ingresa y revisa el estado de tus plantillas.', available: isSales, path: '/sales' },
        { id: 'finance', name: 'Aprobación de Plantillas Economicas', icon: '📊', description: 'Aprueba las plantillas economicas.', available: isFinance, path: '/finance' },
        { id: 'admin-management', name: 'Manejo de Permisos', icon: '🔒', description: 'Maneja usuarios, roles y asignación de modulos.', available: isAdmin, path: '/admin/users' },
        { id: 'variable-master', name: 'Maestro de Variables', icon: '⚙️', description: 'Visualiza y actualizar variables clave.', available: isMasterData, path: '/admin/master-data' }
    ].filter(module => module.available);

    return (
        <div>
            <div className="container mx-auto px-8 py-12">
                {availableModules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {availableModules.map((module) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                // onNavigate={onNavigate} // <-- 4. REMOVE this prop
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
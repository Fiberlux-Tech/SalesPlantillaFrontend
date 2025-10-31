// src/App.tsx
import React, { useState, useEffect } from 'react';
import { checkAuthStatus, loginUser, registerUser, logoutUser } from './features/auth/authService'; 
import AuthPage from '@/features/auth/AuthPage';
import LandingPage from '@/features/landing/LandingPage';
import SalesDashboard from '@/features/sales/SalesDashboard';
import FinanceDashboard from '@/features/finance/FinanceDashboard';
import { PermissionManagementModule } from '@/features/admin/AdminUserManagement';
import MasterDataManagement from '@/features/masterdata/MasterDataManagement'; 
import GlobalHeader from '@/components/shared/GlobalHeader'; 
import type { User } from '@/types'; // Import our new User type!

// Define sales actions type
interface SalesActions {
    onUpload: () => void;
    onExport: () => void;
}

const defaultSalesActions: SalesActions = {
    onUpload: () => console.log('Upload handler not yet mounted'),
    onExport: () => console.log('Export handler not yet mounted')
};

export default function App() {
    const [user, setUser] = useState<User | null>(null); // TYPED STATE
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<string>('landing'); 
    const [salesActions, setSalesActions] = useState<SalesActions>(defaultSalesActions); // TYPED STATE

    useEffect(() => {
        const checkUser = async () => {
            try {
                const data = await checkAuthStatus();
                if (data.is_authenticated) {
                    // FIX 1: Access the nested 'user' property on the new AuthStatus type
                    setUser(data.user); 
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
            setIsLoading(false);
        };
        checkUser();
    }, []);

    // --- Auth Functions (Inputs are now typed) ---
    const handleLogin = async (username: string, password: string) => {
        const result = await loginUser(username, password);
        if (result.success) {
            setUser(result.data);
            setCurrentPage('landing');
        } else {
            throw new Error(result.error);
        }
    };

    const handleRegister = async (username: string, email: string, password: string) => {
        const result = await registerUser(username, email, password);
        if (result.success) {
            setUser(result.data);
            setCurrentPage('landing');
        } else {
            throw new Error(result.error);
        }
    };

    const handleLogout = async () => {
        await logoutUser();
        setUser(null);
        setCurrentPage('landing');
    };

    const handleNavigate = (page: string) => {
        if (!user) return; 
        const role = user.role;
        // ... (switch logic remains the same) ...
        switch (page) {
            case 'sales':
                if (role === 'SALES' || role === 'ADMIN') setCurrentPage('sales');
                break;
            case 'finance':
                if (role === 'FINANCE' || role === 'ADMIN') setCurrentPage('finance');
                break;
            case 'admin-management':
                if (role === 'ADMIN') setCurrentPage('admin-management');
                break;
            case 'variable-master':
                setCurrentPage('variable-master');
                break;
            case 'landing':
            default:
                setCurrentPage('landing');
        }
    };
    
    const getPageTitle = (page: string): string => {
        switch (page) {
            case 'sales':
                return 'Plantillas Economicas';
            case 'finance':
                return 'Aprobación de Plantillas Economicas';
            case 'admin-management':
                return 'Manejo de Permisos';
            case 'variable-master':
                return 'Maestro de Variables';
            case 'landing':
            default:
                return 'Menu Principal'; 
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <h1 className="text-2xl">Loading...</h1>
            </div>
        );
    }

    if (!user) {
        return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
    }

    let PageComponent: React.ReactNode; // Type the component
    switch (currentPage) {
        case 'sales':
            PageComponent = <SalesDashboard 
                user={user} 
                setSalesActions={setSalesActions} 
            />; 
            break;
        case 'finance':
            PageComponent = <FinanceDashboard 
                user={user} 
                // FIX 2: Pass the required onLogout handler
                onLogout={handleLogout}
            />;
            break;
        case 'admin-management':
            PageComponent = <PermissionManagementModule />; 
            break;
        case 'variable-master':
            PageComponent = <MasterDataManagement user={user} />; 
            break;
        case 'landing':
        default:
            PageComponent = <LandingPage user={user} onNavigate={handleNavigate} />;
    }

    const currentTitle = getPageTitle(currentPage);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <GlobalHeader 
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                currentPage={currentPage}
                pageTitle={currentTitle} 
                salesActions={salesActions} 
            />
            <main className="flex-grow">
                 {PageComponent}
            </main>
        </div>
    );
}
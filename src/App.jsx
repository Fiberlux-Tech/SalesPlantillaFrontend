// src/App.jsx

import React, { useState, useEffect } from 'react';

// --- Import Service Layer ---
import { checkAuthStatus, loginUser, registerUser, logoutUser } from './features/auth/authService'; 

// --- FEATURE IMPORTS (Standardized with @/) ---
import AuthPage from '@/features/auth/AuthPage';
import LandingPage from '@/features/landing/LandingPage';
import SalesDashboard from '@/features/sales/SalesDashboard';
import FinanceDashboard from '@/features/finance/FinanceDashboard';
import { PermissionManagementModule } from '@/features/admin/AdminUserManagement';
import MasterDataManagement from '@/features/masterdata/MasterDataManagement'; 

// --- SHARED COMPONENT IMPORT ---
import GlobalHeader from '@/components/shared/GlobalHeader'; 

// Default state for sales actions until the SalesDashboard mounts and registers its handlers
const defaultSalesActions = {
    onUpload: () => console.log('Upload handler not yet mounted'),
    onExport: () => console.log('Export handler not yet mounted')
};

export default function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('landing'); 
    // NEW STATE: Holds the action handlers provided by the mounted SalesDashboard component.
    const [salesActions, setSalesActions] = useState(defaultSalesActions);

    // Check if user is logged in on initial load (uses Service Layer)
    useEffect(() => {
        const checkUser = async () => {
            try {
                const data = await checkAuthStatus();
                if (data.is_authenticated) {
                    setUser({ username: data.username, role: data.role });
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
            setIsLoading(false);
        };
        checkUser();
    }, []);

    // --- Auth Functions (remain the same) ---
    const handleLogin = async (username, password) => {
        const result = await loginUser(username, password);
        if (result.success) {
            setUser({ username: result.data.username, role: result.data.role });
            setCurrentPage('landing');
        } else {
            throw new Error(result.error);
        }
    };

    const handleRegister = async (username, email, password) => {
        const result = await registerUser(username, email, password);
        if (result.success) {
            setUser({ username: result.data.username, role: result.data.role });
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

    // --- Navigation (remain the same) ---
    const handleNavigate = (page) => {
        if (!user) return; 
        
        const role = user.role;
        
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
    
    // NEW: Centralized title lookup function
    const getPageTitle = (page) => {
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

    // --- Render Logic ---
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

    let PageComponent;
    switch (currentPage) {
        case 'sales':
            // CRITICAL FIX: Pass user and setSalesActions for action registration and permissions
            PageComponent = <SalesDashboard 
                onLogout={handleLogout} 
                user={user} 
                setSalesActions={setSalesActions} // Pass setter to register handlers
            />; 
            break;
        case 'finance':
            // FIX: Pass user for DataPreviewModal permissions
            PageComponent = <FinanceDashboard 
                onLogout={handleLogout} 
                user={user} 
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

    // Get the title based on the current page
    const currentTitle = getPageTitle(currentPage);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            {/* PASS THE TITLE AND ACTIONS TO GLOBAL HEADER */}
            <GlobalHeader 
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                currentPage={currentPage}
                pageTitle={currentTitle} // Pass the centralized title string
                salesActions={salesActions} // Pass the sales actions/handlers
            />
            <main className="flex-grow">
                 {PageComponent}
            </main>
        </div>
    );
}
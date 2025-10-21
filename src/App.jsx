import React, { useState, useEffect } from 'react';
import { api } from './lib/api'; // <-- 1. IMPORT the new api helper

// --- 2. CORRECTED FEATURE IMPORTS ---
import AuthPage from './features/auth/AuthPage';
import LandingPage from './features/landing/LandingPage';
import SalesDashboard from './features/sales/SalesDashboard';
import FinanceDashboard from './features/finance/FinanceDashboard';
import { PermissionManagementModule } from './features/admin/AdminUserManagement';

// --- 3. CORRECTED SHARED COMPONENT IMPORT ---
import GlobalHeader from './components/shared/GlobalHeader'; 

export default function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('landing'); 

    // Check if user is logged in on initial load
    useEffect(() => {
        const checkUser = async () => {
            try {
                // This now uses the imported 'api' object
                const data = await api.get('/auth/me'); 
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

    // --- Auth Functions (now use imported 'api') ---
    const handleLogin = async (username, password) => {
        const data = await api.post('/auth/login', { username, password });
        setUser({ username: data.username, role: data.role });
        setCurrentPage('landing');
    };

    const handleRegister = async (username, email, password) => {
        const data = await api.post('/auth/register', { username, email, password });
        setUser({ username: data.username, role: data.role });
        setCurrentPage('landing');
    };

    const handleLogout = async () => {
        await api.post('/auth/logout');
        setUser(null);
        setCurrentPage('landing');
    };

    // --- Navigation (This logic is fine) ---
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
            case 'landing':
            default:
                setCurrentPage('landing');
        }
    };
    
    // --- Render Logic (This is all correct) ---
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
            PageComponent = <SalesDashboard onLogout={handleLogout} />; 
            break;
        case 'finance':
            PageComponent = <FinanceDashboard onLogout={handleLogout} />;
            break;
        case 'admin-management':
            PageComponent = <PermissionManagementModule />; 
            break;
        case 'landing':
        default:
            PageComponent = <LandingPage user={user} onNavigate={handleNavigate} />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <GlobalHeader 
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                currentPage={currentPage}
            />
            <main className="flex-grow">
                 {PageComponent}
            </main>
        </div>
    );
}
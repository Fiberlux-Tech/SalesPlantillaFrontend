import React, { useState, useEffect } from 'react';

// --- Import Service Layer ---
import { checkAuthStatus, loginUser, registerUser, logoutUser } from './features/auth/authService'; 

// --- FEATURE IMPORTS ---
import AuthPage from './features/auth/AuthPage';
import LandingPage from './features/landing/LandingPage';
import SalesDashboard from './features/sales/SalesDashboard';
import FinanceDashboard from './features/finance/FinanceDashboard';
import { PermissionManagementModule } from './features/admin/AdminUserManagement';
import MasterDataManagement from './features/masterdata/MasterDataManagement'; // Assuming you named it this way

// --- SHARED COMPONENT IMPORT ---
import GlobalHeader from './components/shared/GlobalHeader'; 

export default function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('landing'); 

    // Check if user is logged in on initial load (uses Service Layer)
    useEffect(() => {
        const checkUser = async () => {
            try {
                const data = await checkAuthStatus(); // <--- Service Call
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

    // --- Auth Functions (Now use Service Layer) ---
    const handleLogin = async (username, password) => {
        const result = await loginUser(username, password); // <--- Service Call
        if (result.success) {
            setUser({ username: result.data.username, role: result.data.role });
            setCurrentPage('landing');
        } else {
            // Re-throw the error so AuthPage.jsx can catch it and display the message
            throw new Error(result.error);
        }
    };

    const handleRegister = async (username, email, password) => {
        const result = await registerUser(username, email, password); // <--- Service Call
        if (result.success) {
            setUser({ username: result.data.username, role: result.data.role });
            setCurrentPage('landing');
        } else {
            throw new Error(result.error);
        }
    };

    const handleLogout = async () => {
        await logoutUser(); // <--- Service Call
        setUser(null);
        setCurrentPage('landing');
    };

    // --- Navigation (Updated to include Master Data) ---
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
    
    // --- Render Logic (Updated to include Master Data) ---
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
        case 'variable-master':
            PageComponent = <MasterDataManagement user={user} />; 
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
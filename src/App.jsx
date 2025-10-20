import React, { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import LandingPage from './LandingPage';
import SalesDashboard from './SalesDashboard';
import FinanceDashboard from './FinanceDashboard';
import GlobalHeader from './GlobalHeader'; 
import { PermissionManagementModule } from './AdminUserManagement'; // NEW: Import Admin Module

// --- OPTIMAL FIX: USE ENVIRONMENT VARIABLE ---
// If the environment variable VITE_API_BASE_URL is set (in production), use it.
// If not (e.g., in development), fallback to a relative path '/api'.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
// ---------------------------------------------

// A simple API helper to make requests and handle JSON
const api = {
    post: async (url, data) => {
        // Concatenates BASE_URL with '/auth/login' or '/auth/register'
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include' 
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'An error occurred');
        }
        return response.json();
    },
    get: async (url) => {
        // Concatenates BASE_URL with '/auth/me'
        const response = await fetch(`${API_BASE_URL}${url}`, {
            credentials: 'include' 
        });
        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, message: 'Not authenticated' };
            }
            const err = await response.json();
            throw new Error(err.message || 'An error occurred');
        }
        return response.json();
    }
};

export default function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // NEW: Add 'admin-management' to the pages array
    const [currentPage, setCurrentPage] = useState('landing'); 

    // Check if user is logged in on initial load
    useEffect(() => {
        const checkUser = async () => {
            try {
                // The URL is resolved via the API_BASE_URL constant
                const data = await api.get('/auth/me'); 
                if (data.is_authenticated) {
                    setUser({ username: data.username, role: data.role });
                }
            } catch (error) {
                // This will log the error if the server is unreachable
                console.error("Failed to fetch user", error);
            }
            setIsLoading(false);
        };
        checkUser();
    }, []);

    // --- Auth Functions (Now using the Environment Variable resolved base URL) ---
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

    // --- Navigation ---
    const handleNavigate = (page) => {
        if (!user) return; // Must be logged in to navigate
        
        // Define role-based navigation rules
        const role = user.role;
        
        switch (page) {
            case 'sales':
                if (role === 'SALES' || role === 'ADMIN') setCurrentPage('sales');
                break;
            case 'finance':
                if (role === 'FINANCE' || role === 'ADMIN') setCurrentPage('finance');
                break;
            case 'admin-management':
                if (role === 'ADMIN') setCurrentPage('admin-management'); // NEW RULE
                break;
            case 'landing':
            default:
                setCurrentPage('landing');
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

    // --- 2. LOGGED OUT STATE ---
    if (!user) {
        return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
    }

    // --- 3. LOGGED IN STATE ---
    let PageComponent;
    switch (currentPage) {
        case 'sales':
            PageComponent = <SalesDashboard onLogout={handleLogout} />; 
            break;
        case 'finance':
            PageComponent = <FinanceDashboard onLogout={handleLogout} />;
            break;
        case 'admin-management': // NEW ROUTE CASE
            // Component is now PermissionManagementModule from AdminUserManagement.tsx
            PageComponent = <PermissionManagementModule />; 
            break;
        case 'landing':
        default:
            PageComponent = <LandingPage user={user} onNavigate={handleNavigate} />;
    }

    // Render the layout: Header on top, PageComponent below
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
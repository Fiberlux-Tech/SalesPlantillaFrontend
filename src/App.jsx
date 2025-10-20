import React, { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import LandingPage from './LandingPage';
import SalesDashboard from './SalesDashboard';
import FinanceDashboard from './FinanceDashboard';
import GlobalHeader from './GlobalHeader'; // <-- 1. IMPORT THE NEW HEADER

// A simple API helper to make requests and handle JSON
const api = {
    post: async (url, data) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'An error occurred');
        }
        return response.json();
    },
    get: async (url) => {
        const response = await fetch(url);
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
    const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'sales', 'finance'

    // Check if user is logged in on initial load
    useEffect(() => {
        const checkUser = async () => {
            try {
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

    // --- Auth Functions ---
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
        if (page === 'sales' && (user.role === 'SALES' || user.role === 'ADMIN')) {
            setCurrentPage('sales');
        }
        if (page === 'finance' && (user.role === 'FINANCE' || user.role === 'ADMIN')) {
            setCurrentPage('finance');
        }
        if (page === 'landing') {
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

    // --- 3. LOGGED IN STATE (NEW) ---
    // Get the correct page component to show
    let PageComponent;
    switch (currentPage) {
        case 'sales':
            PageComponent = <SalesDashboard onLogout={handleLogout} />; 
            break;
        case 'finance':
            PageComponent = <FinanceDashboard onLogout={handleLogout} />;
            break;
        case 'landing':
        default:
            PageComponent = <LandingPage user={user} onNavigate={handleNavigate} />;
    }

    // Render the layout: Header on top, PageComponent below
    return (
        // 1. Set the background YOU WANT. Let's use the one from LandingPage.
        <div className="min-h-screen flex flex-col bg-slate-50">
            <GlobalHeader 
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                currentPage={currentPage}
            />
            {/* 2. REMOVE container/padding classes. Let the page handle it. */}
            <main className="flex-grow">
                 {PageComponent}
            </main>
        </div>
    );
}
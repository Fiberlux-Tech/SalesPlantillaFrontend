// src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 

import { checkAuthStatus, loginUser, registerUser, logoutUser } from '@/features/auth/authService';
import AuthPage from '@/features/auth/AuthPage';
import LandingPage from '@/features/landing/LandingPage';

// Import the new components
import SalesDashboard from '@/features/transactions/SalesDashboard';
import FinanceDashboard from '@/features/transactions/FinanceDashboard';

import { PermissionManagementModule } from '@/features/admin/AdminUserManagement';
import MasterDataManagement from '@/features/masterdata/MasterDataManagement';
import GlobalHeader from '@/components/shared/GlobalHeader';
import type { User, UserRole } from '@/types';

// Interface for sales actions
interface SalesActions {
    onUpload: () => void;
    onExport: () => void;
}
const defaultSalesActions: SalesActions = {
    onUpload: () => console.log('Upload handler not yet mounted'),
    onExport: () => console.log('Export handler not yet mounted')
};

// Helper component for Protected Routes
interface ProtectedRouteProps {
    user: User | null;
    roles: UserRole[];
    children: React.ReactNode;
}

function ProtectedRoute({ user, roles, children }: ProtectedRouteProps) {
    if (!user) {
        // Not logged in, redirect to auth page
        return <Navigate to="/auth" replace />;
    }
    
    const hasPermission = roles.includes(user.role) || user.role === 'ADMIN';

    if (!hasPermission) {
        // Logged in, but not authorized for this route, redirect to landing
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}


export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [salesActions, setSalesActions] = useState<SalesActions>(defaultSalesActions);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const data = await checkAuthStatus();
                if (data.is_authenticated) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
                setUser(null); // Ensure user is null on auth error
            }
            setIsLoading(false);
        };
        checkUser();
    }, []);

    const handleLogin = async (username: string, password: string) => {
        const result = await loginUser(username, password);
        if (result.success) {
            setUser(result.data);
        } else {
            throw new Error(result.error);
        }
    };

    const handleRegister = async (username: string, email: string, password: string) => {
        const result = await registerUser(username, email, password);
        if (result.success) {
            setUser(result.data);
        } else {
            throw new Error(result.error);
        }
    };

    // FIX: Wrap handleLogout in useCallback to make it a stable function
    const handleLogout = useCallback(async () => {
        await logoutUser();
        setUser(null);
    }, []); // Empty dependency array means it's created only once

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <h1 className="text-2xl">Loading...</h1>
            </div>
        );
    }

    // Unauthenticated user routes
    if (!user) {
        return (
            <Routes>
                <Route path="/auth" element={<AuthPage onLogin={handleLogin} onRegister={handleRegister} />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        );
    }

    // Authenticated user routes
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <GlobalHeader 
                onLogout={handleLogout}
                salesActions={salesActions} 
            />
            <main className="flex-grow">
                 <Routes>
                    <Route path="/" element={<LandingPage user={user} />} />
                    
                    <Route path="/sales" element={
                        <ProtectedRoute user={user} roles={['SALES']}>
                            <SalesDashboard 
                                user={user} 
                                setSalesActions={setSalesActions} 
                                onLogout={handleLogout} // <-- Pass stable function
                            />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/finance" element={
                        <ProtectedRoute user={user} roles={['FINANCE']}>
                            <FinanceDashboard 
                                user={user} 
                                onLogout={handleLogout} // <-- Pass stable function
                            />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/admin/users" element={
                        <ProtectedRoute user={user} roles={['ADMIN']}>
                            <PermissionManagementModule />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin/master-data" element={
                        <ProtectedRoute user={user} roles={['ADMIN', 'FINANCE', 'SALES', 'USER']}>
                            <MasterDataManagement user={user} />
                        </ProtectedRoute>
                    } />

                    <Route path="/auth" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                 </Routes>
            </main>
        </div>
    );
}
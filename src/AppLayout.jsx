import React from 'react';
import {
    HomeIcon,
    FileTextIcon,
    DollarSignIcon,
    LogOutIcon,
    UserIcon
} from './components/Icons'; // Make sure to add HomeIcon to your Icons.jsx

// This is the component for a single navigation link in the sidebar
function NavLink({ icon, label, onClick, isActive }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center w-full px-4 py-3 text-sm font-medium
                ${isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }
                rounded-lg transition-colors duration-150
            `}
        >
            {React.cloneElement(icon, { className: 'w-5 h-5 mr-3' })}
            {label}
        </button>
    );
}

export default function AppLayout({ user, onLogout, onNavigate, currentPage, children }) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* --- Sidebar --- */}
            <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col p-4">
                <h1 className="text-2xl font-bold text-white px-4 mb-6">Financial Portal</h1>
                <nav className="flex-grow space-y-2">
                    <NavLink
                        label="Home"
                        icon={<HomeIcon />}
                        isActive={currentPage === 'landing'}
                        onClick={() => onNavigate('landing')}
                    />
                    
                    {/* Show Sales Module Link */}
                    {(user.role === 'SALES' || user.role === 'ADMIN') && (
                        <NavLink
                            label="Deal Approval"
                            icon={<FileTextIcon />}
                            isActive={currentPage === 'sales'}
                            onClick={() => onNavigate('sales')}
                        />
                    )}

                    {/* Show Finance Module Link */}
                    {(user.role === 'FINANCE' || user.role === 'ADMIN') && (
                        <NavLink
                            label="Finance Dashboard"
                            icon={<DollarSignIcon />}
                            isActive={currentPage === 'finance'}
                            onClick={() => onNavigate('finance')}
                        />
                    )}
                </nav>

                {/* --- Sidebar Footer (User/Logout) --- */}
                <div className="flex-shrink-0 border-t border-gray-700 pt-4">
                    <div className="flex items-center px-4 py-2 text-gray-400">
                        <UserIcon className="w-8 h-8 rounded-full bg-gray-600 p-1 mr-3" />
                        <span className="text-sm font-medium">{user.username} ({user.role})</span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-150"
                    >
                        <LogOutIcon className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* This 'children' prop is where your page content (Landing, Sales, Finance) will go */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
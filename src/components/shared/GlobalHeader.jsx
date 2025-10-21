import React from 'react';
import { LogOutIcon, ArrowLeftIcon } from './Icons'; // Make sure to add ArrowLeftIcon

export default function GlobalHeader({ onLogout, onNavigate, currentPage }) {
    
    // This is the button style
    const buttonStyles = "flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50";

    return (
        <header className="bg-white shadow-sm h-16 w-full flex-shrink-0">
            <div className="container mx-auto px-8 h-full flex items-center justify-between">
                
                {/* --- Left Side --- */}
                <div>
                    {/* Only show the 'Back' button if we are NOT on the landing page */}
                    {currentPage !== 'landing' && (
                        <button 
                            onClick={() => onNavigate('landing')} 
                            className={buttonStyles}
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2 text-gray-500" />
                            Back
                        </button>
                    )}
                </div>

                {/* --- Right Side --- */}
                <div>
                    <button 
                        onClick={onLogout}
                        className={buttonStyles}
                    >
                        <LogOutIcon className="w-5 h-5 mr-2 text-gray-500" />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
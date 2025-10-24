// fiberlux-tech/salesplantillafrontend/SalesPlantillaFrontend-64ed8b30ed6e79e4876344359d7698df855dbf56/src/components/shared/GlobalHeader.jsx

import React from 'react';
import { LogOutIcon, ArrowLeftIcon } from './Icons'; 

export default function GlobalHeader({ onLogout, onNavigate, currentPage, pageTitle }) {
    
    // This is the button style
    const buttonStyles = "flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50";

    return (
        <header className="bg-white shadow-sm h-20 w-full flex-shrink-0">
            <div className="container mx-auto px-8 h-full flex items-center justify-between">
                
                {/* --- Left Side: Back Button & Title --- */}
                <div className="flex items-center space-x-4">
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
                    
                    {/* ADDED: Increased font size from text-xl to text-2xl */}
                    <h1 className="text-2xl font-bold text-gray-800">
                        {pageTitle}
                    </h1>
                </div>

                {/* --- Right Side: Logout Button --- */}
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
import React from 'react';
import { LogOutIcon, ArrowLeftIcon, UploadIcon, ExportIcon } from './Icons'; // Added UploadIcon and ExportIcon

export default function GlobalHeader({ onLogout, onNavigate, currentPage, salesActions }) {
    
    // This is the button style
    const buttonStyles = "flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50";
    const primaryButtonStyles = "flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg shadow-sm hover:bg-gray-800";

    // Check if we should show the Sales-specific actions
    const showSalesActions = currentPage === 'sales';

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

                {/* --- Right Side: Sales Actions and Logout --- */}
                <div className="flex items-center space-x-2">
                    {/* Render actions only on the Sales page, and only if handlers exist */}
                    {showSalesActions && salesActions && (
                        <>
                            {/* Export Button */}
                            <button 
                                onClick={salesActions.onExport}
                                className={buttonStyles}
                            >
                                <ExportIcon className="w-5 h-5 mr-2 text-gray-500" />
                                <span>Export</span>
                            </button>
                            
                            {/* Upload Button */}
                            <button 
                                onClick={salesActions.onUpload}
                                className={primaryButtonStyles}
                            >
                                <UploadIcon />
                                <span>Upload File</span>
                            </button>
                        </>
                    )}
                    
                    {/* Logout Button (Always visible when logged in) */}
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
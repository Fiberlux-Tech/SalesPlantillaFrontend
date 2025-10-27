// src/components/shared/GlobalHeader.jsx (Modified to use explicit spacing for alignment)

import React from 'react';
import { LogOutIcon, ArrowLeftIcon, UploadIcon, ExportIcon } from './Icons'; 

export default function GlobalHeader({ onLogout, onNavigate, currentPage, pageTitle, salesActions }) { 
    
    // This is the neutral button style (Back, Logout, Export)
    const buttonStyles = "flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50";
    // This is the primary button style (Upload)
    const primaryButtonStyles = "flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg shadow-sm hover:bg-gray-800";

    const showSalesActions = currentPage === 'sales';
    const showBackButton = currentPage !== 'landing';

    return (
        <header className="bg-white shadow-sm h-16 w-full flex-shrink-0">
            <div className="container mx-auto px-8 h-full flex items-center justify-between">
                
                {/* --- Left Side: Back Button & Title --- */}
                <div className="flex items-center space-x-4">
                    
                    {/* Conditional rendering for the Back button */}
                    {showBackButton ? (
                        // 1. Back Button is Visible on Module Pages
                        <button 
                            onClick={() => onNavigate('landing')} 
                            className={buttonStyles}
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2 text-gray-500" />
                            Atrás
                        </button>
                    ) : (
                        // 2. Invisible Spacer element only when on 'landing' page.
                        // We use the space-x-4 (ml-4) from the parent div, so we just need a blank space.
                        // The button's approximate width is controlled by p-x4/p-y2 and icon/text width. 
                        // To avoid complex fixed widths, we can just use a placeholder class.
                        // The title itself will move to the left by the space-x-4 amount (ml-4).
                        // Let's explicitly push the title back to the right by using a transparent clone.
                        <div className="invisible pointer-events-none">
                            <button className={buttonStyles}> {/* Use the button structure to reserve space */}
                                <ArrowLeftIcon className="w-5 h-5 mr-2 text-gray-500" />
                                Atrás
                            </button>
                        </div>
                    )}
                    
                    {/* PRIMARY PAGE TITLE */}
                    <h1 className="text-3xl font-bold text-gray-800">
                        {pageTitle}
                    </h1>
                </div>

                {/* --- Right Side: Sales Actions and Logout --- */}
                <div className="flex items-center space-x-2">
                    {/* Render actions only on the Sales page */}
                    {showSalesActions && salesActions && (
                        <>
                            {/* Export Button */}
                            <button 
                                onClick={salesActions.onExport}
                                className={buttonStyles}
                            >
                                <ExportIcon className="w-5 h-5 mr-2 text-gray-500" />
                                <span>Exportar</span>
                            </button>
                            
                            {/* Upload Button */}
                            <button 
                                onClick={salesActions.onUpload}
                                className={primaryButtonStyles}
                            >
                                <UploadIcon />
                                <span>Cargar Archivo</span>
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
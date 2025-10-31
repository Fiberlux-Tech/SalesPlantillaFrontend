// src/components/shared/GlobalHeader.tsx
import { LogOutIcon, ArrowLeftIcon, UploadIcon, ExportIcon } from './Icons'; // Assumes Icons.tsx

// 1. Define the shape of the salesActions prop
interface SalesActions {
    onUpload: () => void;
    onExport: () => void;
}

// 2. Define the main props interface
interface GlobalHeaderProps {
    onLogout: () => void;
    onNavigate: (page: string) => void;
    currentPage: string;
    pageTitle: string;
    salesActions: SalesActions;
}

export default function GlobalHeader({ 
    onLogout, 
    onNavigate, 
    currentPage, 
    pageTitle, 
    salesActions 
}: GlobalHeaderProps) { 
    
    const buttonStyles = "flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50";
    const primaryButtonStyles = "flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg shadow-sm hover:bg-gray-800";

    const showSalesActions = currentPage === 'sales';
    const showBackButton = currentPage !== 'landing';

    return (
        <header className="bg-white shadow-sm h-16 w-full flex-shrink-0">
            <div className="container mx-auto px-8 h-full flex items-center justify-between">
                
                <div className="flex items-center space-x-4">
                    {showBackButton ? (
                        <button 
                            onClick={() => onNavigate('landing')} 
                            className={buttonStyles}
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2 text-gray-500" />
                            Atrás
                        </button>
                    ) : (
                        <div className="invisible pointer-events-none">
                            <button className={buttonStyles}>
                                <ArrowLeftIcon className="w-5 h-5 mr-2 text-gray-500" />
                                Atrás
                            </button>
                        </div>
                    )}
                    
                    <h1 className="text-3xl font-bold text-gray-800">
                        {pageTitle}
                    </h1>
                </div>

                <div className="flex items-center space-x-2">
                    {showSalesActions && salesActions && (
                        <>
                            <button 
                                onClick={salesActions.onExport}
                                className={buttonStyles}
                            >
                                <ExportIcon className="w-5 h-5 mr-2 text-gray-500" />
                                <span>Exportar</span>
                            </button>
                            
                            <button 
                                onClick={salesActions.onUpload}
                                className={primaryButtonStyles}
                            >
                                <UploadIcon />
                                <span>Cargar Archivo</span>
                            </button>
                        </>
                    )}
                    
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
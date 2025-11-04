// src/components/shared/GlobalHeader.tsx
import { useNavigate, useLocation } from 'react-router-dom'; // <-- 1. Import hooks
import { LogOutIcon, ArrowLeftIcon, UploadIcon, ExportIcon } from './Icons';

interface SalesActions {
    onUpload: () => void;
    onExport: () => void;
}

interface GlobalHeaderProps {
    onLogout: () => void;
    // 2. REMOVE these props
    // onNavigate: (page: string) => void;
    // currentPage: string;
    // pageTitle: string;
    salesActions: SalesActions;
}

// 3. Helper function to get title from URL
const getPageTitle = (pathname: string): string => {
    switch (pathname) {
        case '/sales':
            return 'Plantillas Economicas';
        case '/finance':
            return 'Aprobación de Plantillas Economicas';
        case '/admin/users':
            return 'Manejo de Permisos';
        case '/admin/master-data':
            return 'Maestro de Variables';
        case '/':
        default:
            return 'Menu Principal';
    }
};

export default function GlobalHeader({
    onLogout,
    salesActions
}: GlobalHeaderProps) { // <-- 4. Update destructured props

    const navigate = useNavigate(); // <-- 5. Add hooks
    const location = useLocation();
    const pathname = location.pathname;

    const buttonStyles = "flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50";
    const primaryButtonStyles = "flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg shadow-sm hover:bg-gray-800";

    // 6. Determine state from the URL pathname
    const showSalesActions = pathname === '/sales';
    const showBackButton = pathname !== '/';
    const currentTitle = getPageTitle(pathname);

    return (
        <header className="bg-white shadow-sm h-16 w-full flex-shrink-0">
            <div className="container mx-auto px-8 h-full flex items-center justify-between">

                <div className="flex items-center space-x-4">
                    {showBackButton ? (
                        <button
                            onClick={() => navigate('/')} // <-- 7. Update back button
                            className={buttonStyles}
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2 text-gray-500" />
                            Atrás
                        </button>
                    ) : (
                        // ... (placeholder div is unchanged) ...
                        <div className="invisible pointer-events-none">
                            <button className={buttonStyles}>
                                <ArrowLeftIcon className="w-5 h-5 mr-2 text-gray-500" />
                                Atrás
                            </button>
                        </div>
                    )}

                    <h1 className="text-3xl font-bold text-gray-800">
                        {currentTitle} {/* <-- 8. Use local title */}
                    </h1>
                </div>

                <div className="flex items-center space-x-2">
                    {/* ... (rest of the file is unchanged) ... */}
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
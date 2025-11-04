// src/components/shared/DataPreviewModal.tsx
import React from 'react';
import { CloseIcon } from '@/components/shared/Icons'; 
// Import Card components for modularity
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// Import StatusBadge for the new header requirement
import StatusBadge from './StatusBadge';

/**
 * A "dumb" modal shell component that utilizes Card components 
 * for structurally consistent internal content presentation.
 */
interface DataPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode; 
    footer: React.ReactNode;
    // NEW PROP: Pass status directly to display in the header
    status: string; 
}

function DataPreviewModal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    status // Destructure new prop
}: DataPreviewModalProps) {

    if (!isOpen) return null;

    return (
        // Modal Backdrop/Primitive: Handles positioning, background, z-index
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            
            {/* Modal Content: Use Card as the container */}
            <Card className="max-w-6xl w-full flex flex-col overflow-hidden">
                
                {/* Header: Use CardHeader and CardTitle */}
                {/* MODIFICATION: Align items better and include the StatusBadge */}
                <CardHeader className="flex-row items-center justify-between p-5 border-b">
                    <CardTitle className="text-xl text-gray-800 p-0 m-0 flex items-center space-x-3">
                        <span>{title}</span>
                        {/* Status badge goes to the top, next to the title (Point 2) */}
                        <StatusBadge status={status} /> 
                    </CardTitle>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <CloseIcon />
                    </button>
                </CardHeader>

                {/* Body: Use CardContent for padding, but customize for scrolling/background */}
                <CardContent className="p-6 bg-gray-50 max-h-[75vh] overflow-y-auto">
                    {children}
                </CardContent>

                {/* Footer: Use CardFooter to hold the action buttons/status */}
                <CardFooter className="p-0 border-t">
                    {footer}
                </CardFooter>

            </Card>
        </div>
    );
}

export default DataPreviewModal;
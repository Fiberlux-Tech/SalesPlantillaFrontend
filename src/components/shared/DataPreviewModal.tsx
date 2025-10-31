// src/components/shared/DataPreviewModal.tsx
import React from 'react';
import { CloseIcon } from '@/components/shared/Icons'; // Assumes Icons.tsx

/**
 * A "dumb" modal shell component.
 */
// 1. Define props interface
interface DataPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode; // Content for the modal body
    footer: React.ReactNode; // Content for the modal footer
}

// 2. Apply props
function DataPreviewModal({
    isOpen,
    onClose,
    title,
    children,
    footer
}: DataPreviewModalProps) {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                </div>

                {/* Modal Body */}
                <div className="p-6 bg-gray-50 max-h-[75vh] overflow-y-auto">
                    {children}
                </div>

                {/* Modal Footer */}
                {footer}
            </div>
        </div>
    );
}

export default DataPreviewModal;
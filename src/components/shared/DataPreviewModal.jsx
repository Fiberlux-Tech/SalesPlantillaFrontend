// src/components/shared/DataPreviewModal.jsx (Refactored "Dumb" Shell)

import React from 'react';
import { CloseIcon } from '@/components/shared/Icons';

/**
 * A "dumb" modal shell component.
 * It provides the modal window, backdrop, and header,
 * but accepts its main content and footer via props.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to call when the close icon is clicked.
 * @param {string} props.title - The title to display in the modal header.
 * @param {React.ReactNode} props.children - The content to render in the modal's body.
 * @param {React.ReactNode} props.footer - The component to render as the modal's footer.
 */
function DataPreviewModal({
    isOpen,
    onClose,
    title,
    children,
    footer
}) {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                        {/* Note: The 'fileName' subtext was removed for simplicity.
                            It can be added back as an optional 'subtitle' prop if needed. */}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                </div>

                {/* Modal Body (Content is injected via children) */}
                <div className="p-6 bg-gray-50 max-h-[75vh] overflow-y-auto">
                    {children}
                </div>

                {/* Modal Footer (Content is injected via footer prop) */}
                {footer}
            </div>
        </div>
    );
}

export default DataPreviewModal;
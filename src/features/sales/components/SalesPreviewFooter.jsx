import React from 'react';
import { CheckCircleIcon } from '../../../components/shared/Icons';

export function SalesPreviewFooter({ onConfirm, onClose }) {
    return (
        <div className="flex justify-end items-center p-5 border-t bg-white space-x-3">
            <div className="flex-grow flex items-center text-sm text-gray-600">
                <CheckCircleIcon />
                <span className="ml-2">All data extracted from Excel file</span>
            </div>
            <button 
                onClick={onClose} 
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                Cancel
            </button>
            <button 
                onClick={onConfirm} 
                className="px-5 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
                Confirm & Submit
            </button>
        </div>
    );
}

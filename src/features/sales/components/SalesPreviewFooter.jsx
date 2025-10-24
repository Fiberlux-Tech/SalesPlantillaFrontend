import React from 'react';
import { CheckCircleIcon } from '../../../components/shared/Icons';

export function SalesPreviewFooter({ onConfirm, onClose }) {
    return (
        <div className="flex justify-end items-center p-5 border-t bg-white space-x-3">
            <div className="flex-grow flex items-center text-sm text-gray-600">
                <CheckCircleIcon />
                <span className="ml-2">Toda la data es inicialmente extraida del excel</span>
            </div>
            <button 
                onClick={onClose} 
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                Cancelar
            </button>
            <button 
                onClick={onConfirm} 
                className="px-5 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
                Confirmar
            </button>
        </div>
    );
}

// src/features/sales/components/FileUploadModal.tsx
import React, { useState, useRef } from 'react';
import { CloseIcon, FileUploadIcon } from '@/components/shared/Icons'; // Assumes Icons.tsx

// 1. Define the props interface
interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNext: (file: File | null) => void;
}

function FileUploadModal({ isOpen, onClose, onNext }: FileUploadModalProps) {
    // 2. Type the state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // 3. Type the ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 4. Type the event handler
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleDropzoneClick = () => {
        // 5. Add null check for ref
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Carga tu Excel</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />
                <div onClick={handleDropzoneClick} className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center mb-6 cursor-pointer">
                    <div className="flex justify-center mb-4"><FileUploadIcon /></div>
                    <p className="text-gray-600">Clickea para cargarlo o arrastralo hasta aquí</p>
                    {selectedFile && <p className="text-sm text-green-600 mt-2 font-semibold">{selectedFile.name}</p>}
                    <p className="text-sm text-gray-400 mt-1">Solo archivos de excel (.xlsx, .xls)</p>
                </div>
                
                <div className="flex justify-end space-x-4 mb-6">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={() => onNext(selectedFile)} disabled={!selectedFile} className="px-6 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed">Next</button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Instrucciones de carga:</h3>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                        <li>Asegurate que el archivo sigue la plantilla correcta</li>
                        <li>Todos los campos obligatorios deben estar ingresados</li>
                        <li>Revisa la data antes de confirmar la carga</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default FileUploadModal;
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Temporary StatusBadge for the Category column until we extract it
const CategoryBadge = ({ category }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full inline-flex items-center";
    const categoryClasses = {
        'Finance': "bg-blue-100 text-blue-800",
        'Sales': "bg-purple-100 text-purple-800",
        'Mayorista': "bg-green-100 text-green-800",
        // Default for new or uncategorized variables
        'Admin': "bg-slate-100 text-slate-800",
    };
    return <span className={`${baseClasses} ${categoryClasses[category] || "bg-gray-100 text-gray-800"}`}>{category}</span>;
};

// --- Helper for creating user-friendly labels from variable keys ---
const VARIABLE_LABELS = {
    'costoCapital': 'Costo Capital',
    'tipoCambio': 'Tipo de Cambio',
};

const parseEditableConfig = (response) => {
    const variablesObject = response.editable_variables || {};
    return Object.keys(variablesObject).map(name => ({
        name: name, 
        label: VARIABLE_LABELS[name] || name, 
        category: variablesObject[name].category 
    }));
};

// Date Formatting Utility
const formatDate = (isoString) => {
    try {
        const date = new Date(isoString);
        if (isNaN(date)) return isoString;
        
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} | ${hh}:${min}`;
    } catch (e) {
        return isoString;
    }
};


// --- Main MDM Component ---
export default function MasterDataManagement({ user }) {
    // 1. State Initialization
    const [history, setHistory] = useState([]);
    const [editableConfig, setEditableConfig] = useState([]); 
    const [apiError, setApiError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form Inputs State (Includes comment)
    const [formInput, setFormInput] = useState({
        variable_name: '',
        variable_value: '',
        comment: '',
    });

    const isAuthorizedForWrite = user.role === 'ADMIN' || user.role === 'FINANCE';


    // --- Data Fetching Logic (Universal & Conditional) ---
    const fetchHistory = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const result = await api.get('/api/master-variables');
            if (result.success) {
                setHistory(result.data || []); 
            } else {
                setApiError(result.error || 'Failed to fetch history.');
            }
        } catch (error) {
            setApiError('Failed to connect to server or fetch history data.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const fetchEditableConfig = async () => {
        try {
            const response = await api.get('/api/master-variables/categories'); 

            if (response.success) {
                const parsedConfig = parseEditableConfig(response);
                setEditableConfig(parsedConfig);

                if (parsedConfig.length > 0) {
                    setFormInput(prev => ({ 
                        ...prev, 
                        variable_name: parsedConfig[0].name 
                    }));
                }
            } else {
                setApiError(response.error || 'Failed to fetch editable variables.');
            }
        } catch (error) {
            setApiError('Failed to fetch editable variable configuration.');
        }
    };
    
    useEffect(() => {
        fetchHistory();
        if (isAuthorizedForWrite) {
            fetchEditableConfig();
        }
    }, []);

    // --- C. Update Variable Form (Write Logic) ---
    const handleUpdateSubmit = async () => {
        // Correct Scoping: declare valueAsNumber here
        const valueAsNumber = parseFloat(formInput.variable_value); 

        if (!formInput.variable_name || !formInput.variable_value) {
            setApiError('Please select a variable and enter a value.');
            return;
        }

        if (isNaN(valueAsNumber) || valueAsNumber <= 0) {
            setApiError('Please enter a valid numeric value greater than zero.');
            return;
        }
        
        // POST /api/master-variables/update payload includes comment
        try {
            const result = await api.post('/api/master-variables/update', {
                variable_name: formInput.variable_name,
                variable_value: valueAsNumber,
                comment: formInput.comment, // Sends the comment field
            });

            if (result.success) {
                alert(`Variable "${formInput.variable_name}" updated successfully to ${valueAsNumber}.`);
                // Clear inputs after successful submission
                setFormInput(prev => ({ ...prev, variable_value: '', comment: '' })); 
                fetchHistory(); // Refresh history table
            } else {
                setApiError(result.error || 'Failed to update variable.');
            }

        } catch (error) {
            console.error("Variable Update Failed:", error);
            setApiError('Server error during variable update.');
        }
    };

    // --- Render Logic (UPDATED JSX) ---
    return (
        <div className="container mx-auto px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Maestro de Variables</h1>
            {apiError && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">{apiError}</div>}

            {/* Conditional Rendering (Write Form) */}
            {isAuthorizedForWrite ? (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4">Update Variable</h2>
                    
                    {/* NEW LAYOUT: Single Row for Variable, Value, Comment, and Button */}
                    <div className="flex space-x-4 items-end">
                        
                        <div className="w-[160px] flex-shrink-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Variable</label>
                            <Select 
                                value={formInput.variable_name} 
                                onValueChange={(value) => setFormInput(prev => ({ ...prev, variable_name: value }))}
                                className="w-full"
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona una variable" />
                                </SelectTrigger>
                                <SelectContent>
                                    {editableConfig.map(config => (
                                        <SelectItem key={config.name} value={config.name}>
                                            {config.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="w-[160px] flex-shrink-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                            <Input
                                type="number"
                                placeholder="Ingresa el valor"
                                value={formInput.variable_value}
                                onChange={(e) => setFormInput(prev => ({ ...prev, variable_value: e.target.value }))}
                            />
                        </div>
                        
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
                            <Input
                                type="text"
                                placeholder="Comentario opcional (máximo 50 caracteres)"
                                value={formInput.comment}
                                onChange={(e) => setFormInput(prev => ({ ...prev, comment: e.target.value }))}
                                maxLength={50} // Updated to 50
                            />
                        </div>
                        
                        <Button onClick={handleUpdateSubmit} disabled={isLoading}>
                            Update Variable
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 mb-6">
                    <p className="text-sm font-medium">Viewing Access Only: Your role ({user.role}) does not permit updating Master Variables.</p>
                </div>
            )}
            
            {/* Update History Table */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-semibold mb-4">Update History</h2>
                <p className="text-sm text-gray-500 mb-6">Recent variable updates and changes</p>

                <div className="overflow-x-auto">
                    {isLoading && history.length === 0 ? (
                        <p className="text-center py-4 text-gray-500">Loading history...</p>
                    ) : history.length === 0 ? (
                         <p className="text-center py-4 text-gray-500">No update history available.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-[120px]">Variable</TableHead>
                                    <TableHead className="w-[100px]">Category</TableHead>
                                    <TableHead className="text-right w-[80px]">Value</TableHead>
                                    <TableHead className="text-center w-[150px]">Date Updated</TableHead>
                                    <TableHead className="w-[150px]">User Updater</TableHead>
                                    <TableHead className="w-[200px]">Comment</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((record, index) => (
                                    <TableRow key={record.id || index} className="hover:bg-gray-50"> 
                                        <TableCell className="font-medium">{record.variable_name}</TableCell>
                                        <TableCell><CategoryBadge category={record.category} /></TableCell>
                                        <TableCell className="text-right font-mono">{record.variable_value}</TableCell>
                                        <TableCell className="text-center text-xs">{formatDate(record.date_recorded)}</TableCell>
                                        <TableCell>{record.recorder_username}</TableCell>
                                        <TableCell className="text-sm max-w-xs truncate" title={record.comment}>{record.comment || '-'}</TableCell>
                                    </TableRow>
                                ))}
                           </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}
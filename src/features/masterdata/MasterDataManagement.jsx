import React, { useState, useEffect } from 'react';
// REMOVED: import { api } from '@/lib/api'; 
// REMOVED: VARIABLE_LABELS and parseEditableConfig helpers

// Import the new Service Layer
import { getMasterVariableHistory, getEditableConfig, updateMasterVariable } from './masterDataService'; 
// New imports for the modular components (assuming they are set up)
import { VariableUpdateForm } from './components/VariableUpdateForm';
import { HistoryTable } from './components/HistoryTable'; 


// --- Main MDM Component (The Clean Controller) ---
export default function MasterDataManagement({ user }) {
    // 1. State Initialization (KEPT)
    const [history, setHistory] = useState([]);
    const [editableConfig, setEditableConfig] = useState([]); 
    const [apiError, setApiError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form Inputs State (KEPT)
    const [formInput, setFormInput] = useState({
        variable_name: '',
        variable_value: '',
        comment: '',
    });

    const isAuthorizedForWrite = user.role === 'ADMIN' || user.role === 'FINANCE';

    // --- Data Loading Logic (CLEANED UP - uses service functions) ---
    const loadData = async () => {
        setIsLoading(true);
        setApiError(null);
        
        // 1. Fetch History
        const historyResponse = await getMasterVariableHistory();
        if (historyResponse.success) {
            setHistory(historyResponse.data);
        } else {
            setApiError(historyResponse.error);
        }

        // 2. Fetch Config (if authorized)
        if (isAuthorizedForWrite) {
            const configResponse = await getEditableConfig();
            if (configResponse.success) {
                setEditableConfig(configResponse.data);
                // Set default form value
                if (configResponse.data.length > 0) {
                    setFormInput(prev => ({ ...prev, variable_name: configResponse.data[0].name }));
                }
            } else {
                setApiError(configResponse.error);
            }
        }
        setIsLoading(false);
    };
    
    useEffect(() => {
        loadData();
    }, []);

    // --- Update Variable Handler (CLEANED UP - uses service function) ---
    const handleUpdateSubmit = async () => {
        setApiError(null);
        const valueAsNumber = parseFloat(formInput.variable_value); 

        // Client-side validation remains here (as it controls local state/UX)
        if (!formInput.variable_name || !formInput.variable_value) {
            setApiError('Please select a variable and enter a value.');
            return;
        }
        if (isNaN(valueAsNumber) || valueAsNumber <= 0) {
            setApiError('Please enter a valid numeric value greater than zero.');
            return;
        }
        
        // Call the service layer with the payload
        const payload = {
            variable_name: formInput.variable_name,
            variable_value: valueAsNumber,
            comment: formInput.comment,
        };
        const result = await updateMasterVariable(payload);

        if (result.success) {
            alert(`Variable "${formInput.variable_name}" updated successfully to ${valueAsNumber}.`);
            setFormInput(prev => ({ ...prev, variable_value: '', comment: '' })); 
            loadData(); // Reload all data
        } else {
            setApiError(result.error);
        }
    };

    // --- CLEAN RENDER LOGIC ---
    return (
        <div className="container mx-auto px-8 py-8">
            {apiError && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">{apiError}</div>}

            {/* Render the DUMB Form Component */}
            {isAuthorizedForWrite ? (
                <VariableUpdateForm
                    editableConfig={editableConfig}
                    formInput={formInput}
                    setFormInput={setFormInput}
                    handleUpdateSubmit={handleUpdateSubmit}
                    isLoading={isLoading}
                />
            ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 mb-6">
                    <p className="text-sm font-medium">Viewing Access Only: Your role ({user.role}) does not permit updating Master Variables.</p>
                </div>
            )}
            
            {/* Render the DUMB History Table Component */}
            <HistoryTable
                isLoading={isLoading}
                history={history}
            />
        </div>
    );
}
// src/features/masterdata/MasterDataManagement.tsx
import React, { useState, useEffect } from 'react';
// FIX: Import the explicit HistoryItem type from the service file
import { getMasterVariableHistory, getEditableConfig, updateMasterVariable, type HistoryItem } from './masterDataService'; 
import { VariableUpdateForm } from './components/VariableUpdateForm'; // Assumes migration
import { HistoryTable } from './components/HistoryTable'; // Assumes migration
import type { User } from '@/types'; // 1. Import User type

// 2. Define component props
interface MasterDataManagementProps {
    user: User;
}

// 3. Define types for state
interface EditableConfigItem {
    name: string;
    label: string;
    category: string;
}

interface FormInputState {
    variable_name: string;
    variable_value: string;
    comment: string;
}

export default function MasterDataManagement({ user }: MasterDataManagementProps) {
    // 5. Type all state hooks
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [editableConfig, setEditableConfig] = useState<EditableConfigItem[]>([]); 
    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const [formInput, setFormInput] = useState<FormInputState>({
        variable_name: '',
        variable_value: '',
        comment: '',
    });

    const isAuthorizedForWrite = user.role === 'ADMIN' || user.role === 'FINANCE';

    // 6. Type async functions
    const loadData = async (): Promise<void> => {
        setIsLoading(true);
        setApiError(null);
        
        const historyResponse = await getMasterVariableHistory();
        if (historyResponse.success) {
            setHistory(historyResponse.data || []); // Ensure data is not undefined
        } else {
            setApiError(historyResponse.error || 'Unknown error');
        }

        if (isAuthorizedForWrite) {
            const configResponse = await getEditableConfig();
            if (configResponse.success) {
                setEditableConfig(configResponse.data || []); // Ensure data is not undefined
                if (configResponse.data && configResponse.data.length > 0) {
                    setFormInput(prev => ({ ...prev, variable_name: configResponse.data[0].name }));
                }
            } else {
                setApiError(configResponse.error || 'Unknown error');
            }
        }
        setIsLoading(false);
    };
    
    useEffect(() => {
        loadData();
    }, []); // Note: 'isAuthorizedForWrite' removed from deps array as it derives from 'user' prop

    const handleUpdateSubmit = async (): Promise<void> => {
        setApiError(null);
        const valueAsNumber = parseFloat(formInput.variable_value); 

        if (!formInput.variable_name || !formInput.variable_value) {
            setApiError('Please select a variable and enter a value.');
            return;
        }
        if (isNaN(valueAsNumber) || valueAsNumber <= 0) {
            setApiError('Please enter a valid numeric value greater than zero.');
            return;
        }
        
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
            setApiError(result.error || 'Unknown submission error');
        }
    };

    return (
        <div className="container mx-auto px-8 py-8">
            {apiError && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">{apiError}</div>}

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
          _         <p className="text-sm font-medium">Viewing Access Only: Your role ({user.role}) does not permit updating Master Variables.</p>
                </div>
            )}
            
            <HistoryTable
                isLoading={isLoading}
                history={history}
            />
        </div>
    );
}
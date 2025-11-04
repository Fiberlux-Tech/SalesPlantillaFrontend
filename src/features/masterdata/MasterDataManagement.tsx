// src/features/masterdata/MasterDataManagement.tsx
import { useState, useEffect } from 'react';
import { getMasterVariableHistory, getEditableConfig, updateMasterVariable, type HistoryItem } from './masterDataService'; 
import { VariableUpdateForm } from './components/VariableUpdateForm';
import { HistoryTable } from './components/HistoryTable';
import { useAuth } from '@/contexts/AuthContext'; // <-- 1. Import the hook
// import type { User } from '@/types'; // No longer needed

interface MasterDataManagementProps {
    // 2. REMOVE user prop
    // user: User;
}

// ... (State interface definitions remain the same) ...
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

export default function MasterDataManagement({}: MasterDataManagementProps) { // <-- 3. Remove prop
    const { user } = useAuth(); // <-- 4. Get user from context

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [editableConfig, setEditableConfig] = useState<EditableConfigItem[]>([]); 
    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formInput, setFormInput] = useState<FormInputState>({
        variable_name: '',
        variable_value: '',
        comment: '',
    });

    // 5. Add a check for user
    if (!user) {
        return <div className="text-center py-12">Loading user data...</div>;
    }

    const isAuthorizedForWrite = user.role === 'ADMIN' || user.role === 'FINANCE';

    const loadData = async (): Promise<void> => {
        setIsLoading(true);
        setApiError(null);
        
        const historyResponse = await getMasterVariableHistory();
        if (historyResponse.success) {
            setHistory(historyResponse.data || []);
        } else {
            setApiError(historyResponse.error || 'Unknown error');
        }

        if (isAuthorizedForWrite) {
            const configResponse = await getEditableConfig();
            if (configResponse.success) {
                setEditableConfig(configResponse.data || []);
                if (configResponse.data && configResponse.data.length > 0) {
                    setFormInput(prev => ({ ...prev, variable_name: configResponse.data[0].name }));
                }
            } else {
                setApiError(configResponse.error || 'Unknown error');
            }
        }
        setIsLoading(false);
    };

    // 6. Add 'isAuthorizedForWrite' to the dependency array
    useEffect(() => {
        loadData();
    }, [isAuthorizedForWrite]);

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
            // We need to reload data to see the new history entry
            await loadData();
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
                    <p className="text-sm font-medium">Viewing Access Only: Your role ({user.role}) does not permit updating Master Variables.</p>
                </div>
            )}
            
            <HistoryTable
                isLoading={isLoading}
                  history={history}
            />
        </div>
    );
}
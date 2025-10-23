// src/features/masterdata/masterDataService.js

import { api } from '@/lib/api';

// --- Configuration/Helper Logic (MOVED FROM COMPONENT) ---
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


// --- Service Layer Functions ---

/**
 * Fetches the entire history of master variables.
 * @returns {Promise<{success: boolean, data: Array, error: string}>}
 */
export async function getMasterVariableHistory() {
    try {
        const result = await api.get('/api/master-variables');
        if (result.success) {
            return { success: true, data: result.data || [] };
        } else {
            return { success: false, error: result.error || 'Failed to fetch history.' };
        }
    } catch (error) {
        console.error('Error fetching master variable history:', error);
        return { success: false, error: 'Failed to connect to server or fetch history data.' };
    }
}

/**
 * Fetches the configuration for editable variables and parses it.
 * @returns {Promise<{success: boolean, data: Array, error: string}>}
 */
export async function getEditableConfig() {
    try {
        const response = await api.get('/api/master-variables/categories'); 

        if (response.success) {
            const parsedConfig = parseEditableConfig(response);
            return { success: true, data: parsedConfig };
        } else {
            return { success: false, error: response.error || 'Failed to fetch editable variables.' };
        }
    } catch (error) {
        console.error('Error fetching editable config:', error);
        return { success: false, error: 'Failed to fetch editable variable configuration.' };
    }
}

/**
 * Submits a new variable value.
 * @param {object} payload - { variable_name, variable_value, comment }
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function updateMasterVariable(payload) {
    try {
        const result = await api.post('/api/master-variables/update', payload);

        if (result.success) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error || 'Failed to update variable.' };
        }
    } catch (error) {
        console.error("Variable Update Service Failed:", error);
        return { success: false, error: 'Server error during variable update.' };
    }
}
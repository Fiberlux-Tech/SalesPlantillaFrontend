// src/features/transactions/services/shared.service.ts
import { api } from '@/lib/api';
import type { 
    KpiCalculationResponse,
    FixedCost,
    RecurringService 
} from '@/types';

// --- Types ---

// 1. Define the structure the API is ACTUALLY sending in its 'data' key
//    (Based on your lookup, it's an object containing the array)
interface RecurringServiceLookupResponse {
    recurring_services: RecurringService[];
    // We no longer expect a separate 'client_data' key
}

type CalculatePreviewResult = {
    success: true;
    data: KpiCalculationResponse['data'];
} | {
    success: false;
    error: string;
    data?: undefined;
};

// --- Functions ---

/**
 * Sends modified data to the backend for KPI recalculation (PREVIEW ONLY).
 */
export async function calculatePreview(payload: any): Promise<CalculatePreviewResult> {
    try {
        const result = await api.post<KpiCalculationResponse>('/api/calculate-preview', payload); 

        if (result && result.success) {
            return { success: true, data: result.data };
        } else {
             return { success: false, error: (result as any).error || 'Failed to calculate preview.' };
        }

    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to connect to the server for preview calculation.' };
    }
}

export async function getFixedCostsByCodes(codes: string[]): Promise<{ success: true; data: FixedCost[] } | { success: false; error: string; data?: undefined }> {
    try {
        const payload = { investment_codes: codes };
        const result = await api.post<{ success: boolean, data: { fixed_costs: FixedCost[] }, error?: string }>(
            '/api/fixed-costs/lookup', 
            payload
        );
        if (result.success) {
            const fixedCosts = result.data?.fixed_costs || [];
            return { success: true, data: fixedCosts };
        } else {
            return { success: false, error: result.error || 'Failed to fetch fixed costs.' };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Network error during code lookup.' };
    }
}

//
// --- 2. THIS FUNCTION IS NOW CORRECTED ---
//
export async function getRecurringServicesByCodes(codes: string[]): Promise<{ 
    success: true; 
    data: RecurringServiceLookupResponse // Return the object: { recurring_services: [...] }
} | { 
    success: false; 
    error: string; 
    data?: undefined 
}> {
    try {
        const payload = { service_codes: codes }; 
        // We expect the API to return { success: true, data: { recurring_services: [...] } }
        const result = await api.post<{ 
            success: boolean, 
            data: RecurringServiceLookupResponse, // This now matches the API
            error?: string 
        }>(
            '/api/recurring-services/lookup', 
            payload
        );
        if (result.success) {
            // Return the entire 'data' object
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error || 'Failed to fetch recurring services.' };
        }
    } catch (error: any) {
        return { success: false, error: error.message || 'Network error during code lookup.' };
    }
}
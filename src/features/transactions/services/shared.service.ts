// src/features/transactions/services/shared.service.ts
import { api } from '@/lib/api';
import type { 
    KpiCalculationResponse,
    FixedCost, 
} from '@/types';

// --- Types ---

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
 * This function is used by both Sales and Finance.
 */
export async function calculatePreview(payload: any): Promise<CalculatePreviewResult> {
    try {
        // The API response is expected to match KpiCalculationResponse on success
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
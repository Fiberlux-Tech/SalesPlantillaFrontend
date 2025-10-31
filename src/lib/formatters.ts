// src/lib/formatters.ts

/**
 * Handles currency formatting and returns '-' for zero/null/undefined values.
 * Assumes USD locale formatting.
 * @param {number | string | null | undefined} value
 * @returns {string}
 */
export const formatCurrency = (value: number | string | null | undefined): string => {
    const numValue = parseFloat(value as string);
    if (typeof numValue !== 'number' || isNaN(numValue) || numValue === 0) return '-';
    return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Handles non-currency data (text and numbers) and returns '-' for zero/null/undefined/empty/N/A.
 * @param {*} value
 * @returns {string | number}
 */
export const formatCellData = (value: any): string | number => {
    if (value === null || typeof value === 'undefined' || value === '' || value === 'N/A' || value === 0) {
        return '-';
    }
    return value; // Return original value otherwise
};
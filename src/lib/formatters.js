// fiberlux-tech/salesplantillafrontend/SalesPlantillaFrontend-64ed8b30ed6e79e4876344359d7698df855dbf56/src/lib/formatters.js

/**
 * Handles currency formatting and returns '-' for zero/null/undefined values.
 * Assumes USD locale formatting.
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = (value) => {
    const numValue = parseFloat(value);
    if (typeof numValue !== 'number' || isNaN(numValue) || numValue === 0) return '-';
    // Use Intl.NumberFormat for cleaner currency display
    return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Handles non-currency data (text and numbers) and returns '-' for zero/null/undefined/empty/N/A.
 * @param {*} value
 * @returns {*}
 */
export const formatCellData = (value) => {
    if (value === null || typeof value === 'undefined' || value === '' || value === 'N/A' || value === 0) {
        return '-';
    }
    return value; // Return original value otherwise
};
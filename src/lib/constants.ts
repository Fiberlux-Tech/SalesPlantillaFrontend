// src/lib/constants.ts
// ⚠️ DEPRECATED: This file is deprecated. Please use @/config instead.
// All constants have been moved to src/config/constants.ts for better organization.
// This file is kept temporarily for backwards compatibility and will be removed in a future version.

import { BUSINESS_UNITS, REGIONS as REGIONS_NEW, SALE_TYPES as SALE_TYPES_NEW } from '@/config';

/**
 * @deprecated Use BUSINESS_UNITS.LIST from '@/config' instead
 */
export const UNIDADES_NEGOCIO: string[] = [...BUSINESS_UNITS.LIST];

/**
 * @deprecated Use REGIONS.LIST from '@/config' instead
 */
export const REGIONS: string[] = [...REGIONS_NEW.LIST];

/**
 * @deprecated Use SALE_TYPES.LIST from '@/config' instead
 */
export const SALE_TYPES: ("NUEVO" | "EXISTENTE")[] = [...SALE_TYPES_NEW.LIST];
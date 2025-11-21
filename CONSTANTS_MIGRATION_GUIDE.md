# Constants Centralization Migration Guide

## Overview
This guide documents the centralization of 200+ hardcoded constants into a master configuration file (`src/config/constants.ts`).

## What's Been Completed

### ✅ Created Files:
1. **`src/config/constants.ts`** - Master configuration with 22 categories
2. **`src/config/index.ts`** - Barrel export file

### ✅ Updated Files (Priority 1 - Security & API):
1. **`src/lib/api.ts`** - Fully migrated to use `API_CONFIG`
   - CSRF cookie names
   - CSRF headers
   - HTTP methods requiring CSRF
   - Content-Type headers
   - HTTP methods

2. **`src/features/transactions/components/EditableCurrencyCell.tsx`** - Migrated to use `CURRENCIES`

### ✅ Build Status: **PASSING** ✅

---

## Configuration Categories Available

### 1. CURRENCIES
```typescript
import { CURRENCIES, type Currency } from '@/config';

CURRENCIES.PEN           // 'PEN'
CURRENCIES.USD           // 'USD'
CURRENCIES.LIST          // ['PEN', 'USD']
CURRENCIES.DEFAULT       // 'PEN'
CURRENCIES.DEFAULT_FIXED_COST      // 'USD'
CURRENCIES.DEFAULT_RECURRING_P     // 'PEN'
CURRENCIES.DEFAULT_RECURRING_CU    // 'USD'
```

### 2. TRANSACTION_STATUS
```typescript
import { TRANSACTION_STATUS, type TransactionStatus } from '@/config';

TRANSACTION_STATUS.PENDING    // 'PENDING'
TRANSACTION_STATUS.APPROVED   // 'APPROVED'
TRANSACTION_STATUS.REJECTED   // 'REJECTED'
TRANSACTION_STATUS.LIST       // ['PENDING', 'APPROVED', 'REJECTED']
```

### 3. BUSINESS_UNITS
```typescript
import { BUSINESS_UNITS, type BusinessUnit } from '@/config';

BUSINESS_UNITS.GIGALAN      // 'GIGALAN'
BUSINESS_UNITS.CORPORATIVO  // 'CORPORATIVO'
BUSINESS_UNITS.ESTADO       // 'ESTADO'
BUSINESS_UNITS.LIST         // ['GIGALAN', 'CORPORATIVO', 'ESTADO']
```

### 4. REGIONS
```typescript
import { REGIONS } from '@/config';

REGIONS.LIMA                    // 'LIMA'
REGIONS.PROVINCIAS_CACHING      // 'PROVINCIAS CON CACHING'
REGIONS.PROVINCIAS_INTERNEXA    // 'PROVINCIAS CON INTERNEXA'
REGIONS.PROVINCIAS_TDP          // 'PROVINCIAS CON TDP'
REGIONS.LIST                    // Array of all regions
```

### 5. SALE_TYPES
```typescript
import { SALE_TYPES, type SaleType } from '@/config';

SALE_TYPES.NUEVO       // 'NUEVO'
SALE_TYPES.EXISTENTE   // 'EXISTENTE'
SALE_TYPES.LIST        // ['NUEVO', 'EXISTENTE']
```

### 6. API_CONFIG
```typescript
import { API_CONFIG } from '@/config';

// Endpoints
API_CONFIG.ENDPOINTS.TRANSACTIONS_LIST          // '/api/transactions'
API_CONFIG.ENDPOINTS.CALCULATE_PREVIEW          // '/api/calculate-preview'
API_CONFIG.ENDPOINTS.FIXED_COSTS_LOOKUP         // '/api/fixed-costs/lookup'

// CSRF
API_CONFIG.CSRF.COOKIE_NAMES                    // ['XSRF-TOKEN', 'csrf_token', 'csrftoken']
API_CONFIG.CSRF.HEADERS.XSRF                    // 'X-XSRF-TOKEN'
API_CONFIG.CSRF.HEADERS.CSRF                    // 'X-CSRF-Token'
API_CONFIG.CSRF.METHODS_REQUIRING_CSRF          // ['POST', 'PUT', 'DELETE', 'PATCH']

// HTTP
API_CONFIG.HTTP.CONTENT_TYPE_HEADER             // 'Content-Type'
API_CONFIG.HTTP.CONTENT_TYPE_JSON               // 'application/json'
API_CONFIG.HTTP.METHOD_GET                      // 'GET'
API_CONFIG.HTTP.METHOD_POST                     // 'POST'
```

### 7. PAGINATION
```typescript
import { PAGINATION } from '@/config';

PAGINATION.PER_PAGE        // 30
PAGINATION.DEFAULT_PAGE    // 1
```

### 8. TIMING
```typescript
import { TIMING } from '@/config';

TIMING.DEBOUNCE_RECALCULATION_MS  // 500
```

### 9. VALIDATION_RULES
```typescript
import { VALIDATION_RULES } from '@/config';

VALIDATION_RULES.PLAZO_CONTRATO    // { min: 1, step: 1 }
VALIDATION_RULES.CURRENCY_AMOUNT   // { min: 0, step: 0.01 }
VALIDATION_RULES.GIGALAN_OLD_MRC   // { min: 0 }
```

### 10. DEFAULT_VALUES
```typescript
import { DEFAULT_VALUES } from '@/config';

DEFAULT_VALUES.PLAZO_CONTRATO      // 12
DEFAULT_VALUES.APPROVAL_STATUS     // 'PENDING'
DEFAULT_VALUES.MRC_CURRENCY        // 'PEN'
DEFAULT_VALUES.NRC_CURRENCY        // 'PEN'
```

### 11. FORMAT_OPTIONS
```typescript
import { FORMAT_OPTIONS } from '@/config';

FORMAT_OPTIONS.CURRENCY_DECIMALS          // 2
FORMAT_OPTIONS.EXCHANGE_RATE_DECIMALS     // 4
FORMAT_OPTIONS.PERCENTAGE_DECIMALS        // 2
FORMAT_OPTIONS.CASH_FLOW_DECIMALS         // 0
FORMAT_OPTIONS.LOCALE                     // 'en-US'
```

### 12. UI_LABELS
```typescript
import { UI_LABELS } from '@/config';

UI_LABELS.TRANSACTION_OVERVIEW    // 'Transaction Overview'
UI_LABELS.TIPO_CAMBIO             // 'Tipo de Cambio'
UI_LABELS.INGRESOS_TOTALES        // 'Ingresos Totales'
UI_LABELS.FLUJO_CAJA              // 'Flujo de Caja'
// ... 50+ more labels
```

### 13. BUTTON_LABELS
```typescript
import { BUTTON_LABELS } from '@/config';

BUTTON_LABELS.APROBAR      // 'Aprobar'
BUTTON_LABELS.RECHAZAR     // 'Rechazar'
BUTTON_LABELS.CONFIRMAR    // 'Confirmar'
```

### 14. VALIDATION_MESSAGES
```typescript
import { VALIDATION_MESSAGES } from '@/config';

VALIDATION_MESSAGES.PLAZO_INVALID            // 'Please enter a valid...'
VALIDATION_MESSAGES.UNIDAD_REQUIRED          // 'Selección obligatoria...'
VALIDATION_MESSAGES.CODE_ALREADY_LOADED      // 'Code {code} is already loaded.'
VALIDATION_MESSAGES.CLIENT_MISMATCH_TITLE    // 'Error: No puedes agregar...'
```

### 15. CONFIRMATION_MESSAGES
```typescript
import { CONFIRMATION_MESSAGES } from '@/config';

CONFIRMATION_MESSAGES.APPROVE_TRANSACTION      // '¿Estás seguro/a...'
CONFIRMATION_MESSAGES.REJECT_TRANSACTION       // '¿Estás seguro/a...'
CONFIRMATION_MESSAGES.CALCULATE_COMMISSION     // '¿Estás seguro/a...'
```

### 16. PLACEHOLDERS
```typescript
import { PLACEHOLDERS } from '@/config';

PLACEHOLDERS.SELECT_FIELD       // 'Selecciona {field}...'
PLACEHOLDERS.ENTER_AMOUNT       // 'Enter amount'
PLACEHOLDERS.INVESTMENT_CODE    // 'E.G., WIN-001'
PLACEHOLDERS.SERVICE_CODE       // 'E.G., Q-12345'
```

### 17. EMPTY_STATE_MESSAGES
```typescript
import { EMPTY_STATE_MESSAGES } from '@/config';

EMPTY_STATE_MESSAGES.NO_FIXED_COSTS          // 'No fixed cost data...'
EMPTY_STATE_MESSAGES.NO_RECURRING_SERVICES   // 'No recurring services...'
EMPTY_STATE_MESSAGES.NO_CASH_FLOW            // 'No cash flow data...'
```

### 18. STATUS_MESSAGES
```typescript
import { STATUS_MESSAGES } from '@/config';

STATUS_MESSAGES.FINANCE_EDIT_MODE         // 'Finance Edit Mode Active'
STATUS_MESSAGES.APPROVED_TITLE            // 'Plantilla Aprobada!'
STATUS_MESSAGES.REJECTED_MESSAGE          // 'No se logro aprobar...'
```

### 19. DISPLAY_VALUES
```typescript
import { DISPLAY_VALUES } from '@/config';

DISPLAY_VALUES.EMPTY             // '-'
DISPLAY_VALUES.NOT_AVAILABLE     // 'N/A'
DISPLAY_VALUES.ZERO              // 0
```

### 20. BOOLEAN_LABELS
```typescript
import { BOOLEAN_LABELS } from '@/config';

BOOLEAN_LABELS.TRUE    // 'SI'
BOOLEAN_LABELS.FALSE   // 'NO'
```

---

## Remaining Files to Update

### Priority 2: Core Business Logic (8 files)
- `src/features/transactions/components/TransactionPreviewContent.tsx`
- `src/features/transactions/components/StatusBadge.tsx`
- `src/features/transactions/components/FixedCostsTable.tsx`
- `src/features/transactions/components/RecurringServicesTable.tsx`
- `src/features/transactions/components/GigaLanCommissionInputs.tsx`
- `src/features/transactions/TransactionDashboard.tsx`
- `src/features/transactions/components/CashFlowTimelineTable.tsx`
- `src/features/transactions/components/KpiMetricsGrid.tsx`

### Priority 3: Configuration (5 files)
- `src/contexts/TransactionPreviewContext.tsx`
- `src/features/transactions/services/sales.service.ts`
- `src/features/transactions/services/finance.service.ts`
- `src/features/transactions/services/shared.service.ts`
- `src/lib/formatters.ts`

### Priority 4: UI Components (15+ files)
- `src/features/transactions/components/TransactionOverviewInputs.tsx`
- `src/features/transactions/components/FixedCostCodeManager.tsx`
- `src/features/transactions/components/RecurringServiceCodeManager.tsx`
- `src/features/transactions/footers/FinancePreviewFooter.tsx`
- `src/features/transactions/footers/SalesPreviewFooter.tsx`
- `src/features/masterdata/MasterDataManagement.tsx`
- And others...

---

## Migration Pattern Examples

### Example 1: Currency Values
**Before:**
```typescript
const currency = 'PEN';
const validCurrencies = ['PEN', 'USD'];
```

**After:**
```typescript
import { CURRENCIES } from '@/config';

const currency = CURRENCIES.PEN;
const validCurrencies = CURRENCIES.LIST;
```

### Example 2: Status Values
**Before:**
```typescript
if (status === 'PENDING') { ... }
```

**After:**
```typescript
import { TRANSACTION_STATUS } from '@/config';

if (status === TRANSACTION_STATUS.PENDING) { ... }
```

### Example 3: API Endpoints
**Before:**
```typescript
const result = await api.get(`/api/transactions?page=${page}&per_page=30`);
```

**After:**
```typescript
import { API_CONFIG, PAGINATION } from '@/config';

const result = await api.get(`${API_CONFIG.ENDPOINTS.TRANSACTIONS_LIST}?page=${page}&per_page=${PAGINATION.PER_PAGE}`);
```

### Example 4: Validation Messages
**Before:**
```typescript
setError('Please enter a valid non-negative number for MRC.');
```

**After:**
```typescript
import { VALIDATION_MESSAGES } from '@/config';

setError(VALIDATION_MESSAGES.MRC_INVALID);
```

### Example 5: UI Labels
**Before:**
```typescript
<label>Tipo de Cambio</label>
```

**After:**
```typescript
import { UI_LABELS } from '@/config';

<label>{UI_LABELS.TIPO_CAMBIO}</label>
```

---

## Benefits of This Migration

1. **Single Source of Truth**: All constants in one place
2. **Type Safety**: TypeScript types prevent typos
3. **Easy Updates**: Change values once, apply everywhere
4. **Better Discoverability**: IDE autocomplete shows all available constants
5. **i18n Ready**: Easy to extract for internationalization
6. **Testability**: Mock constants easily in tests
7. **Documentation**: Self-documenting with organized categories

---

## Next Steps

To complete the migration:

1. Update service files (Priority 2)
2. Update context/hooks (Priority 3)
3. Update UI components (Priority 4)
4. Remove deprecated `src/lib/constants.ts`
5. Run full test suite
6. Update documentation

---

## Breaking Changes

### For `src/lib/constants.ts`:
The old constants file exports are temporarily maintained for backwards compatibility:
```typescript
export const UNIDADES_NEGOCIO = BUSINESS_UNITS.LIST;
export const REGIONS_LEGACY = REGIONS.LIST;
export const SALE_TYPES_LEGACY = SALE_TYPES.LIST;
```

**TODO**: Remove these after all files are migrated.

---

## Questions or Issues?

If you encounter any TypeScript errors during migration:
1. Ensure you're importing from `@/config`
2. Check if the constant exists in `constants.ts`
3. Verify the type is correct (e.g., `Currency`, `TransactionStatus`)

---

*Last Updated: 2025-11-21*

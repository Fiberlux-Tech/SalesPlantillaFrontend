// src/config/constants.ts
// Master Configuration File - All application constants centralized here

/**
 * Currency Configuration
 * Defines all currency codes used throughout the application
 */
export const CURRENCIES = {
  PEN: 'PEN' as const,
  USD: 'USD' as const,
  LIST: ['PEN', 'USD'] as const,
  DEFAULT: 'PEN' as const,
  DEFAULT_FIXED_COST: 'USD' as const,
  DEFAULT_RECURRING_P: 'PEN' as const,
  DEFAULT_RECURRING_CU: 'USD' as const,
} as const;

export type Currency = typeof CURRENCIES.PEN | typeof CURRENCIES.USD;

/**
 * Transaction Status Configuration
 * Defines all possible transaction approval statuses
 */
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING' as const,
  APPROVED: 'APPROVED' as const,
  REJECTED: 'REJECTED' as const,
  LIST: ['PENDING', 'APPROVED', 'REJECTED'] as const,
} as const;

export type TransactionStatus = typeof TRANSACTION_STATUS.PENDING | typeof TRANSACTION_STATUS.APPROVED | typeof TRANSACTION_STATUS.REJECTED;

/**
 * Business Unit Configuration
 * Defines the business units (Unidades de Negocio)
 */
export const BUSINESS_UNITS = {
  GIGALAN: 'GIGALAN' as const,
  CORPORATIVO: 'CORPORATIVO' as const,
  ESTADO: 'ESTADO' as const,
  LIST: ['GIGALAN', 'CORPORATIVO', 'ESTADO'] as const,
} as const;

export type BusinessUnit = typeof BUSINESS_UNITS.GIGALAN | typeof BUSINESS_UNITS.CORPORATIVO | typeof BUSINESS_UNITS.ESTADO;

/**
 * Region Configuration
 * Defines the geographical regions for service deployment
 */
export const REGIONS = {
  LIMA: 'LIMA' as const,
  PROVINCIAS_CACHING: 'PROVINCIAS CON CACHING' as const,
  PROVINCIAS_INTERNEXA: 'PROVINCIAS CON INTERNEXA' as const,
  PROVINCIAS_TDP: 'PROVINCIAS CON TDP' as const,
  LIST: ['LIMA', 'PROVINCIAS CON CACHING', 'PROVINCIAS CON INTERNEXA', 'PROVINCIAS CON TDP'] as const,
} as const;

/**
 * Sale Type Configuration
 * Defines the types of sales (new customer vs existing customer)
 */
export const SALE_TYPES = {
  NUEVO: 'NUEVO' as const,
  EXISTENTE: 'EXISTENTE' as const,
  LIST: ['NUEVO', 'EXISTENTE'] as const,
} as const;

export type SaleType = typeof SALE_TYPES.NUEVO | typeof SALE_TYPES.EXISTENTE;

/**
 * API Configuration
 * Centralized API endpoints and related configuration
 */
export const API_CONFIG = {
  ENDPOINTS: {
    // Transaction endpoints
    TRANSACTIONS_LIST: '/api/transactions',
    TRANSACTION_DETAIL: '/api/transaction',
    PROCESS_EXCEL: '/api/process-excel',
    SUBMIT_TRANSACTION: '/api/submit-transaction',
    CALCULATE_PREVIEW: '/api/calculate-preview',
    CALCULATE_COMMISSION: '/api/transaction/:id/calculate-commission',
    APPROVE_TRANSACTION: 'approve',
    REJECT_TRANSACTION: 'reject',

    // Lookup endpoints
    FIXED_COSTS_LOOKUP: '/api/fixed-costs/lookup',
    RECURRING_SERVICES_LOOKUP: '/api/recurring-services/lookup',

    // Master data endpoints
    MASTER_VARIABLES: '/api/master-variables',
    MASTER_VARIABLES_CATEGORIES: '/api/master-variables/categories',
    MASTER_VARIABLES_UPDATE: '/api/master-variables/update',

    // Admin endpoints
    ADMIN_USERS: '/api/admin/users',
    ADMIN_USER_ROLE: '/api/admin/users/:id/role',
    ADMIN_USER_RESET_PASSWORD: '/api/admin/users/:id/reset-password',
  },

  // CSRF Configuration
  CSRF: {
    COOKIE_NAMES: ['XSRF-TOKEN', 'csrf_token', 'csrftoken'],
    HEADERS: {
      XSRF: 'X-XSRF-TOKEN',
      CSRF: 'X-CSRF-Token',
    },
    METHODS_REQUIRING_CSRF: ['POST', 'PUT', 'DELETE', 'PATCH'],
  },

  // HTTP Configuration
  HTTP: {
    CREDENTIALS_MODE: 'include',
    CONTENT_TYPE_HEADER: 'Content-Type',
    CONTENT_TYPE_JSON: 'application/json',
    METHOD_GET: 'GET',
    METHOD_POST: 'POST',
  },
} as const;

/**
 * Pagination Configuration
 * Default pagination settings for list views
 */
export const PAGINATION = {
  PER_PAGE: 30,
  DEFAULT_PAGE: 1,
} as const;

/**
 * Timing Configuration
 * Timeouts, debounce delays, and other timing-related values
 */
export const TIMING = {
  DEBOUNCE_RECALCULATION_MS: 500,
} as const;

/**
 * Validation Rules
 * Min/max values and step increments for form inputs
 */
export const VALIDATION_RULES = {
  PLAZO_CONTRATO: { min: 1, step: 1 },
  CURRENCY_AMOUNT: { min: 0, step: 0.01 },
  QUANTITY: { min: 0, step: 1 },
  PERIODO_INICIO: { min: 0, step: 1 },
  DURACION_MESES: { min: 1, step: 1 },
  GIGALAN_OLD_MRC: { min: 0 },
} as const;

/**
 * Default Values
 * Default values for form fields and initialization
 */
export const DEFAULT_VALUES = {
  PLAZO_CONTRATO: 12,
  APPROVAL_STATUS: TRANSACTION_STATUS.PENDING,
  MRC_CURRENCY: CURRENCIES.PEN,
  NRC_CURRENCY: CURRENCIES.PEN,
  NUMERIC_ZERO: 0,
} as const;

/**
 * Format Options
 * Number and date formatting configuration
 */
export const FORMAT_OPTIONS = {
  CURRENCY_DECIMALS: 2,
  EXCHANGE_RATE_DECIMALS: 4,
  PERCENTAGE_DECIMALS: 2,
  CASH_FLOW_DECIMALS: 0,
  LOCALE: 'en-US',
  DATE_PAD_LENGTH: 2,
  DATE_PAD_CHAR: '0',
} as const;

/**
 * Display Values
 * Special values used for display purposes
 */
export const DISPLAY_VALUES = {
  EMPTY: '-',
  NOT_AVAILABLE: 'N/A',
  ZERO: 0,
} as const;

/**
 * Boolean Display Labels
 * Spanish labels for boolean values
 */
export const BOOLEAN_LABELS = {
  TRUE: 'SI',
  FALSE: 'NO',
} as const;

/**
 * UI Labels
 * All user-facing text labels (Spanish)
 */
export const UI_LABELS = {
  // Transaction Overview
  TRANSACTION_OVERVIEW: 'Transaction Overview',
  TIPO_CAMBIO: 'Tipo de Cambio',
  COSTO_CAPITAL: 'Costo Capital',
  TASA_CARTA_FIANZA: 'Tasa Carta Fianza',
  COSTO_CARTA_FIANZA: 'Costo Carta Fianza',
  UNIDAD_NEGOCIO: 'Unidad de Negocio',
  RUC_DNI: 'RUC/DNI',
  NOMBRE_CLIENTE: 'Nombre Cliente',
  PLAZO_CONTRATO: 'Plazo de Contrato',
  MRC_RECURRENTE: 'MRC (Recurrente Mensual)',
  NRC_PAGO_UNICO: 'NRC (Pago Único)',
  COMISION_VENTAS: 'Comisión de Ventas',
  APLICA_CARTA_FIANZA: 'Aplica Carta Fianza',
  REGION: 'Región',
  TIPO_VENTA: 'Tipo de Venta',
  MRC_PREVIO: 'MRC PREVIO',

  // KPIs
  INGRESOS_TOTALES: 'Ingresos Totales',
  GASTOS_TOTALES: 'Gastos Totales',
  UTILIDAD_BRUTA: 'Utilidad Bruta',
  MARGEN_BRUTO: 'Margen Bruto (%)',
  PERIODO_PAYBACK: 'Periodo de Payback',
  TIR: 'TIR',
  VAN: 'VAN',
  COSTO_INSTALACION: 'Costo Instalación (%)',

  // Table Headers - Fixed Costs
  CATEGORIA: 'Categoría',
  TIPO_SERVICIO: 'Tipo Servicio',
  TICKET: 'Ticket',
  UBICACION: 'Ubicación',
  CANTIDAD: 'Cantidad',
  COSTO_UNITARIO: 'Costo Unitario',
  INICIO_MES: 'Inicio (Mes)',
  DURACION_MESES: 'Duración (Meses)',
  MONEDA: 'Moneda',
  TOTAL: 'Total',

  // Table Headers - Recurring Services
  Q: 'Q',
  P: 'P',
  INGRESO: 'Ingreso',
  EGRESO: 'Egreso',
  CU1: 'CU1',
  CU2: 'CU2',
  PROVEEDOR: 'Proveedor',

  // Cash Flow
  FLUJO_CAJA: 'Flujo de Caja',
  INGRESO_NRC: 'Ingreso (NRC)',
  INGRESO_MRC: 'Ingreso (MRC)',
  EGRESO_COMISIONES: 'Egreso (Comisiones)',
  EGRESO_RECURRENTE: 'Egreso (Recurrente)',
  NET_CASH_FLOW: 'Net Cash Flow',

  // Service Details
  DETALLE_SERVICIOS: 'Detalle de Servicios',
  SERVICIOS_RECURRENTES: 'Servicios Recurrentes',
  INVERSION_COSTOS_FIJOS: 'Inversión (Costos Fijos)',

  // Units
  MESES: 'meses',
  PERCENTAGE: '%',
} as const;

/**
 * Button Labels
 * All button text labels (Spanish)
 */
export const BUTTON_LABELS = {
  COMISIONES: 'Comisiones',
  RECHAZAR: 'Rechazar',
  APROBAR: 'Aprobar',
  CANCELAR: 'Cancelar',
  CONFIRMAR: 'Confirmar',
  CARGAR: 'Cargar',
} as const;

/**
 * Validation Messages
 * Error and validation messages for form fields
 */
export const VALIDATION_MESSAGES = {
  PLAZO_INVALID: 'Please enter a valid whole number greater than 0 for Plazo Contrato.',
  UNIDAD_REQUIRED: 'Selección obligatoria: Por favor, selecciona una Unidad de Negocio válida.',
  REGION_REQUIRED: 'Selección obligatoria: Por favor, selecciona una Región válida.',
  TIPO_VENTA_REQUIRED: 'Selección obligatoria: Por favor, selecciona un Tipo de Venta válido.',
  MRC_INVALID: 'Please enter a valid non-negative number for MRC.',
  NRC_INVALID: 'Please enter a valid non-negative number for NRC.',
  CODE_EMPTY: 'Por favor, ingresa un código.',
  CODE_ALREADY_LOADED: 'Code {code} is already loaded.',
  NO_SERVICE_RETURNED: 'Error: El código no devolvió ningún servicio.',
  NO_CLIENT_DATA: 'Error: Los datos del cliente (RUC/Razón Social) no vinieron en la respuesta. Contactar a backend.',
  CLIENT_MISMATCH_TITLE: 'Error: No puedes agregar servicios de un cliente diferente.',
  CLIENT_MISMATCH_CURRENT: 'Cliente Actual: {name} (RUC: {ruc})',
  CLIENT_MISMATCH_NEW: 'Nuevo Cliente: {name} (RUC: {ruc})',
  CLIENT_MISMATCH_FOOTER: 'Todos los servicios deben pertenecer al mismo cliente.',
} as const;

/**
 * Confirmation Messages
 * Confirmation dialog messages
 */
export const CONFIRMATION_MESSAGES = {
  APPROVE_TRANSACTION: '¿Estás seguro/a de aprobar esta transacción?',
  REJECT_TRANSACTION: '¿Estás seguro/a de rechazar esta transacción?',
  CALCULATE_COMMISSION: '¿Estás seguro/a de realizar el cálculo de comisión? Esto actualizará la base de datos.',
} as const;

/**
 * Placeholder Text
 * Placeholder text for input fields
 */
export const PLACEHOLDERS = {
  SELECT_FIELD: 'Selecciona {field}...',
  ENTER_AMOUNT: 'Enter amount',
  INVESTMENT_CODE: 'E.G., WIN-001',
  SERVICE_CODE: 'E.G., Q-12345',
} as const;

/**
 * Empty State Messages
 * Messages shown when data is not available
 */
export const EMPTY_STATE_MESSAGES = {
  NO_FIXED_COSTS: 'No fixed cost data available.',
  NO_RECURRING_SERVICES: 'No recurring services data available.',
  NO_CASH_FLOW: 'No cash flow data available.',
  NO_INVESTMENT_DATA: 'No hay datos de inversión cargados.',
  NO_RECURRING_SERVICES_LOADED: 'No hay servicios recurrentes cargados.',
  USE_CARGAR_BUTTON: 'Use el botón \'Cargar\' para agregar {type} por código.',
} as const;

/**
 * Status Messages
 * Banner and status-related messages
 */
export const STATUS_MESSAGES = {
  FINANCE_EDIT_MODE: 'Finance Edit Mode Active',
  FINANCE_EDIT_INFO: 'Puedes modificar los valores clave (Unidad, Plazo, MRC, NRC, Gigalan, Periodos) antes de aprobar/rechazar.',
  APPROVED_TITLE: 'Plantilla Aprobada!',
  APPROVED_MESSAGE: 'Esta plantilla ya fue aprobada. Felicidades',
  REJECTED_TITLE: 'Plantilla Rechazada!',
  REJECTED_MESSAGE: 'No se logro aprobar. Comunicate con mesadeprecios@fiberlux.pe para indagar porque.',
  DATA_FROM_EXCEL: 'Toda la data es inicialmente extraida del excel',
  TRANSACTION_STATUS: 'Transaction Status: {status}',
  MODIFICATION_NOT_ALLOWED: 'Modification of key inputs is not allowed once a transaction has been reviewed.',
  REVIEW_DATA_CAREFULLY: 'Por favor revisar la data cargada de manera minuciosa',
  REVIEW_DATA_MESSAGE: 'Asegúrate que toda la información sea correcta antes de confirmarla.',
} as const;

// Legacy exports for backwards compatibility
// TODO: Remove these after migration is complete
export const UNIDADES_NEGOCIO = BUSINESS_UNITS.LIST;
export const REGIONS_LEGACY = REGIONS.LIST;
export const SALE_TYPES_LEGACY = SALE_TYPES.LIST;

// src/types/index.ts

// 1. User and Auth
export type UserRole = "ADMIN" | "SALES" | "FINANCE" | "USER";

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  username: string;
  role: UserRole;
}

// 2. Core Data Models
export interface Transaction {
  id: number;
  transactionID?: string; // From Excel
  clientName: string;
  companyID?: string;
  orderID?: string;
  salesman: string;
  submissionDate: string;
  approvalDate?: string;
  ApprovalStatus: "PENDING" | "APPROVED" | "REJECTED";
  
  // Financials
  MRC: number;
  NRC: number;
  mrc_currency: "PEN" | "USD";
  nrc_currency: "PEN" | "USD";
  plazoContrato: number;
  tipoCambio: number;
  costoCapitalAnual: number;
  costoInstalacion: number;

  // KPIs
  VAN: number;
  TIR: number;
  payback: number;
  totalRevenue: number;
  totalExpense: number;
  grossMargin: number;
  grossMarginRatio: number;
  costoInstalacionRatio: number;
  comisiones: number;

  // Gigalan Specific
  unidadNegocio: string;
  gigalan_region?: string;
  gigalan_sale_type?: "NUEVO" | "EXISTENTE";
  gigalan_old_mrc?: number | null;
}

export interface FixedCost {
  id: number;
  categoria: string;
  tipo_servicio: string;
  ticket: string;
  ubicacion: string;
  cantidad: number;
  costoUnitario: number;
  costo_currency: "PEN" | "USD";
  periodo_inicio: number;
  duracion_meses: number;
  total: number;
}

export interface RecurringService {
  id: number;
  tipo_servicio: string;
  ubicacion: string;
  Q: number;
  P: number;
  p_currency: "PEN" | "USD";
  ingreso: number;
  CU1: number;
  CU2: number;
  proveedor: string;
  cu_currency: "PEN" | "USD";
  egreso: number;
}

export interface CashFlowTimeline {
  periods: string[];
  revenues: {
    nrc: number[];
    mrc: number[];
  };
  expenses: {
    comisiones: number[];
    egreso: number[];
    fixed_costs: Array<{
      id: number;
      tipo_servicio?: string;
      categoria?: string;
      timeline_values: number[];
    }>;
  };
  net_cash_flow: number[];
}

// 3. API Response Payloads
// Note: We use generics for list responses

interface ApiListResponse<T> {
  success: boolean;
  data: {
    transactions: T[];
    pages: number;
  };
  error?: string;
}

export type SalesTransactionListResponse = ApiListResponse<Transaction>;
export type FinanceTransactionListResponse = ApiListResponse<Transaction>;

// For single transaction details
export interface TransactionDetailResponse {
  success: boolean;
  data: {
    transactions: Transaction;
    fixed_costs: FixedCost[];
    recurring_services: RecurringService[];
    timeline: CashFlowTimeline;
    fileName?: string; // From Excel upload
  };
  error?: string;
}

// For KPI calculation
export interface KpiCalculationResponse {
    success: boolean;
    data: {
        // This includes all the KPI fields from Transaction
        // plus the timeline
        [key: string]: any; // Simplified for brevity
        timeline: CashFlowTimeline;
    };
    error?: string;
}

// For service success/error messages
export interface BaseApiResponse {
    success: boolean;
    error?: string;
    message?: string;
    data?: any; // For flexible responses
}
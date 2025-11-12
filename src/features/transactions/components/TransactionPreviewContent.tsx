// src/features/transactions/components/TransactionPreviewContent.tsx
import { useState, useMemo } from 'react';
import CostBreakdownRow from '@/features/transactions/components/CostBreakdownRow';
import {
    WarningIcon,
    CheckCircleIcon,
} from '@/components/shared/Icons';
import FixedCostsTable from '@/features/transactions/components/FixedCostsTable';
import RecurringServicesTable from './RecurringServicesTable';
import CashFlowTimelineTable from '@/features/transactions/components/CashFlowTimelineTable';
import { formatCurrency } from '@/lib/formatters';
import { FixedCostCodeManager, FixedCostEmptyState } from '@/features/transactions/components/FixedCostCodeManager';
import { 
    RecurringServiceCodeManager, 
    RecurringServiceEmptyState 
} from './RecurringServiceCodeManager';
import { TransactionOverviewInputs } from './TransactionOverviewInputs';
import { KpiMetricsGrid } from './KpiMetricsGrid';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext';

// --- 1. Definir los tipos de data que esperamos ---
import type { RecurringService } from '@/types';
// This interface now matches the 'data' object from the API
interface RecurringServiceLookupResponse {
    recurring_services: RecurringService[];
    // We no longer expect a client_data key
}

type OpenSectionsState = Record<string, boolean>;

export function TransactionPreviewContent({ isFinanceView = false }: { isFinanceView?: boolean }) {

    // (State and Memos remain the same)
    const {
        baseTransaction,
        draftState,
        dispatch,
        canEdit
    } = useTransactionPreview();
    const {
        liveKpis,
        currentFixedCosts,
        currentRecurringServices
    } = draftState;
    const [isCodeManagerOpen, setIsCodeManagerOpen] = useState(false);
    const [isRecurringCodeManagerOpen, setIsRecurringCodeManagerOpen] = useState(false);
    const [openSections, setOpenSections] = useState<OpenSectionsState>({
        'cashFlow': false,
        'recurringCosts': false,
        'fixedCosts': false
    });
    const tx = baseTransaction.transactions;
    const timeline = liveKpis?.timeline || baseTransaction?.timeline;
    const isPending = tx.ApprovalStatus === 'PENDING';
    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };
    const totalFixedCosts = useMemo(() => (currentFixedCosts || []).reduce((acc, item) => acc + (item.total || 0), 0), [currentFixedCosts]);
    const totalRecurringCosts = useMemo(() => (currentRecurringServices || []).reduce((acc, item) => acc + (item.egreso || 0), 0), [currentRecurringServices]);
    const totalRecurringIncome = useMemo(() => (currentRecurringServices || []).reduce((acc, item) => acc + (item.ingreso || 0), 0), [currentRecurringServices]);
    const loadedFixedCostCodes = useMemo(() => {
        return (currentFixedCosts || [])
            .map(c => c.ticket)
            .filter((code, index, self) => code && self.indexOf(code) === index);
    }, [currentFixedCosts]);
    const loadedRecurringServiceCodes = useMemo(() => {
        return (currentRecurringServices || [])
            .map(c => String(c.id)) 
            .filter((code, index, self) => code && self.indexOf(code) === index);
    }, [currentRecurringServices]);
    
    
    // (CustomFixedCostTotalsNode remains the same)
    const CustomFixedCostTotalsNode = () => {
        const showCodeManagerUI = !isFinanceView || canEdit;
        if (!showCodeManagerUI) {
            return (
                <div>
                    <p className="font-semibold text-red-600 text-right">{formatCurrency(totalFixedCosts)}</p>
                    <p className="text-xs text-gray-500 text-right">Total</p>
                </div>
            );
        }
        return (
            <div className="flex items-center space-x-3 relative">
                <div className="text-right">
                    <p className="font-semibold text-red-600">{formatCurrency(totalFixedCosts)}</p>
                    <p className="text-xs text-gray-500">Total</p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsCodeManagerOpen(true); }}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Cargar
                </button>
                {isCodeManagerOpen && (
                    <FixedCostCodeManager
                        loadedCodes={loadedFixedCostCodes}
                        onFixedCostAdd={(newCosts) => {
                            dispatch({ type: 'ADD_FIXED_COSTS', payload: newCosts });
                        }}
                        onToggle={() => setIsCodeManagerOpen(false)}
                        onCodeRemove={(code) => {
                            dispatch({ type: 'REMOVE_FIXED_COST', payload: code });
                        }}
                    />
                )}
            </div>
        );
    };

    // --- 2. THIS COMPONENT CONTAINS THE FIX ---
    const CustomRecurringServiceTotalsNode = () => {
        const showCodeManagerUI = !isFinanceView || canEdit;

        const totalsNode = (
            <div className="flex space-x-4"> 
                <div> 
                    <p className="font-semibold text-green-600 text-right">{formatCurrency(totalRecurringIncome)}</p> 
                    <p className="text-xs text-gray-500 text-right">Ingreso</p> 
                </div> 
                <div> 
                    <p className="font-semibold text-red-600 text-right">{formatCurrency(totalRecurringCosts)}</p> 
                    <p className="text-xs text-gray-500 text-right">Egreso</p> 
                </div> 
            </div>
        );

        if (!showCodeManagerUI) {
            return totalsNode;
        }

        return (
            <div className="flex items-center space-x-3 relative">
                {totalsNode}
                <button
                    onClick={(e) => { e.stopPropagation(); setIsRecurringCodeManagerOpen(true); }}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Cargar
                </button>

                {isRecurringCodeManagerOpen && (
                    <RecurringServiceCodeManager
                        loadedCodes={loadedRecurringServiceCodes}
                        // --- 3. THIS IS THE KEY LOGIC CHANGE ---
                        // The 'data' param now matches the API: { recurring_services: [...] }
                        onRecurringServiceAdd={(data: RecurringServiceLookupResponse) => {
                            const newServices = data.recurring_services;
                            
                            if (!newServices || newServices.length === 0) {
                                alert("Error: El código no devolvió ningún servicio.");
                                return;
                            }

                            // --- FIX ---
                            // Get client data from the *first service* in the list
                            // We cast to 'any' because 'ruc' and 'razon_social' are
                            // not in the base 'RecurringService' type in /types/index.ts
                            const firstService = newServices[0] as any;
                            const newRUC = firstService.ruc;
                            const newClientName = firstService.razon_social;
                            // --- END FIX ---

                            if (!newRUC || !newClientName) {
                                alert("Error: Los datos del cliente (RUC/Razón Social) no vinieron en la respuesta. Contactar a backend.");
                                return;
                            }

                            // Get current client data from our modal's state
                            const currentState = { ...baseTransaction.transactions, ...draftState.liveEdits };
                            const currentRUC = currentState.companyID;
                            const currentClientName = currentState.clientName;

                            // VALIDATION LOGIC
                            // Case 1: RUC is empty (e.g., "Nueva Plantilla"). Populate it.
                            if (!currentRUC || currentRUC === '-') {
                                dispatch({
                                    type: 'UPDATE_MULTIPLE_TRANSACTION_FIELDS',
                                    payload: {
                                        companyID: newRUC,
                                        clientName: newClientName
                                    }
                                });
                                dispatch({ type: 'ADD_RECURRING_SERVICES', payload: newServices });
                            }
                            // Case 2: The RUC matches. Just add the services.
                            else if (currentRUC === newRUC) {
                                dispatch({ type: 'ADD_RECURRING_SERVICES', payload: newServices });
                            }
                            // Case 3: The RUC does not match. Show an error.
                            else {
                                alert(
                                    `Error: No puedes agregar servicios de un cliente diferente.\n\n` +
                                    `Cliente Actual: ${currentClientName} (RUC: ${currentRUC})\n` +
                                    `Nuevo Cliente: ${newClientName} (RUC: ${newRUC})\n\n` +
                                    `Todos los servicios deben pertenecer al mismo cliente.`
                                );
                            }
                        }}
                        onToggle={() => setIsRecurringCodeManagerOpen(false)}
                        onCodeRemove={(code) => {
                            dispatch({ type: 'REMOVE_RECURRING_SERVICE', payload: code });
                        }}
                    />
                )}
            </div>
        );
    };
    // --- END OF LOGIC CHANGE ---

    return (
        <>
            {/* (Banners, Overview, and KPIs remain the same) ... */}
            {!isFinanceView && !isPending && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-red-800">Transaction Status: {tx.ApprovalStatus}</p> <p className="text-sm text-red-700">Modification of key inputs is not allowed once a transaction has been reviewed.</p> </div> </div> )}
            {!isFinanceView && isPending && ( <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-yellow-800">Por favor revisar la data cargada de manera minuciosa</p> <p className="text-sm text-yellow-700">Asegúrate que toda la información sea correcta antes de confirmarla.</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'PENDING' && ( <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-6 flex items-start"> <CheckCircleIcon className="flex-shrink-0 mt-0.5 text-blue-800" /> <div className="ml-3"> <p className="font-semibold text-blue-800">Finance Edit Mode Active</p> <p className="text-sm text-blue-700">Puedes modificar los valores clave (Unidad, Plazo, MRC, NRC, Gigalan, Periodos) antes de aprobar/rechazar.</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'APPROVED' && ( <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-6 flex items-start"> <CheckCircleIcon className="flex-shrink-0 mt-0.5 text-green-800" /> <div className="ml-3"> <p className="font-semibold text-green-800">Plantilla Aprobada!</p> <p className="text-sm text-green-700">Esta plantilla ya fue aprobada. Felicidades</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'REJECTED' && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5 text-red-800" /> <div className="ml-3"> <p className="font-semibold text-red-800">Plantilla Rechazada!</p> <p className="text-sm text-red-700">No se logro aprobar. Comunicate con mesadeprecios@fiberlux.pe para indagar porque.</p> </div> </div> )}

            <TransactionOverviewInputs
                isFinanceView={isFinanceView}
            />

            <KpiMetricsGrid />

            <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Detalle de Servicios</h3>
                <div className="space-y-3">
                    <CostBreakdownRow
                        title="Servicios Recurrentes"
                        items={(currentRecurringServices || []).length}
                        total={null} 
                        isOpen={openSections['recurringCosts']}
                        onToggle={() => toggleSection('recurringCosts')}
                        customTotalsNode={<CustomRecurringServiceTotalsNode />}
                    >
                        <RecurringServicesTable
                            EmptyStateComponent={() => <RecurringServiceEmptyState onToggle={() => setIsRecurringCodeManagerOpen(true)} />}
                        />
                    </CostBreakdownRow>

                    <CostBreakdownRow
                        title="Inversión (Costos Fijos)"
                        items={(currentFixedCosts || []).length}
                        total={totalFixedCosts}
                        isOpen={openSections['fixedCosts']}
                        onToggle={() => toggleSection('fixedCosts')}
                        customTotalsNode={CustomFixedCostTotalsNode()}
                    >
                        <FixedCostsTable
                            EmptyStateComponent={() => <FixedCostEmptyState onToggle={() => setIsCodeManagerOpen(true)} />}
                        />
                    </CostBreakdownRow>
                    <CostBreakdownRow
                        title="Flujo"
                        items={timeline?.periods?.length || 0}
                        total={null}
                        isOpen={openSections['cashFlow']}
                        onToggle={() => toggleSection('cashFlow')}
                        customTotalsNode={
                            <div className="text-xs text-gray-500 text-right">
                                Valores por periodo
                            </div>
                        }
                    >
                        <CashFlowTimelineTable timeline={timeline} />
                    </CostBreakdownRow>
                </div>
            </div>
        </>
    );
}
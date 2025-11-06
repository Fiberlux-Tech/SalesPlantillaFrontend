// src/features/transactions/components/TransactionPreviewContent.tsx
import { useState, useMemo } from 'react';
import CostBreakdownRow from '@/components/shared/CostBreakdownRow';
import {
    WarningIcon,
    CheckCircleIcon,
} from '@/components/shared/Icons';
import FixedCostsTable from '@/components/shared/FixedCostsTable';
import RecurringServicesTable from '@/components/shared/RecurringServicesTable';
import CashFlowTimelineTable from '@/components/shared/CashFlowTimelineTable';
import { formatCurrency } from '@/lib/formatters';
import { FixedCostCodeManager, FixedCostEmptyState } from '@/components/shared/FixedCostCodeManager';
import { TransactionOverviewInputs } from './TransactionOverviewInputs';
import { KpiMetricsGrid } from './KpiMetricsGrid';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext';

type OpenSectionsState = Record<string, boolean>;

export function TransactionPreviewContent({ isFinanceView = false }: { isFinanceView?: boolean }) {

    // 1. Get new state and dispatch from context
    const {
        baseTransaction,
        draftState,
        dispatch,
        canEdit
    } = useTransactionPreview();

    // 2. De-structure the draftState
    const {
        liveKpis,
        currentFixedCosts,
        currentRecurringServices
    } = draftState;

    // 3. UI state is now LOCAL to this component
    const [isCodeManagerOpen, setIsCodeManagerOpen] = useState(false);
    const [openSections, setOpenSections] = useState<OpenSectionsState>({
        'cashFlow': false,
        'recurringCosts': false,
        'fixedCosts': false
    });

    // --- (This logic remains the same) ---
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
    // --- (End of unchanged logic) ---


    // 4. This sub-component is now simplified
    const CustomFixedCostTotalsNode = () => {
        const showCodeManagerUI = !isFinanceView || canEdit;

        if (!showCodeManagerUI) {
            // ... (this part is unchanged)
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

                {/* 5. Handlers are now simplified to use dispatch and local state */}
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

    return (
        <>
            {/* --- (All banners remain the same) --- */}
            {!isFinanceView && !isPending && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-red-800">Transaction Status: {tx.ApprovalStatus}</p> <p className="text-sm text-red-700">Modification of key inputs is not allowed once a transaction has been reviewed.</p> </div> </div> )}
            {!isFinanceView && isPending && ( <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-yellow-800">Por favor revisar la data cargada de manera minuciosa</p> <p className="text-sm text-yellow-700">Asegúrate que toda la información sea correcta antes de confirmarla.</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'PENDING' && ( <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-6 flex items-start"> <CheckCircleIcon className="flex-shrink-0 mt-0.5 text-blue-800" /> <div className="ml-3"> <p className="font-semibold text-blue-800">Finance Edit Mode Active</p> <p className="text-sm text-blue-700">Puedes modificar los valores clave (Unidad, Plazo, MRC, NRC, Gigalan, Periodos) antes de aprobar/rechazar.</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'APPROVED' && ( <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-6 flex items-start"> <CheckCircleIcon className="flex-shrink-0 mt-0.5 text-green-800" /> <div className="ml-3"> <p className="font-semibold text-green-800">Plantilla Aprobada!</p> <p className="text-sm text-green-700">Esta plantilla ya fue aprobada. Felicidades</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'REJECTED' && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5 text-red-800" /> <div className="ml-3"> <p className="font-semibold text-red-800">Plantilla Rechazada!</p> <p className="text-sm text-red-700">No se logro aprobar. Comunicate con mesadeprecios@fiberlux.pe para indagar porque.</p> </div> </div> )}

            {/* 6. These components now read from the new context internally */}
            <TransactionOverviewInputs
                isFinanceView={isFinanceView}
            />

            {/* 2. Key Performance Indicators (NEW POSITION) */}
            <KpiMetricsGrid />

            <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Detalle de Servicios</h3>
                <div className="space-y-3">
                    <CostBreakdownRow
                        title="Servicios Recurrentes"
                        items={(currentRecurringServices || []).length}
                        total={totalRecurringCosts}
                        isOpen={openSections['recurringCosts']}
                        onToggle={() => toggleSection('recurringCosts')}
                        customTotalsNode={ <div className="flex space-x-4"> <div> <p className="font-semibold text-green-600 text-right">{formatCurrency(totalRecurringIncome)}</p> <p className="text-xs text-gray-500 text-right">Ingreso</p> </div> <div> <p className="font-semibold text-red-600 text-right">{formatCurrency(totalRecurringCosts)}</p> <p className="text-xs text-gray-500 text-right">Egreso</p> </div> </div> }
                    >
                        <RecurringServicesTable />
                    </CostBreakdownRow>

                    <CostBreakdownRow
                        title="Inversión (Costos Fijos)"
                        items={(currentFixedCosts || []).length}
                        total={totalFixedCosts}
                        isOpen={openSections['fixedCosts']}
                        onToggle={() => toggleSection('fixedCosts')}
                        customTotalsNode={CustomFixedCostTotalsNode()}
                    >
                        {/* 7. Pass the local state setter to the empty state component */}
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
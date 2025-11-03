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
import type { 
    TransactionDetailResponse, 
    KpiCalculationResponse,
    FixedCost,
    RecurringService
} from '@/types'; 
import { FixedCostCodeManager, FixedCostEmptyState } from '@/components/shared/FixedCostCodeManager'; 

// --- NEW COMPONENT IMPORTS ---
import { TransactionOverviewInputs } from './TransactionOverviewInputs';
import { KpiMetricsGrid } from './KpiMetricsGrid';

type Currency = 'PEN' | 'USD';

// 3. Define state types (Local state is now small)
interface OpenSectionsState {
    [key: string]: boolean;
}

// 2. Define props interface (Simplified, removed editing-related state/handlers)
interface TransactionPreviewContentProps {
    data: TransactionDetailResponse['data'];
    isFinanceView?: boolean;
    gigalanInputs: Record<string, any> | null; 
    onGigalanInputChange: (key: string, value: any) => void;
    selectedUnidad: string;
    onUnidadChange: (value: string) => void;
    liveKpis: KpiCalculationResponse['data'] | null;
    fixedCostsData: FixedCost[] | null;
    onFixedCostChange: (index: number, field: keyof FixedCost, value: string | number | Currency) => void;
    recurringServicesData: RecurringService[] | null;
    onRecurringServiceChange: (index: number, field: keyof RecurringService, value: string | number | Currency) => void;
    isCodeManagerOpen: boolean;
    setIsCodeManagerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onFixedCostAdd: (newCosts: FixedCost[]) => void;
    onFixedCostRemove: (codeToRemove: string) => void;
}

export function TransactionPreviewContent({
    data,
    isFinanceView = false,
    gigalanInputs,
    onGigalanInputChange,
    selectedUnidad,
    onUnidadChange,
    liveKpis,
    fixedCostsData,
    onFixedCostChange,
    recurringServicesData,
    onRecurringServiceChange,
    isCodeManagerOpen, 
    setIsCodeManagerOpen, 
    onFixedCostAdd,
    onFixedCostRemove // Passed directly to FixedCostCodeManager
}: TransactionPreviewContentProps) {

    // --- STATE IS NOW SMALLER ---
    const [openSections, setOpenSections] = useState<OpenSectionsState>({
        'cashFlow': true
    });

    const tx = data.transactions;
    const isPending = tx.ApprovalStatus === 'PENDING';
    const canEdit = isPending;
    const kpiData = liveKpis || tx;
    const timeline = liveKpis?.timeline || data?.timeline;

    const toggleSection = (section: string) => {
        setOpenSections((prev: OpenSectionsState) => ({ ...prev, [section]: !prev[section] }));
    };
    
    const currentFixedCosts = fixedCostsData || data.fixed_costs;
    const currentRecurringServices = recurringServicesData || data.recurring_services; 
    
    const totalFixedCosts = useMemo(() => (currentFixedCosts || []).reduce((acc, item) => acc + (item.total || 0), 0), [currentFixedCosts]);
    const totalRecurringCosts = useMemo(() => (currentRecurringServices || []).reduce((acc, item) => acc + (item.egreso || 0), 0), [currentRecurringServices]); 
    const totalRecurringIncome = useMemo(() => (currentRecurringServices || []).reduce((acc, item) => acc + (item.ingreso || 0), 0), [currentRecurringServices]);

    const loadedFixedCostCodes = useMemo(() => {
        return (currentFixedCosts || [])
            .map(c => c.ticket) 
            .filter((code, index, self) => code && self.indexOf(code) === index);
    }, [currentFixedCosts]);

    // **Custom Totals Node (Implements "Cargar" button layout fix)**
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
                {/* Total Text */}
                <div className="text-right"> 
                    <p className="font-semibold text-red-600">{formatCurrency(totalFixedCosts)}</p> 
                    <p className="text-xs text-gray-500">Total</p> 
                </div>
                
                {/* Cargar Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsCodeManagerOpen(prev => !prev); }}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Cargar
                </button>
                
                {/* Manager Pop-up */}
                {isCodeManagerOpen && (
                    <FixedCostCodeManager 
                        loadedCodes={loadedFixedCostCodes} 
                        onFixedCostAdd={onFixedCostAdd} 
                        onToggle={() => setIsCodeManagerOpen(false)} 
                        onCodeRemove={onFixedCostRemove} // Passed removal handler
                    />
                )}
            </div>
        );
    };


    return (
        <>
            {/* --- Transaction Status Banners (Unchanged) --- */}
            {!isFinanceView && !isPending && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-red-800">Transaction Status: {tx.ApprovalStatus}</p> <p className="text-sm text-red-700">Modification of key inputs is not allowed once a transaction has been reviewed.</p> </div> </div> )}
            {!isFinanceView && isPending && ( <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-yellow-800">Por favor revisar la data cargada de manera minuciosa</p> <p className="text-sm text-yellow-700">Asegúrate que toda la información sea correcta antes de confirmarla.</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'PENDING' && ( <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-6 flex items-start"> <CheckCircleIcon className="flex-shrink-0 mt-0.5 text-blue-800" /> <div className="ml-3"> <p className="font-semibold text-blue-800">Finance Edit Mode Active</p> <p className="text-sm text-blue-700">Puedes modificar los valores clave (Unidad, Plazo, MRC, NRC, Gigalan, Periodos) antes de aprobar/rechazar.</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'APPROVED' && ( <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-6 flex items-start"> <CheckCircleIcon className="flex-shrink-0 mt-0.5 text-green-800" /> <div className="ml-3"> <p className="font-semibold text-green-800">Plantilla Aprobada!</p> <p className="text-sm text-green-700">Esta plantilla ya fue aprobada. Felicidades</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'REJECTED' && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5 text-red-800" /> <div className="ml-3"> <p className="font-semibold text-red-800">Plantilla Rechazada!</p> <p className="text-sm text-red-700">No se logro aprobar. Comunicate con mesadeprecios@fiberlux.pe para indagar porque.</p> </div> </div> )}


            {/* --- 1. REPLACED: Transaction Overview Inputs --- */}
            <TransactionOverviewInputs
                tx={tx}
                kpiData={kpiData}
                isFinanceView={isFinanceView}
                canEdit={canEdit}
                gigalanInputs={gigalanInputs}
                selectedUnidad={selectedUnidad}
                onGigalanInputChange={onGigalanInputChange}
                onUnidadChange={onUnidadChange}
            />

            {/* --- Detalle de Servicios Section --- */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Detalle de Servicios</h3>
                <div className="space-y-3">
                    {/* Recurring Services Row (Unchanged) */}
                    <CostBreakdownRow 
                        title="Servicios Recurrentes" 
                        items={(currentRecurringServices || []).length} 
                        total={totalRecurringCosts} 
                        isOpen={openSections['recurringCosts']} 
                        onToggle={() => toggleSection('recurringCosts')} 
                        customTotalsNode={ <div className="flex space-x-4"> <div> <p className="font-semibold text-green-600 text-right">{formatCurrency(totalRecurringIncome)}</p> <p className="text-xs text-gray-500 text-right">Ingreso</p> </div> <div> <p className="font-semibold text-red-600 text-right">{formatCurrency(totalRecurringCosts)}</p> <p className="text-xs text-gray-500 text-right">Egreso</p> </div> </div> } 
                    > 
                        <RecurringServicesTable 
                            data={currentRecurringServices} 
                            canEdit={canEdit}
                            onServiceChange={onRecurringServiceChange} 
                        /> 
                    </CostBreakdownRow>
                        
                    {/* Fixed Costs Row (Unchanged) */}
                    <CostBreakdownRow 
                        title="Inversión (Costos Fijos)" 
                        items={(currentFixedCosts || []).length} 
                        total={totalFixedCosts} 
                        isOpen={openSections['fixedCosts']} 
                        onToggle={() => toggleSection('fixedCosts')} 
                        customTotalsNode={CustomFixedCostTotalsNode()} 
                    > 
                        <FixedCostsTable 
                            data={currentFixedCosts} 
                            canEdit={canEdit} 
                            onCostChange={onFixedCostChange} 
                            EmptyStateComponent={() => <FixedCostEmptyState onToggle={() => setIsCodeManagerOpen(true)} />}
                        /> 
                    </CostBreakdownRow>

                    {/* Cash Flow Row (Unchanged) */}
                    {timeline && (
                        <CostBreakdownRow
                            title="Flujo"
                            items={timeline.periods?.length || 0}
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
                    )}
                </div>
            </div>

            {/* --- 2. REPLACED: Key Performance Indicators Section --- */}
            <KpiMetricsGrid 
                tx={tx}
                kpiData={kpiData}
                canEdit={canEdit}
                onGigalanInputChange={onGigalanInputChange}
            />
        </>
    );
}
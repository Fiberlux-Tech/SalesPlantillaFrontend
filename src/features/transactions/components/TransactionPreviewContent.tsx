// src/features/transactions/components/TransactionPreviewContent.tsx
import React, { useState, useEffect } from 'react';
import KpiCard from '@/components/shared/KpiCard';
import StatusBadge from '@/components/shared/StatusBadge';
import CostBreakdownRow from '@/components/shared/CostBreakdownRow';
import {
    WarningIcon,
    CheckCircleIcon,
    EditPencilIcon,
    EditCheckIcon,
    EditXIcon
} from '@/components/shared/Icons';
import FixedCostsTable from '@/components/shared/FixedCostsTable';
import RecurringServicesTable from '@/components/shared/RecurringServicesTable';
import CashFlowTimelineTable from '@/components/shared/CashFlowTimelineTable';
import { EditableKpiCard } from '@/components/shared/EditableKpiCard';
import { GigaLanCommissionInputs } from '@/features/sales/components/GigaLanCommissionInputs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UNIDADES_NEGOCIO, REGIONS, SALE_TYPES } from '@/lib/constants';
import type { 
    TransactionDetailResponse, 
    KpiCalculationResponse,
    FixedCost,
    RecurringService
} from '@/types'; // 1. Import all necessary types

// 2. Define props interface
interface TransactionPreviewContentProps {
    data: TransactionDetailResponse['data'];
    isFinanceView?: boolean;
    gigalanInputs: Record<string, any> | null; // Flexible for gigalan/override fields
    onGigalanInputChange: (key: string, value: any) => void;
    selectedUnidad: string;
    onUnidadChange: (value: string) => void;
    liveKpis: KpiCalculationResponse['data'] | null;
    fixedCostsData: FixedCost[] | null;
    onFixedCostChange: (index: number, field: keyof FixedCost, value: any) => void;
    recurringServicesData: RecurringService[] | null;
    onRecurringServiceChange: (index: number, field: keyof RecurringService, value: any) => void;
}

// 3. Define state types
interface OpenSectionsState {
    [key: string]: boolean;
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
    onRecurringServiceChange
}: TransactionPreviewContentProps) {

    // 4. Type internal state
    const [openSections, setOpenSections] = useState<OpenSectionsState>({
        'cashFlow': true
    });
    const [isEditingPlazo, setIsEditingPlazo] = useState<boolean>(false);
    const [editedPlazo, setEditedPlazo] = useState<string | number | null>(null);
    const [isEditingUnidad, setIsEditingUnidad] = useState<boolean>(false);
    const [editedUnidad, setEditedUnidad] = useState<string | null>(null);
    const [isEditingRegion, setIsEditingRegion] = useState<boolean>(false);
    const [editedRegion, setEditedRegion] = useState<string | null>(null);
    const [isEditingSaleType, setIsEditingSaleType] = useState<boolean>(false);
    const [editedSaleType, setEditedSaleType] = useState<string | null>(null);

    // ... (useEffect remains the same, it's already robust)
    useEffect(() => {
        if (!data || !data.transactions) return;

        const tx = data.transactions;
        const kpiData = liveKpis || tx;

        const currentPlazo = kpiData.plazoContrato ?? tx.plazoContrato ?? '';
        if (!isEditingPlazo || editedPlazo === null) {
            setEditedPlazo(currentPlazo);
        }
        
        const currentUnidad = isFinanceView ? (gigalanInputs?.unidadNegocio ?? tx.unidadNegocio) : selectedUnidad;
        if (!isEditingUnidad || editedUnidad === null) {
            setEditedUnidad(currentUnidad || '');
        }
        
        const currentRegion = isFinanceView ? (gigalanInputs?.gigalan_region ?? tx.gigalan_region) : gigalanInputs?.gigalan_region;
        if (!isEditingRegion || editedRegion === null) {
            setEditedRegion(currentRegion || '');
        }
        
        const currentSaleType = isFinanceView ? (gigalanInputs?.gigalan_sale_type ?? tx.gigalan_sale_type) : gigalanInputs?.gigalan_sale_type;
        if (!isEditingSaleType || editedSaleType === null) {
            setEditedSaleType(currentSaleType || '');
        }
    }, [data, liveKpis, selectedUnidad, gigalanInputs, isEditingPlazo, isEditingUnidad, isEditingRegion, isEditingSaleType, isFinanceView, editedPlazo, editedUnidad, editedRegion, editedSaleType]);


    const tx = data.transactions;
    
    const formatCurrency = (value: string | number | null | undefined): string => {
        const numValue = parseFloat(value as string);
        if (typeof numValue !== 'number' || isNaN(numValue) || numValue === 0) return '-';
        return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const isPending = tx.ApprovalStatus === 'PENDING';
    const canEdit = isPending;
    const kpiData = liveKpis || tx;
    const timeline = liveKpis?.timeline || data?.timeline;

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // 5. Type event handlers
    const handleEditPlazoSubmit = () => {
        const newPlazo = parseInt(editedPlazo as string, 10);
        if (!isNaN(newPlazo) && newPlazo > 0 && Number.isInteger(newPlazo)) {
            onGigalanInputChange('plazoContrato', newPlazo);
            setIsEditingPlazo(false);
        } else {
            alert("Please enter a valid whole number greater than 0 for Plazo Contrato.");
        }
    };
    const handleCancelEditPlazo = () => {
        setEditedPlazo(kpiData.plazoContrato ?? tx.plazoContrato ?? '');
        setIsEditingPlazo(false);
    };
    // ... (other handlers: handleEditUnidadSubmit, handleCancelEditUnidad, etc.) ...
    // (Handler logic remains the same)
    const handleEditUnidadSubmit = () => {
        if (!editedUnidad || !UNIDADES_NEGOCIO.includes(editedUnidad)) {
             alert("Selección obligatoria: Por favor, selecciona una Unidad de Negocio válida.");
             return;
        }
        onUnidadChange(editedUnidad); 
        setIsEditingUnidad(false);
    };
    const handleCancelEditUnidad = () => {
        const currentUnidad = isFinanceView ? (gigalanInputs?.unidadNegocio ?? tx.unidadNegocio) : selectedUnidad;
        setEditedUnidad(currentUnidad || '');
        setIsEditingUnidad(false);
    };
    const handleEditRegionSubmit = () => {
        if (!editedRegion || !REGIONS.includes(editedRegion)) {
            alert("Selección obligatoria: Por favor, selecciona una Región válida.");
            return;
        }
        onGigalanInputChange('gigalan_region', editedRegion);
        setIsEditingRegion(false);
    };
    const handleCancelEditRegion = () => {
        const currentRegion = isFinanceView ? (gigalanInputs?.gigalan_region ?? tx.gigalan_region) : gigalanInputs?.gigalan_region;
        setEditedRegion(currentRegion || '');
        setIsEditingRegion(false);
    };
    const handleEditSaleTypeSubmit = () => {
         // Check 1: Handle null/empty string.
         if (!editedSaleType) {
            alert("Selección obligatoria: Por favor, selecciona un Tipo de Venta válido.");
            return;
        }
        
        // FIX: Cast the argument to the required narrow union type for the includes method.
        // This resolves the error on the 'editedSaleType' variable.
        const saleType = editedSaleType as ('NUEVO' | 'EXISTENTE');

        if (!SALE_TYPES.includes(saleType)) {
            alert("Selección obligatoria: Por favor, selecciona un Tipo de Venta válido.");
            return;
        }
        
        // Now that validation is complete, pass the strictly typed variable.
        onGigalanInputChange('gigalan_sale_type', saleType);
        setIsEditingSaleType(false);
    };
    const handleCancelEditSaleType = () => {
        const currentSaleType = isFinanceView ? (gigalanInputs?.gigalan_sale_type ?? tx.gigalan_sale_type) : gigalanInputs?.gigalan_sale_type;
        setEditedSaleType(currentSaleType || '');
        setIsEditingSaleType(false);
    };
    
    
    const confirmedUnidad = isFinanceView ? (gigalanInputs?.unidadNegocio ?? tx.unidadNegocio) : selectedUnidad;
    const confirmedRegion = isFinanceView ? (gigalanInputs?.gigalan_region ?? tx.gigalan_region) : gigalanInputs?.gigalan_region;
    const confirmedSaleType = isFinanceView ? (gigalanInputs?.gigalan_sale_type ?? tx.gigalan_sale_type) : gigalanInputs?.gigalan_sale_type;

    const baseOverviewData = [
        { label: 'Transaction ID', value: tx.transactionID || '-' },
        { label: 'Nombre Cliente', value: tx.clientName },
        { label: 'RUC/DNI', value: tx.companyID },
        { label: 'Order ID', value: tx.orderID },
        { label: 'Tipo de Cambio', value: tx.tipoCambio },
        { label: 'Status', value: <StatusBadge status={tx.ApprovalStatus} /> },
    ];
    
    const currentFixedCosts = fixedCostsData || data.fixed_costs;
    const currentRecurringServices = recurringServicesData || data.recurring_services; 
    
    const totalFixedCosts = (currentFixedCosts || []).reduce((acc, item) => acc + (item.total || 0), 0);
    const totalRecurringCosts = (currentRecurringServices || []).reduce((acc, item) => acc + (item.egreso || 0), 0); 
    const totalRecurringIncome = (currentRecurringServices || []).reduce((acc, item) => acc + (item.ingreso || 0), 0);

    return (
        <>
            {/* ... (All JSX logic for banners remains the same) ... */}
            {!isFinanceView && !isPending && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-red-800">Transaction Status: {tx.ApprovalStatus}</p> <p className="text-sm text-red-700">Modification of key inputs is not allowed once a transaction has been reviewed.</p> </div> </div> )}
            {!isFinanceView && isPending && ( <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-yellow-800">Por favor revisar la data cargada de manera minuciosa</p> <p className="text-sm text-yellow-700">Asegúrate que toda la información sea correcta antes de confirmarla.</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'PENDING' && ( <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-6 flex items-start"> <CheckCircleIcon className="flex-shrink-0 mt-0.5 text-blue-800" /> <div className="ml-3"> <p className="font-semibold text-blue-800">Finance Edit Mode Active</p> <p className="text-sm text-blue-700">Puedes modificar los valores clave (Unidad, Plazo, MRC, NRC, Gigalan, Periodos) antes de aprobar/rechazar.</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'APPROVED' && ( <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-6 flex items-start"> <CheckCircleIcon className="flex-shrink-0 mt-0.5 text-green-800" /> <div className="ml-3"> <p className="font-semibold text-green-800">Plantilla Aprobada!</p> <p className="text-sm text-green-700">Esta plantilla ya fue aprobada. Felicidades</p> </div> </div> )}
            {isFinanceView && tx.ApprovalStatus === 'REJECTED' && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5 text-red-800" /> <div className="ml-3"> <p className="font-semibold text-red-800">Plantilla Rechazada!</p> <p className="text-sm text-red-700">No se logro aprobar. Comunicate con mesadeprecios@fiberlux.pe para indagar porque.</p> </div> </div> )}


            {/* Transaction Overview Section */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Transaction Overview</h3>
                <div className="bg-gray-100 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 items-start">
                    {/* --- EDITABLE UNIDAD DE NEGOCIO --- */}
                    <div className="min-h-[60px]">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unidad de Negocio</p>
                        {canEdit ? (
                            isEditingUnidad ? ( 
                                <div className="flex items-center space-x-2">
                                    <div className="flex-grow max-w-[200px]"><Select value={editedUnidad || ''} onValueChange={setEditedUnidad}><SelectTrigger className="text-sm h-9 bg-white"><SelectValue placeholder="Selecciona..." /></SelectTrigger><SelectContent>{UNIDADES_NEGOCIO.map(unidad => (<SelectItem key={unidad} value={unidad}>{unidad}</SelectItem>))}</SelectContent></Select></div>
                                    <button onClick={handleEditUnidadSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                    <button onClick={handleCancelEditUnidad} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                </div>
                            ) : ( 
                                <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => { setIsEditingUnidad(true); }}>
                                    <p className={`font-semibold ${confirmedUnidad ? 'text-gray-900' : 'text-red-600'}`}> {confirmedUnidad || "Selecciona obligatorio"} </p>
                                    <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                </div>
                            )
                        ) : ( 
                            <p className="font-semibold text-gray-900">{tx.unidadNegocio || '-'}</p>
                        )}
                    </div>
                    {/* --- END EDITABLE UNIDAD DE NEGOCIO --- */}

                    {baseOverviewData.map(item => (
                        <div key={item.label} className="min-h-[60px]">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                            <div className="font-semibold text-gray-900">{item.value}</div>
                        </div>
                    ))}

                    {/* --- EDITABLE PLAZO DE CONTRATO --- */}
                    <div className="min-h-[60px]">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plazo de Contrato</p>
                        {canEdit ? (
                            isEditingPlazo ? ( 
                                <div className="flex items-center space-x-2">
                                    <Input type="number" value={editedPlazo || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedPlazo(e.target.value)} className="h-9 w-24 text-sm p-2 border-input ring-ring focus-visible:ring-1 bg-white" min="1" step="1"/>
                                    <button onClick={handleEditPlazoSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                    <button onClick={handleCancelEditPlazo} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                </div>
                            ) : ( 
                                <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => { setIsEditingPlazo(true); }}>
                                    <p className="font-semibold text-gray-900">{kpiData.plazoContrato ?? tx.plazoContrato ?? '-'} meses</p>
                                    <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                </div>
                            )
                        ) : ( 
                            <p className="font-semibold text-gray-900">{kpiData.plazoContrato ?? tx.plazoContrato ?? '-'} meses</p>
                        )}
                    </div>
                    {/* --- END EDITABLE PLAZO DE CONTRATO --- */}

                    {/* --- GIGALAN FIELDS --- */}
                    {confirmedUnidad === 'GIGALAN' && (
                        <>
                            {/* --- EDITABLE REGION --- */}
                            <div className="min-h-[60px]">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Región</p>
                                {canEdit ? (
                                    isEditingRegion ? ( 
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-grow max-w-[200px]"><Select value={editedRegion || ''} onValueChange={setEditedRegion}><SelectTrigger className="text-sm h-9 bg-white"><SelectValue placeholder="Selecciona..." /></SelectTrigger><SelectContent>{REGIONS.map(region => (<SelectItem key={region} value={region}>{region}</SelectItem>))}</SelectContent></Select></div>
                                            <button onClick={handleEditRegionSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                            <button onClick={handleCancelEditRegion} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                        </div>
                                    ) : ( 
                                        <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => { setIsEditingRegion(true); }}>
                                            <p className={`font-semibold ${confirmedRegion ? 'text-gray-900' : 'text-red-600'}`}> {confirmedRegion || "Selecciona obligatorio"} </p>
                                            <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                        </div>
                                    )
                                ) : ( 
                                    <p className="font-semibold text-gray-900">{confirmedRegion || '-'}</p>
                                )}
                            </div>
                            {/* --- END EDITABLE REGION --- */}

                            {/* --- EDITABLE TYPE OF SALE --- */}
                            <div className="min-h-[60px]">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tipo de Venta</p>
                                {canEdit ? (
                                    isEditingSaleType ? ( 
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-grow max-w-[200px]"><Select value={editedSaleType || ''} onValueChange={setEditedSaleType}><SelectTrigger className="text-sm h-9 bg-white"><SelectValue placeholder="Selecciona..." /></SelectTrigger><SelectContent>{SALE_TYPES.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select></div>
                                            <button onClick={handleEditSaleTypeSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                            <button onClick={handleCancelEditSaleType} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                        </div>
                                    ) : ( 
                                        <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => { setIsEditingSaleType(true); }}>
                                            <p className={`font-semibold ${confirmedSaleType ? 'text-gray-900' : 'text-red-600'}`}> {confirmedSaleType || "Selecciona obligatorio"} </p>
                                            <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                        </div>
                                    )
                                ) : ( 
                                    <p className="font-semibold text-gray-900">{confirmedSaleType || '-'}</p>
                                )}
                            </div>
                            {/* --- END EDITABLE TYPE OF SALE --- */}

                            {/* --- GigaLan PREVIOUS MONTHLY CHARGE Input --- */}
                            {canEdit && confirmedSaleType === 'EXISTENTE' && (
                                <div className="min-h-[60px]">
                                    <GigaLanCommissionInputs
                                        inputs={{ ...gigalanInputs, gigalan_sale_type: confirmedSaleType }}
                                        onInputChange={onGigalanInputChange}
                                    />
                                </div>
                            )}
                            
                            {!canEdit && tx.gigalan_sale_type === 'EXISTENTE' && (
                                <div className="min-h-[60px]">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">MRC Previo</p>
                                    <p className="font-semibold text-gray-900">{tx.gigalan_old_mrc ? formatCurrency(tx.gigalan_old_mrc) : '-'}</p>
                                </div>
                            )}
                        </>
                    )}
                    {/* --- END GIGALAN FIELDS --- */}
                </div>
            </div>

            {/* --- Detalle de Servicios Section --- */}
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
                    <RecurringServicesTable 
                        data={currentRecurringServices} 
                        canEdit={canEdit}
                        onServiceChange={onRecurringServiceChange} 
                    /> 
                </CostBreakdownRow>
                    
                <CostBreakdownRow 
                    title="Inversión (Costos Fijos)" 
                    items={(currentFixedCosts || []).length} 
                    total={totalFixedCosts} 
                    isOpen={openSections['fixedCosts']} 
                    onToggle={() => toggleSection('fixedCosts')} 
                    customTotalsNode={ <div> <p className="font-semibold text-red-600 text-right">{formatCurrency(totalFixedCosts)}</p> <p className="text-xs text-gray-500 text-right">Total</p> </div> } 
                > 
                    <FixedCostsTable 
                        data={currentFixedCosts} 
                        canEdit={canEdit} 
                        onCostChange={onFixedCostChange} 
                    /> 
                </CostBreakdownRow>

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

            {/* Key Performance Indicators Section */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Key Performance Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EditableKpiCard
                        title="MRC (Recurrente Mensual)"
                        kpiKey="MRC"
                        currencyKey="mrc_currency"
                        currentValue={kpiData.MRC ?? tx.MRC}
                        currentCurrency={kpiData.mrc_currency ?? tx.mrc_currency ?? 'PEN'}
                        subtext="Métrica Clave"
                        canEdit={canEdit} 
                        onValueChange={onGigalanInputChange}
                    />
                    
                    <EditableKpiCard
                        title="NRC (Pago Único)"
                        kpiKey="NRC"
                        currencyKey="nrc_currency"
                        currentValue={kpiData.NRC ?? tx.NRC}
                        currentCurrency={kpiData.nrc_currency ?? tx.nrc_currency ?? 'PEN'}
                        canEdit={canEdit} 
                        onValueChange={onGigalanInputChange}
                    />

                    <KpiCard title="VAN" value={formatCurrency(kpiData.VAN)} currency="PEN" />
                    <KpiCard title="TIR" value={`${(kpiData.TIR * 100)?.toFixed(2)}%`} />
                    <KpiCard title="Periodo de Payback" value={`${kpiData.payback} meses`} />
                    <KpiCard title="Ingresos Totales" value={formatCurrency(kpiData.totalRevenue)} currency="PEN" />
                    <KpiCard title="Gastos Totales" value={formatCurrency(kpiData.totalExpense)} currency="PEN" isNegative={true} />
                    <KpiCard title="Utilidad Bruta" value={formatCurrency(kpiData.grossMargin)} currency="PEN" />
                    <KpiCard title="Margen Bruto (%)" value={`${(kpiData.grossMarginRatio * 100)?.toFixed(2)}%`} />
                    <KpiCard title="Comisión de Ventas" value={formatCurrency(kpiData.comisiones)} currency="PEN" />
                    <KpiCard title="Costo Instalación" value={formatCurrency(tx.costoInstalacion)} currency="PEN" />
                    <KpiCard title="Costo Instalación (%)" value={`${(kpiData.costoInstalacionRatio * 100)?.toFixed(2)}%`} />
                </div>
            </div>
        </>
    );
}
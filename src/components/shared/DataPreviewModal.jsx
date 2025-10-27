// src/components/shared/DataPreviewModal.jsx

import React, { useState, useEffect } from 'react';
import KpiCard from '@/components/shared/KpiCard';
import StatusBadge from '@/components/shared/StatusBadge';
import CostBreakdownRow from '@/components/shared/CostBreakdownRow';
import {
    CloseIcon,
    WarningIcon,
    CheckCircleIcon,
    EditPencilIcon,
    EditCheckIcon,
    EditXIcon
} from '@/components/shared/Icons';
import FixedCostsTable from '@/components/shared/FixedCostsTable';
import RecurringServicesTable from '@/components/shared/RecurringServicesTable';
// 👈 CLEANUP: Use @/ for feature-specific components
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

// 👈 CLEANUP: Use @/ for feature-specific components
import { SalesPreviewFooter } from '@/features/sales/components/SalesPreviewFooter';
import { FinancePreviewFooter } from '@/features/finance/components/FinancePreviewFooter';

import { EditableKpiCard } from '@/components/shared/EditableKpiCard'; // This local import is correct

function DataPreviewModal({ isOpen, onClose, onConfirm, data, isFinanceView = false, onApprove, onReject, onCalculateCommission, gigalanInputs, onGigalanInputChange, selectedUnidad, onUnidadChange, liveKpis }) {
    
    // --- 1. SAFE STATE INITIALIZATION (UNCONDITIONAL HOOKS) ---
    const [openSections, setOpenSections] = useState({});

    const [isEditingPlazo, setIsEditingPlazo] = useState(false);
    const [editedPlazo, setEditedPlazo] = useState(null); 

    const [isEditingUnidad, setIsEditingUnidad] = useState(false);
    const [editedUnidad, setEditedUnidad] = useState(null); 

    const [isEditingRegion, setIsEditingRegion] = useState(false);
    const [editedRegion, setEditedRegion] = useState(null); 

    const [isEditingSaleType, setIsEditingSaleType] = useState(false);
    const [editedSaleType, setEditedSaleType] = useState(null); 

    
    // 💥 CRITICAL FIX: HOIST useEffect ABOVE THE CONDITIONAL RETURN
    // The call to useEffect is UNCONDITIONAL, even if it returns early.
    useEffect(() => {
        if (!data || !data.transactions) return; // Logic inside the hook remains conditional

        const tx = data.transactions;
        const kpiData = liveKpis || tx;

        // Sync Plazo de Contrato
        const currentPlazo = kpiData.plazoContrato ?? tx.plazoContrato ?? '';
        if (!isEditingPlazo || editedPlazo === null) { 
            setEditedPlazo(currentPlazo);
        }
        
        // Sync Unidad de Negocio
        const currentUnidad = isFinanceView ? (gigalanInputs?.unidadNegocio ?? tx.unidadNegocio) : selectedUnidad;
        if (!isEditingUnidad || editedUnidad === null) {
            setEditedUnidad(currentUnidad || '');
        }
        
        // Sync Region
        const currentRegion = isFinanceView ? (gigalanInputs?.gigalan_region ?? tx.gigalan_region) : gigalanInputs?.gigalan_region;
        if (!isEditingRegion || editedRegion === null) {
            setEditedRegion(currentRegion || '');
        }
        
        // Sync Sale Type
        const currentSaleType = isFinanceView ? (gigalanInputs?.gigalan_sale_type ?? tx.gigalan_sale_type) : gigalanInputs?.gigalan_sale_type;
        if (!isEditingSaleType || editedSaleType === null) {
            setEditedSaleType(currentSaleType || '');
        }
    // Updated dependencies to ensure proper re-sync
    }, [data, liveKpis, selectedUnidad, gigalanInputs, isEditingPlazo, isEditingUnidad, isEditingRegion, isEditingSaleType, isFinanceView, editedPlazo, editedUnidad, editedRegion, editedSaleType]);
    // --- END HOISTED useEffect ---

    
    // 3. CRITICAL GUARD CHECK (Conditional Return is safe now)
    if (!isOpen || !data || !data.transactions) return null; 


    // --- 4. DEFINITIONS (Safe after Guard) ---
    const formatCurrency = (value) => {
        const numValue = parseFloat(value);
        if (typeof numValue !== 'number' || isNaN(numValue) || numValue === 0) return '-';
        return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const tx = data.transactions;
    const isPending = tx.ApprovalStatus === 'PENDING';
    const canEdit = isPending; 
    const kpiData = liveKpis || tx;
    
    // ... (All other functions, handlers, calculations, and return JSX remain the same) ...

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };
    const handleEditPlazoSubmit = () => {
        const newPlazo = parseInt(editedPlazo, 10);
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
         if (!editedSaleType || !SALE_TYPES.includes(editedSaleType)) {
            alert("Selección obligatoria: Por favor, selecciona un Tipo de Venta válido.");
            return;
        }
        onGigalanInputChange('gigalan_sale_type', editedSaleType);
        setIsEditingSaleType(false);
    };
    const handleCancelEditSaleType = () => {
        const currentSaleType = isFinanceView ? (gigalanInputs?.gigalan_sale_type ?? tx.gigalan_sale_type) : gigalanInputs?.gigalan_sale_type;
        setEditedSaleType(currentSaleType || '');
        setIsEditingSaleType(false);
    };
    
    // --- CONFIRMED VALUES ---
    const confirmedUnidad = isFinanceView ? (gigalanInputs?.unidadNegocio ?? tx.unidadNegocio) : selectedUnidad;
    const confirmedRegion = isFinanceView ? (gigalanInputs?.gigalan_region ?? tx.gigalan_region) : gigalanInputs?.gigalan_region;
    const confirmedSaleType = isFinanceView ? (gigalanInputs?.gigalan_sale_type ?? tx.gigalan_sale_type) : gigalanInputs?.gigalan_sale_type;

    // Base overview data depends on tx, safe after guard
    const baseOverviewData = [
        { label: 'Transaction ID', value: tx.transactionID || '-' },
        { label: 'Nombre Cliente', value: tx.clientName },
        { label: 'RUC/DNI', value: tx.companyID },
        { label: 'Order ID', value: tx.orderID },
        { label: 'Tipo de Cambio', value: tx.tipoCambio },
        { label: 'Status', value: <StatusBadge status={tx.ApprovalStatus} /> },
    ];
    
    // Calculations rely on data, safe after guard
    const totalFixedCosts = data.fixed_costs.reduce((acc, item) => acc + (item.total || 0), 0);
    const totalRecurringCosts = data.recurring_services.reduce((acc, item) => acc + (item.egreso || 0), 0);
    const totalRecurringIncome = data.recurring_services.reduce((acc, item) => acc + (item.ingreso || 0), 0);


    // --- JSX RETURN ---
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full">
                {/* Modal Header (Unchanged) */}
                <div className="flex justify-between items-center p-5 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Preview of Transaction Data</h2>
                        <p className="text-sm text-gray-500">File: {data.fileName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                </div>

                {/* Modal Body */}
                <div className="p-6 bg-gray-50 max-h-[75vh] overflow-y-auto">

                    {/* Warning Banners (Updated for Finance Edit Mode) */}
                    {!isFinanceView && !isPending && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-red-800">Transaction Status: {tx.ApprovalStatus}</p> <p className="text-sm text-red-700">Modification of key inputs is not allowed once a transaction has been reviewed.</p> </div> </div> )}
                    {!isFinanceView && isPending && ( <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-yellow-800">Por favor revisar la data cargada de manera minuciosa</p> <p className="text-sm text-yellow-700">Asegúrate que toda la información sea correcta antes de confirmarla.</p> </div> </div> )}
                    
                    {/* NEW: Banner for Finance when editing is ENABLED */}
                    {isFinanceView && canEdit && ( <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-6 flex items-start"> <CheckCircleIcon className="flex-shrink-0 mt-0.5 text-blue-800" /> <div className="ml-3"> <p className="font-semibold text-blue-800">Finance Edit Mode Active</p> <p className="text-sm text-blue-700">Puedes modificar los valores clave (Unidad, Plazo, MRC, NRC, Gigalan) antes de aprobar/rechazar.</p> </div> </div> )}

                    {/* Transaction Overview Section */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Transaction Overview</h3>
                        <div className="bg-gray-100 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 items-start">

                            {/* --- EDITABLE UNIDAD DE NEGOCIO --- */}
                            <div className="min-h-[60px]">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unidad de Negocio</p>
                                {canEdit ? (
                                    isEditingUnidad ? ( /* Editing View */
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-grow max-w-[200px]"><Select value={editedUnidad} onValueChange={setEditedUnidad}><SelectTrigger className="text-sm h-9 bg-white"><SelectValue placeholder="Selecciona..." /></SelectTrigger><SelectContent>{UNIDADES_NEGOCIO.map(unidad => (<SelectItem key={unidad} value={unidad}>{unidad}</SelectItem>))}</SelectContent></Select></div>
                                            <button onClick={handleEditUnidadSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                            <button onClick={handleCancelEditUnidad} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                        </div>
                                    ) : ( /* Hover View */
                                        <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => { setIsEditingUnidad(true); }}>
                                            <p className={`font-semibold ${confirmedUnidad ? 'text-gray-900' : 'text-red-600'}`}> {confirmedUnidad || "Selecciona obligatorio"} </p>
                                            <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                        </div>
                                    )
                                ) : ( /* Locked View (when not PENDING) */
                                    <p className="font-semibold text-gray-900">{tx.unidadNegocio || '-'}</p>
                                )}
                            </div>
                            {/* --- END EDITABLE UNIDAD DE NEGOCIO --- */}

                            {/* Render Base Data (Unchanged) */}
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
                                    isEditingPlazo ? ( /* Editing View */
                                        <div className="flex items-center space-x-2">
                                            <Input type="number" value={editedPlazo} onChange={(e) => setEditedPlazo(e.target.value)} className="h-9 w-24 text-sm p-2 border-input ring-ring focus-visible:ring-1 bg-white" min="1" step="1"/>
                                            <button onClick={handleEditPlazoSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                            <button onClick={handleCancelEditPlazo} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                        </div>
                                    ) : ( /* Hover View */
                                        <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => { setIsEditingPlazo(true); }}>
                                            <p className="font-semibold text-gray-900">{kpiData.plazoContrato ?? tx.plazoContrato ?? '-'} meses</p>
                                            <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                        </div>
                                    )
                                ) : ( /* Locked View */
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
                                            isEditingRegion ? ( /* Editing View */
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex-grow max-w-[200px]"><Select value={editedRegion} onValueChange={setEditedRegion}><SelectTrigger className="text-sm h-9 bg-white"><SelectValue placeholder="Selecciona..." /></SelectTrigger><SelectContent>{REGIONS.map(region => (<SelectItem key={region} value={region}>{region}</SelectItem>))}</SelectContent></Select></div>
                                                    <button onClick={handleEditRegionSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                                    <button onClick={handleCancelEditRegion} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                                </div>
                                            ) : ( /* Hover View */
                                                <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => { setIsEditingRegion(true); }}>
                                                    <p className={`font-semibold ${confirmedRegion ? 'text-gray-900' : 'text-red-600'}`}> {confirmedRegion || "Selecciona obligatorio"} </p>
                                                    <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                                </div>
                                            )
                                        ) : ( /* Locked View */
                                            <p className="font-semibold text-gray-900">{confirmedRegion || '-'}</p>
                                        )}
                                    </div>
                                    {/* --- END EDITABLE REGION --- */}

                                    {/* --- EDITABLE TYPE OF SALE --- */}
                                    <div className="min-h-[60px]">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tipo de Venta</p>
                                        {canEdit ? (
                                            isEditingSaleType ? ( /* Editing View */
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex-grow max-w-[200px]"><Select value={editedSaleType} onValueChange={setEditedSaleType}><SelectTrigger className="text-sm h-9 bg-white"><SelectValue placeholder="Selecciona..." /></SelectTrigger><SelectContent>{SALE_TYPES.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select></div>
                                                    <button onClick={handleEditSaleTypeSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                                    <button onClick={handleCancelEditSaleType} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                                </div>
                                            ) : ( /* Hover View */
                                                <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => { setIsEditingSaleType(true); }}>
                                                    <p className={`font-semibold ${confirmedSaleType ? 'text-gray-900' : 'text-red-600'}`}> {confirmedSaleType || "Selecciona obligatorio"} </p>
                                                    <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                                </div>
                                            )
                                        ) : ( /* Locked View */
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
                                    
                                    {/* Locked MRC Previo for Finance APPROVED/REJECTED */}
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

                    {/* Detalle de Servicios Section (Unchanged) */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Detalle de Servicios</h3>
                        <div className="space-y-3">
                        <CostBreakdownRow title="Servicios Recurrentes" items={data.recurring_services.length} total={totalRecurringCosts} isOpen={openSections['recurringCosts']} onToggle={() => toggleSection('recurringCosts')} customTotalsNode={ <div className="flex space-x-4"> <div> <p className="font-semibold text-green-600 text-right">{formatCurrency(totalRecurringIncome)}</p> <p className="text-xs text-gray-500 text-right">Ingreso</p> </div> <div> <p className="font-semibold text-red-600 text-right">{formatCurrency(totalRecurringCosts)}</p> <p className="text-xs text-gray-500 text-right">Egreso</p> </div> </div> } > <RecurringServicesTable data={data.recurring_services} /> </CostBreakdownRow>
                            <CostBreakdownRow title="Inversión (Costos Fijos)" items={data.fixed_costs.length} total={totalFixedCosts} isOpen={openSections['fixedCosts']} onToggle={() => toggleSection('fixedCosts')} customTotalsNode={ <div> <p className="font-semibold text-red-600 text-right">{formatCurrency(totalFixedCosts)}</p> <p className="text-xs text-gray-500 text-right">Total</p> </div> } > <FixedCostsTable data={data.fixed_costs} /> </CostBreakdownRow>
                        </div>
                    </div>

                    {/* Key Performance Indicators Section - MODIFIED (Using the `canEdit` flag in EditableKpiCard) */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Key Performance Indicators</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* --- EDITABLE MRC --- */}
                            <EditableKpiCard
                                title="MRC (Recurrente Mensual)"
                                kpiKey="MRC"
                                currentValue={kpiData.MRC ?? tx.MRC}
                                subtext="Métrica Clave"
                                canEdit={canEdit} 
                                onValueChange={onGigalanInputChange}
                            />
                            {/* --- EDITABLE NRC --- */}
                            <EditableKpiCard
                                title="NRC (Pago Único)"
                                kpiKey="NRC"
                                currentValue={kpiData.NRC ?? tx.NRC}
                                canEdit={canEdit} 
                                onValueChange={onGigalanInputChange}
                            />

                        {/* --- Other KpiCards (Unchanged) --- */}
                        <KpiCard title="VAN" value={formatCurrency(kpiData.VAN)} />
                        <KpiCard title="TIR" value={`${(kpiData.TIR * 100)?.toFixed(2)}%`} />
                        <KpiCard title="Periodo de Payback" value={`${kpiData.payback} meses`} />
                        <KpiCard title="Ingresos Totales" value={formatCurrency(kpiData.totalRevenue)} />
                        <KpiCard title="Gastos Totales" value={formatCurrency(kpiData.totalExpense)} isNegative={true} />
                        <KpiCard title="Utilidad Bruta" value={formatCurrency(kpiData.grossMargin)} />
                        <KpiCard title="Margen Bruto (%)" value={`${(kpiData.grossMarginRatio * 100)?.toFixed(2)}%`} />
                        <KpiCard title="Comisión de Ventas" value={formatCurrency(kpiData.comisiones)} />
                        <KpiCard title="Costo Instalación" value={formatCurrency(tx.costoInstalacion)} />
                        <KpiCard title="Costo Instalación (%)" value={`${(kpiData.costoInstalacionRatio * 100)?.toFixed(2)}%`} />
                        </div>
                    </div>
                </div>

                {/* Footer Integration (Unchanged) */}
                {isFinanceView ? ( <FinancePreviewFooter tx={tx} onApprove={onApprove} onReject={onReject} onCalculateCommission={onCalculateCommission} /> ) : ( <SalesPreviewFooter onConfirm={onConfirm} onClose={onClose} /> )}
            </div>
        </div>
    );
}

export default DataPreviewModal;
// src/components/shared/DataPreviewModal.jsx

import React, { useState, useEffect } from 'react';
import KpiCard from './KpiCard';
import StatusBadge from './StatusBadge';
import CostBreakdownRow from './CostBreakdownRow';
import {
    CloseIcon,
    WarningIcon,
    CheckCircleIcon,
    EditPencilIcon,
    EditCheckIcon,
    EditXIcon
} from './Icons';
import FixedCostsTable from './FixedCostsTable';
import RecurringServicesTable from './RecurringServicesTable';
import { GigaLanCommissionInputs } from '../../features/sales/components/GigaLanCommissionInputs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const UNIDADES_NEGOCIO = ['GIGALAN', 'CORPORATIVO', 'MAYORISTA'];
const REGIONS = ['LIMA', 'PROVINCIAS CON CACHING', 'PROVINCIAS CON INTERNEXA', 'PROVINCIAS CON TDP'];
const SALE_TYPES = ['NUEVO', 'EXISTENTE'];

import { SalesPreviewFooter } from '../../features/sales/components/SalesPreviewFooter';
import { FinancePreviewFooter } from '../../features/finance/components/FinancePreviewFooter';

function DataPreviewModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    data, 
    isFinanceView = false, 
    onApprove, 
    onReject, 
    onCalculateCommission, 
    gigalanInputs, // This now holds data.transactions (tx) from SalesDashboard
    onInputChangeAndRecalculate, // <-- Unified handler (was onGigalanInputChange & onUnidadChange)
    selectedUnidad, // Kept for the initial sync only, but data.transactions is now preferred source
    liveKpis 
}) {
    const formatCurrency = (value) => {
        const numValue = parseFloat(value);
        if (typeof numValue !== 'number' || isNaN(numValue) || numValue === 0) return '-';
        return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const [openSections, setOpenSections] = useState({});

    // --- Local Edit State Flags ---
    const [isEditingPlazo, setIsEditingPlazo] = useState(false);
    const [isEditingUnidad, setIsEditingUnidad] = useState(false);
    const [isEditingRegion, setIsEditingRegion] = useState(false);
    const [isEditingSaleType, setIsEditingSaleType] = useState(false);
    const [isEditingMRC, setIsEditingMRC] = useState(false);
    const [isEditingNRC, setIsEditingNRC] = useState(false);
    
    // --- Local Input Values (Synced from props) ---
    // Initialize with fallback to ensure value is present, but true sync is in useEffect
    const [editedPlazo, setEditedPlazo] = useState(data?.transactions?.plazoContrato ?? '');
    const [editedUnidad, setEditedUnidad] = useState(data?.transactions?.unidadNegocio || '');
    const [editedRegion, setEditedRegion] = useState(data?.transactions?.gigalan_region || '');
    const [editedSaleType, setEditedSaleType] = useState(data?.transactions?.gigalan_sale_type || '');
    const [editedMRC, setEditedMRC] = useState(data?.transactions?.MRC ?? '');
    const [editedNRC, setEditedNRC] = useState(data?.transactions?.NRC ?? '');
    // --- END State for editing ---

    if (!isOpen || !data?.transactions) return null;

    const tx = data.transactions;
    const isPending = tx.ApprovalStatus === 'PENDING';
    const kpiData = liveKpis || tx; 

    // --- Sync states with data props ---
    // This runs whenever `data` or `liveKpis` changes to ensure the edited fields reflect the source of truth
    useEffect(() => {
        if (data?.transactions) {
             const currentTx = data.transactions;
             const kpiSource = liveKpis || currentTx;

             // Use kpiSource for values that change on recalculation
             if (!isEditingPlazo) setEditedPlazo(kpiSource.plazoContrato ?? '');
             if (!isEditingMRC) setEditedMRC(kpiSource.MRC ?? '');
             if (!isEditingNRC) setEditedNRC(kpiSource.NRC ?? '');
             
             // Use currentTx for dropdowns/strings
             if (!isEditingUnidad) setEditedUnidad(currentTx.unidadNegocio || '');
             if (!isEditingRegion) setEditedRegion(currentTx.gigalan_region || '');
             if (!isEditingSaleType) setEditedSaleType(currentTx.gigalan_sale_type || '');
        }
    }, [data, liveKpis, isEditingPlazo, isEditingUnidad, isEditingRegion, isEditingSaleType, isEditingMRC, isEditingNRC]);

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // --- Handlers (All call the unified handler) ---
    const handleEditPlazoSubmit = () => {
        const newPlazo = parseInt(editedPlazo, 10);
        if (!isNaN(newPlazo) && newPlazo > 0 && Number.isInteger(newPlazo)) {
            onInputChangeAndRecalculate('plazoContrato', newPlazo); // <-- UNIFIED CALL
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
        onInputChangeAndRecalculate('unidadNegocio', editedUnidad); // <-- UNIFIED CALL
        setIsEditingUnidad(false);
    };
    const handleCancelEditUnidad = () => {
        setEditedUnidad(tx.unidadNegocio || ''); // Reset using the source of truth
        setIsEditingUnidad(false);
    };

    const handleEditRegionSubmit = () => {
        if (!editedRegion || !REGIONS.includes(editedRegion)) {
            alert("Selección obligatoria: Por favor, selecciona una Región válida.");
            return;
        }
        onInputChangeAndRecalculate('gigalan_region', editedRegion); // <-- UNIFIED CALL
        setIsEditingRegion(false);
    };
    const handleCancelEditRegion = () => {
        setEditedRegion(tx.gigalan_region || ''); // Reset using the source of truth
        setIsEditingRegion(false);
    };

    const handleEditSaleTypeSubmit = () => {
         if (!editedSaleType || !SALE_TYPES.includes(editedSaleType)) {
            alert("Selección obligatoria: Por favor, selecciona un Tipo de Venta válido.");
            return;
        }
        onInputChangeAndRecalculate('gigalan_sale_type', editedSaleType); // <-- UNIFIED CALL
        setIsEditingSaleType(false);
    };
    const handleCancelEditSaleType = () => {
        setEditedSaleType(tx.gigalan_sale_type || ''); // Reset using the source of truth
        setIsEditingSaleType(false);
    };

    const handleEditMRCSubmit = () => {
        const newMRC = parseFloat(editedMRC); 
        if (!isNaN(newMRC) && newMRC >= 0) {
            onInputChangeAndRecalculate('MRC', newMRC); // <-- UNIFIED CALL
            setIsEditingMRC(false);
        } else {
            alert("Please enter a valid non-negative number for MRC.");
        }
    };
    const handleCancelEditMRC = () => {
        setEditedMRC(kpiData.MRC ?? tx.MRC ?? '');
        setIsEditingMRC(false);
    };

    const handleEditNRCSubmit = () => {
        const newNRC = parseFloat(editedNRC); 
        if (!isNaN(newNRC) && newNRC >= 0) {
            onInputChangeAndRecalculate('NRC', newNRC); // <-- UNIFIED CALL
            setIsEditingNRC(false);
        } else {
            alert("Please enter a valid non-negative number for NRC.");
        }
    };
    const handleCancelEditNRC = () => {
        setEditedNRC(kpiData.NRC ?? tx.NRC ?? '');
        setIsEditingNRC(false);
    };
    // --- END Handlers ---

    const baseOverviewData = [
        { label: 'Transaction ID', value: tx.id || '-' }, // Changed from tx.transactionID
        { label: 'Nombre Cliente', value: tx.clientName },
        { label: 'RUC/DNI', value: tx.companyID },
        { label: 'Order ID', value: tx.orderID },
        { label: 'Tipo de Cambio', value: formatCurrency(tx.tipoCambio) },
        { label: 'Status', value: <StatusBadge status={tx.ApprovalStatus} /> },
    ];

    const totalFixedCosts = data.fixed_costs.reduce((acc, item) => acc + (item.total || 0), 0);
    const totalRecurringCosts = data.recurring_services.reduce((acc, item) => acc + (item.egreso || 0), 0);
    const totalRecurringIncome = data.recurring_services.reduce((acc, item) => acc + (item.ingreso || 0), 0);

    // Use tx (which is the current uploadedData.transactions) as the definitive source
    const confirmedUnidad = tx.unidadNegocio; 
    const confirmedRegion = tx.gigalan_region;
    const confirmedSaleType = tx.gigalan_sale_type;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Preview of Transaction Data</h2>
                        <p className="text-sm text-gray-500">File: {data.fileName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                </div>

                {/* Modal Body */}
                <div className="p-6 bg-gray-50 max-h-[75vh] overflow-y-auto">

                    {/* Warning Banners */}
                    {!isFinanceView && !isPending && ( <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-red-800">Transaction Status: {tx.ApprovalStatus}</p> <p className="text-sm text-red-700">Modification of key inputs is not allowed once a transaction has been reviewed.</p> </div> </div> )}
                    {!isFinanceView && isPending && ( <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 flex items-start"> <WarningIcon className="flex-shrink-0 mt-0.5" /> <div className="ml-3"> <p className="font-semibold text-yellow-800">Por favor revisar la data cargada de manera minuciosa</p> <p className="text-sm text-yellow-700">Asegúrate que toda la información sea correcta antes de confirmarla.</p> </div> </div> )}

                    {/* Transaction Overview Section */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Transaction Overview</h3>
                        <div className="bg-gray-100 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 items-start">

                            {/* --- EDITABLE UNIDAD DE NEGOCIO --- */}
                            {!isFinanceView ? ( // Sales View
                                <div className="min-h-[60px]">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unidad de Negocio</p>
                                    {isPending ? (
                                        isEditingUnidad ? ( /* Editing View */
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-grow max-w-[200px]"><Select value={editedUnidad} onValueChange={setEditedUnidad}><SelectTrigger className="text-sm h-9 bg-white"><SelectValue placeholder="Selecciona..." /></SelectTrigger><SelectContent>{UNIDADES_NEGOCIO.map(unidad => (<SelectItem key={unidad} value={unidad}>{unidad}</SelectItem>))}</SelectContent></Select></div>
                                                <button onClick={handleEditUnidadSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                                <button onClick={handleCancelEditUnidad} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                            </div>
                                        ) : ( /* Hover View */
                                            <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => { setEditedUnidad(confirmedUnidad || ''); setIsEditingUnidad(true); }}>
                                                <p className={`font-semibold ${confirmedUnidad ? 'text-gray-900' : 'text-red-600'}`}> {confirmedUnidad || "Selecciona obligatorio"} </p>
                                                <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                            </div>
                                        )
                                    ) : ( /* Locked View */
                                        <p className={`font-semibold ${confirmedUnidad ? 'text-gray-900' : 'text-red-600'}`}> {confirmedUnidad || "Selecciona obligatorio"} </p>
                                    )}
                                </div>
                            ) : ( /* Finance View */
                                <div className="min-h-[60px]">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unidad de Negocio</p>
                                    <p className="font-semibold text-gray-900">{tx.unidadNegocio || '-'}</p>
                                </div>
                            )}
                            {/* --- END EDITABLE UNIDAD DE NEGOCIO --- */}

                            {/* Render Base Data */}
                            {baseOverviewData.map(item => (
                                <div key={item.label} className="min-h-[60px]">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                                    <div className="font-semibold text-gray-900">{item.value}</div>
                                </div>
                            ))}

                            {/* --- EDITABLE PLAZO DE CONTRATO --- */}
                            <div className="min-h-[60px]">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plazo de Contrato</p>
                                {(!isFinanceView && isPending) ? (
                                    isEditingPlazo ? ( /* Editing View */
                                        <div className="flex items-center space-x-2">
                                            <Input type="number" value={editedPlazo} onChange={(e) => setEditedPlazo(e.target.value)} className="h-9 w-24 text-sm p-2 border-input ring-ring focus-visible:ring-1 bg-white" min="1" step="1"/>
                                            <button onClick={handleEditPlazoSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                            <button onClick={handleCancelEditPlazo} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                        </div>
                                    ) : ( /* Hover View */
                                        <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => {
                                            setEditedPlazo(kpiData.plazoContrato ?? tx.plazoContrato ?? '');
                                            setIsEditingPlazo(true);
                                            }}>
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
                                    {!isFinanceView ? ( // Sales View
                                        <div className="min-h-[60px]">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Región</p>
                                            {isPending ? (
                                                isEditingRegion ? ( /* Editing View */
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex-grow max-w-[200px]"><Select value={editedRegion} onValueChange={setEditedRegion}><SelectTrigger className="text-sm h-9 bg-white"><SelectValue placeholder="Selecciona..." /></SelectTrigger><SelectContent>{REGIONS.map(region => (<SelectItem key={region} value={region}>{region}</SelectItem>))}</SelectContent></Select></div>
                                                        <button onClick={handleEditRegionSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                                        <button onClick={handleCancelEditRegion} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                                    </div>
                                                ) : ( /* Hover View */
                                                    <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => { setEditedRegion(confirmedRegion || ''); setIsEditingRegion(true); }}>
                                                        <p className={`font-semibold ${confirmedRegion ? 'text-gray-900' : 'text-red-600'}`}> {confirmedRegion || "Selecciona obligatorio"} </p>
                                                        <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                                    </div>
                                                )
                                            ) : ( /* Locked View */
                                                <p className="font-semibold text-gray-900">{confirmedRegion || '-'}</p>
                                            )}
                                        </div>
                                    ) : ( /* Finance View */
                                        <div className="min-h-[60px]">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Región</p>
                                            <p className="font-semibold text-gray-900">{tx.gigalan_region || '-'}</p>
                                        </div>
                                    )}
                                    {/* --- END EDITABLE REGION --- */}

                                    {/* --- EDITABLE TYPE OF SALE --- */}
                                    {!isFinanceView ? ( // Sales View
                                        <div className="min-h-[60px]">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tipo de Venta</p>
                                            {isPending ? (
                                                isEditingSaleType ? ( /* Editing View */
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex-grow max-w-[200px]"><Select value={editedSaleType} onValueChange={setEditedSaleType}><SelectTrigger className="text-sm h-9 bg-white"><SelectValue placeholder="Selecciona..." /></SelectTrigger><SelectContent>{SALE_TYPES.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select></div>
                                                        <button onClick={handleEditSaleTypeSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                                        <button onClick={handleCancelEditSaleType} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                                    </div>
                                                ) : ( /* Hover View */
                                                    <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => { setEditedSaleType(confirmedSaleType || ''); setIsEditingSaleType(true); }}>
                                                        <p className={`font-semibold ${confirmedSaleType ? 'text-gray-900' : 'text-red-600'}`}> {confirmedSaleType || "Selecciona obligatorio"} </p>
                                                        <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                                    </div>
                                                )
                                            ) : ( /* Locked View */
                                                <p className="font-semibold text-gray-900">{confirmedSaleType || '-'}</p>
                                            )}
                                        </div>
                                    ) : ( /* Finance View */
                                        <div className="min-h-[60px]">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tipo de Venta</p>
                                            <p className="font-semibold text-gray-900">{tx.gigalan_sale_type || '-'}</p>
                                        </div>
                                    )}
                                    {/* --- END EDITABLE TYPE OF SALE --- */}

                                    {/* --- Render MRC PREVIO (Static - Finance view only for Existing sales) --- */}
                                    {isFinanceView && tx.gigalan_sale_type === 'EXISTENTE' && (
                                        <div className="min-h-[60px]">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">MRC Previo</p>
                                            <p className="font-semibold text-gray-900">{tx.gigalan_old_mrc ? formatCurrency(tx.gigalan_old_mrc) : '-'}</p>
                                        </div>
                                    )}

                                    {/* --- GigaLan PREVIOUS MONTHLY CHARGE Input --- */}
                                    {!isFinanceView && isPending && confirmedSaleType === 'EXISTENTE' && (
                                        <div className="min-h-[60px]">
                                            <GigaLanCommissionInputs
                                                inputs={tx} // <-- Pass the full transaction object (tx)
                                                onInputChange={onInputChangeAndRecalculate} // <-- Use UNIFIED handler
                                            />
                                        </div>
                                    )}
                                    {/* --- END GigaLan PREVIOUS MONTHLY CHARGE Input --- */}
                                </>
                            )}
                            {/* --- END GIGALAN FIELDS --- */}
                        </div>
                    </div>

                    {/* Detalle de Servicios Section */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Detalle de Servicios</h3>
                        <div className="space-y-3">
                        <CostBreakdownRow title="Servicios Recurrentes" items={data.recurring_services.length} total={totalRecurringCosts} isOpen={openSections['recurringCosts']} onToggle={() => toggleSection('recurringCosts')} customTotalsNode={ <div className="flex space-x-4"> <div> <p className="font-semibold text-green-600 text-right">{formatCurrency(totalRecurringIncome)}</p> <p className="text-xs text-gray-500 text-right">Ingreso</p> </div> <div> <p className="font-semibold text-red-600 text-right">{formatCurrency(totalRecurringCosts)}</p> <p className="text-xs text-gray-500 text-right">Egreso</p> </div> </div> } > <RecurringServicesTable data={data.recurring_services} /> </CostBreakdownRow>
                            <CostBreakdownRow title="Inversión (Costos Fijos)" items={data.fixed_costs.length} total={totalFixedCosts} isOpen={openSections['fixedCosts']} onToggle={() => toggleSection('fixedCosts')} customTotalsNode={ <div> <p className="font-semibold text-red-600 text-right">{formatCurrency(totalFixedCosts)}</p> <p className="text-xs text-gray-500 text-right">Total</p> </div> } > <FixedCostsTable data={data.fixed_costs} /> </CostBreakdownRow>
                        </div>
                    </div>

                    {/* Key Performance Indicators Section */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Key Performance Indicators</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* --- EDITABLE MRC (using KpiCard) --- */}
                            <div className="relative group"> {/* Wrapper for hover/edit */}
                                {(!isFinanceView && isPending && isEditingMRC) ? (
                                    /* --- Editing View (Input + Buttons) --- */
                                    <div className="bg-white p-3 rounded-lg border border-blue-300 shadow-md h-full flex flex-col justify-center"> {/* Added height/flex */}
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Edit MRC</label>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Input
                                                type="number"
                                                value={editedMRC}
                                                onChange={(e) => setEditedMRC(e.target.value)}
                                                className="h-9 flex-grow text-sm p-2 border-input ring-ring focus-visible:ring-1 bg-white"
                                                min="0"
                                                step="0.01"
                                                autoFocus
                                            />
                                            <button onClick={handleEditMRCSubmit} className="p-1 rounded hover:bg-gray-200 text-green-600 flex-shrink-0"><EditCheckIcon /></button>
                                            <button onClick={handleCancelEditMRC} className="p-1 rounded hover:bg-gray-200 text-red-600 flex-shrink-0"><EditXIcon /></button>
                                        </div>
                                    </div>
                                ) : (
                                    /* --- Display View (KpiCard + Hover Edit Button) --- */
                                    <>
                                        <KpiCard
                                            title="MRC (Recurrente Mensual)"
                                            value={formatCurrency(kpiData.MRC ?? tx.MRC)}
                                            subtext="Métrica Clave"
                                        />
                                        {(!isFinanceView && isPending) && (
                                            <button
                                                onClick={() => { 
                                                    setEditedMRC(kpiData.MRC ?? tx.MRC ?? ''); 
                                                    setIsEditingMRC(true); 
                                                }}
                                                className="absolute top-2 right-2 p-1 rounded bg-gray-100 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                                                aria-label="Edit MRC"
                                            >
                                                <EditPencilIcon />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            {/* --- END EDITABLE MRC --- */}


                        {/* --- Other KpiCards --- */}
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

                {/* Footer Integration */}
                {isFinanceView ? ( <FinancePreviewFooter tx={tx} onApprove={onApprove} onReject={onReject} onCalculateCommission={onCalculateCommission} /> ) : ( <SalesPreviewFooter onConfirm={onConfirm} onClose={onClose} /> )}
            </div>
        </div>
    );
}

export default DataPreviewModal;
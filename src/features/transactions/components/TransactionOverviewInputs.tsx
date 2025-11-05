// src/features/transactions/components/TransactionOverviewInputs.tsx

import React, { useState } from 'react';
import {
    EditPencilIcon,
    EditCheckIcon,
    EditXIcon
} from '@/components/shared/Icons';
import { GigaLanCommissionInputs } from '@/features/transactions/components/GigaLanCommissionInputs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UNIDADES_NEGOCIO, REGIONS, SALE_TYPES } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatters';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext'; 
// import { EditableKpiCard } from '@/components/shared/EditableKpiCard'; // REMOVED: No longer used, logic moved inline

// --- PROPS ARE THE SAME ---
interface TransactionOverviewInputsProps {
    isFinanceView: boolean;
}

// Local utility to format value and append currency for display mode
const formatCurrencyDisplay = (value: number | string | null | undefined, currency: string | null | undefined = 'PEN'): string => {
    // Use formatCurrency for value formatting, which handles the '-' for zero/null/undefined
    return `${formatCurrency(value)} ${currency || 'PEN'}`;
};

export function TransactionOverviewInputs({ isFinanceView }: TransactionOverviewInputsProps) {

    const {
        baseTransaction,
        draftState, 
        dispatch,     
        canEdit
    } = useTransactionPreview();

    const {
        liveKpis,
        liveEdits, 
    } = draftState;

    // Helper for dispatching updates to liveEdits
    const onValueChange = (key: string, newValue: string | number | null) => {
        dispatch({
            type: 'UPDATE_TRANSACTION_FIELD',
            payload: { key, value: newValue }
        });
    }

    const tx = baseTransaction.transactions;
    const kpiData = liveKpis || tx;
    const gigalanInputs = liveEdits;

    // --- Local Editing State (all fields are now managed locally) ---
    const [isEditingPlazo, setIsEditingPlazo] = useState<boolean>(false);
    const [editedPlazo, setEditedPlazo] = useState<string | number | null>(null);
    const [isEditingUnidad, setIsEditingUnidad] = useState<boolean>(false);
    const [editedUnidad, setEditedUnidad] = useState<string | null>(null);
    const [isEditingRegion, setIsEditingRegion] = useState<boolean>(false);
    const [editedRegion, setEditedRegion] = useState<string | null>(null);
    const [isEditingSaleType, setIsEditingSaleType] = useState<boolean>(false);
    const [editedSaleType, setEditedSaleType] = useState<string | null>(null);

    // NEW STATES FOR INLINE EDITING OF MRC/NRC (Value and Currency in one cycle)
    const [isEditingMrc, setIsEditingMrc] = useState<boolean>(false);
    const [editedMrcValue, setEditedMrcValue] = useState<string | number | null>(null);
    const [editedMrcCurrency, setEditedMrcCurrency] = useState<string | null>(null);

    const [isEditingNrc, setIsEditingNrc] = useState<boolean>(false);
    const [editedNrcValue, setEditedNrcValue] = useState<string | number | null>(null);
    const [editedNrcCurrency, setEditedNrcCurrency] = useState<string | null>(null);

    // --- Plazo Contrato Handlers ---
    const handleEditPlazoSubmit = () => {
        const newPlazo = parseInt(editedPlazo as string, 10);
        if (!isNaN(newPlazo) && newPlazo > 0 && Number.isInteger(newPlazo)) {
            // Call dispatch to update the draft state
            dispatch({
                type: 'UPDATE_TRANSACTION_FIELD',
                payload: { key: 'plazoContrato', value: newPlazo }
            });
            setIsEditingPlazo(false);
        } else {
            // NOTE: Consider using a state variable for local component errors
            alert("Please enter a valid whole number greater than 0 for Plazo Contrato.");
        }
    };

    const handleCancelEditPlazo = () => setIsEditingPlazo(false);

    // Handlers for Unidad, Region, Sale Type also need to be defined
    const handleEditUnidadSubmit = () => {
        if (!editedUnidad || !UNIDADES_NEGOCIO.includes(editedUnidad)) {
            alert("Selección obligatoria: Por favor, selecciona una Unidad de Negocio válida.");
            return;
        }
        dispatch({
            type: 'UPDATE_TRANSACTION_FIELD',
            payload: { key: 'unidadNegocio', value: editedUnidad }
        });
        setIsEditingUnidad(false);
    };

    const handleCancelEditUnidad = () => setIsEditingUnidad(false);

    const handleEditRegionSubmit = () => {
        if (!editedRegion || !REGIONS.includes(editedRegion)) {
            alert("Selección obligatoria: Por favor, selecciona una Región válida.");
            return;
        }
        dispatch({
            type: 'UPDATE_TRANSACTION_FIELD',
            payload: { key: 'gigalan_region', value: editedRegion }
        });
        setIsEditingRegion(false);
    };

    const handleCancelEditRegion = () => setIsEditingRegion(false);

    const handleEditSaleTypeSubmit = () => {
        if (!editedSaleType || !SALE_TYPES.includes(editedSaleType as any)) {
            alert("Selección obligatoria: Por favor, selecciona un Tipo de Venta válido.");
            return;
        }
        dispatch({
            type: 'UPDATE_TRANSACTION_FIELD',
            payload: { key: 'gigalan_sale_type', value: editedSaleType }
        });
        setIsEditingSaleType(false);
    };

    const handleCancelEditSaleType = () => setIsEditingSaleType(false);
    
    // --- NEW MRC/NRC Handlers (Combined Value and Currency) ---
    const handleEditMrcSubmit = () => {
        const newValue = parseFloat(editedMrcValue as string);
        if (!isNaN(newValue) && newValue >= 0) {
            onValueChange('MRC', newValue);
            onValueChange('mrc_currency', editedMrcCurrency as string);
            setIsEditingMrc(false);
        } else {
            alert("Please enter a valid non-negative number for MRC.");
        }
    };
    const handleCancelEditMrc = () => setIsEditingMrc(false);

    const handleEditNrcSubmit = () => {
        const newValue = parseFloat(editedNrcValue as string);
        if (!isNaN(newValue) && newValue >= 0) {
            onValueChange('NRC', newValue);
            onValueChange('nrc_currency', editedNrcCurrency as string);
            setIsEditingNrc(false);
        }
        else {
            alert("Please enter a valid non-negative number for NRC.");
        }
    };
    const handleCancelEditNrc = () => setIsEditingNrc(false);

    // Wrapper function for GigaLanCommissionInputs
    const handleGigaLanOldMrcChange = (key: string, value: number | null) => {
        onValueChange(key, value);
    };

    // --- Derived Values (read from draftState) ---
    const confirmedUnidad = liveEdits?.unidadNegocio ?? tx.unidadNegocio;
    const confirmedRegion = liveEdits?.gigalan_region ?? tx.gigalan_region;
    const confirmedSaleType = liveEdits?.gigalan_sale_type ?? tx.gigalan_sale_type;

    // NEW DERIVED VALUES FOR MRC/NRC
    const confirmedMrcValue = liveEdits?.MRC ?? kpiData.MRC ?? tx.MRC;
    const confirmedMrcCurrency = liveEdits?.mrc_currency ?? kpiData.mrc_currency ?? tx.mrc_currency ?? 'PEN';
    const confirmedNrcValue = liveEdits?.NRC ?? kpiData.NRC ?? tx.NRC;
    const confirmedNrcCurrency = liveEdits?.nrc_currency ?? kpiData.nrc_currency ?? tx.nrc_currency ?? 'PEN';
    
    // Helper for static display blocks (RUC/DNI, Nombre Cliente, Comisión)
    const StaticField = ({ label, value, currency }: { label: string, value: React.ReactNode, currency?: string }) => (
        <div className="min-h-[60px]">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <div className="font-semibold text-gray-900">{value} {currency}</div>
        </div>
    );

    return (
        <div className="mb-6">
            <div className="flex justify-between items-start mb-3"> {/* <--- MODIFIED TO USE FLEX */}
                <h3 className="font-semibold text-gray-800 text-lg">Transaction Overview</h3>
                
                {/* --- MODIFIED BLOCK: Master Variables (Horizontal) --- */}
                <div className="flex space-x-4 text-xs text-gray-500"> {/* <--- MODIFIED CLASSES */}
                    <p>
                        Tipo de Cambio: 
                        <span className="font-semibold text-gray-700 ml-1">
                            {formatCurrency(tx.tipoCambio, { decimals: 4 })}
                        </span>
                    </p>
                    <p>
                        Costo Capital: 
                        <span className="font-semibold text-gray-700 ml-1">
                            {formatCurrency(tx.costoCapitalAnual * 100, { decimals: 2 })}%
                        </span>
                    </p>
                </div>
                {/* --- END MODIFIED BLOCK --- */}

            </div>
            <div className="bg-gray-100 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 items-start">
                
                {/* 1. UNIDAD DE NEGOCIO (Complex Block) */}
                <div className="min-h-[60px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unidad de Negocio</p>
                    {canEdit ? (
                        isEditingUnidad ? (
                            <div className="flex items-center space-x-2">
                                <div className="flex-grow max-w-[200px]">
                                    <Select value={editedUnidad || ''} onValueChange={setEditedUnidad}>
                                        <SelectTrigger className="text-sm h-9 bg-white">
                                            <SelectValue placeholder="Selecciona..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {UNIDADES_NEGOCIO.map(unidad => (<SelectItem key={unidad} value={unidad}>{unidad}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <button onClick={handleEditUnidadSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                <button onClick={handleCancelEditUnidad} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                            </div>
                        ) : (
                            <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => {
                                setEditedUnidad((liveEdits?.unidadNegocio ?? tx.unidadNegocio) || '');
                                setIsEditingUnidad(true);
                            }}>
                                <p className={`font-semibold ${confirmedUnidad ? 'text-gray-900' : 'text-red-600'}`}> {confirmedUnidad || "Selecciona obligatorio"} </p>
                                <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                            </div>
                        )
                    ) : (
                        <p className="font-semibold text-gray-900">{tx.unidadNegocio || '-'}</p>
                    )}
                </div>
                {/* 2. RUC/DNI (Static Field) */}
                <StaticField label="RUC/DNI" value={tx.companyID || '-'} />

                {/* 3. NOMBRE CLIENTE (Static Field) */}
                <StaticField label="Nombre Cliente" value={tx.clientName} />
                
                {/* 4. PLAZO DE CONTRATO (Complex Block) */}
                <div className="min-h-[60px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plazo de Contrato</p>
                    {canEdit ? (
                        isEditingPlazo ? (
                            <div className="flex items-center space-x-2">
                                <Input type="number" value={editedPlazo || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedPlazo(e.target.value)} className="h-9 w-24 text-sm p-2 border-input ring-ring focus-visible:ring-1 bg-white" min="1" step="1" />
                                <button onClick={handleEditPlazoSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                <button onClick={handleCancelEditPlazo} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                            </div>
                        ) : (
                            <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => {
                                setEditedPlazo((kpiData.plazoContrato ?? tx.plazoContrato) || '');
                                setIsEditingPlazo(true);
                            }}>
                                <p className="font-semibold text-gray-900">{kpiData.plazoContrato ?? tx.plazoContrato ?? '-'} meses</p>
                                <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                            </div>
                        )
                    ) : (
                        <p className="font-semibold text-gray-900">{kpiData.plazoContrato ?? tx.plazoContrato ?? '-'} meses</p>
                    )}
                </div>

                {/* 5. MRC (INLINE Editable Block) */}
                <div className="min-h-[60px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">MRC (Recurrente Mensual)</p>
                    {canEdit ? (
                        isEditingMrc ? (
                            <div className="flex items-center space-x-1">
                                {/* Input for Value */}
                                <Input 
                                    type="number" 
                                    value={editedMrcValue ?? ''} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedMrcValue(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleEditMrcSubmit()}
                                    className="h-9 w-20 text-sm p-2 border-input ring-ring focus-visible:ring-1 bg-white" 
                                    min="0" 
                                    step="0.01" 
                                    autoFocus
                                />
                                
                                {/* Select for Currency */}
                                <div className="w-16">
                                    <Select 
                                        value={editedMrcCurrency || ''} 
                                        onValueChange={(value) => setEditedMrcCurrency(value)}
                                    >
                                        <SelectTrigger className="text-sm h-9 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PEN">PEN</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                {/* Buttons */}
                                <button onClick={handleEditMrcSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0" aria-label="Confirm MRC"><EditCheckIcon /></button>
                                <button onClick={handleCancelEditMrc} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0" aria-label="Cancel MRC"><EditXIcon /></button>
                            </div>
                        ) : (
                            <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => {
                                setEditedMrcValue(confirmedMrcValue ?? '');
                                setEditedMrcCurrency(confirmedMrcCurrency ?? 'PEN');
                                setIsEditingMrc(true);
                            }}>
                                <p className="font-semibold text-gray-900">{formatCurrencyDisplay(confirmedMrcValue, confirmedMrcCurrency)}</p>
                                <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                            </div>
                        )
                    ) : (
                        <p className="font-semibold text-gray-900">{formatCurrencyDisplay(confirmedMrcValue, confirmedMrcCurrency)}</p>
                    )}
                </div>
                
                {/* 6. NRC (INLINE Editable Block) */}
                <div className="min-h-[60px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">NRC (Pago Único)</p>
                    {canEdit ? (
                        isEditingNrc ? (
                            <div className="flex items-center space-x-1">
                                {/* Input for Value */}
                                <Input 
                                    type="number" 
                                    value={editedNrcValue ?? ''} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedNrcValue(e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleEditNrcSubmit()}
                                    className="h-9 w-20 text-sm p-2 border-input ring-ring focus-visible:ring-1 bg-white" 
                                    min="0" 
                                    step="0.01" 
                                />
                                
                                {/* Select for Currency */}
                                <div className="w-16">
                                    <Select 
                                        value={editedNrcCurrency || ''} 
                                        onValueChange={(value) => setEditedNrcCurrency(value)}
                                    >
                                        <SelectTrigger className="text-sm h-9 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PEN">PEN</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                {/* Buttons */}
                                <button onClick={handleEditNrcSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0" aria-label="Confirm NRC"><EditCheckIcon /></button>
                                <button onClick={handleCancelEditNrc} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0" aria-label="Cancel NRC"><EditXIcon /></button>
                            </div>
                        ) : (
                            <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => {
                                setEditedNrcValue(confirmedNrcValue ?? '');
                                setEditedNrcCurrency(confirmedNrcCurrency ?? 'PEN');
                                setIsEditingNrc(true);
                            }}>
                                <p className="font-semibold text-gray-900">{formatCurrencyDisplay(confirmedNrcValue, confirmedNrcCurrency)}</p>
                                <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                            </div>
                        )
                    ) : (
                        <p className="font-semibold text-gray-900">{formatCurrencyDisplay(confirmedNrcValue, confirmedNrcCurrency)}</p>
                    )}
                </div>

                {/* 7. COMISION DE VENTAS (Static Field) */}
                <StaticField 
                    label="Comisión de Ventas" 
                    value={formatCurrency(kpiData.comisiones)} 
                    currency="PEN" 
                />

                {/* --- GIGALAN FIELDS (Non-Financial fields kept for completeness) --- */}
                {confirmedUnidad === 'GIGALAN' && (
                    <>
                        {/* --- EDITABLE REGION (8) --- */}
                        <div className="min-h-[60px]">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Región</p>
                            {canEdit ? (
                                isEditingRegion ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-grow max-w-[200px]">
                                            <Select value={editedRegion || ''} onValueChange={setEditedRegion}>
                                                <SelectTrigger className="text-sm h-9 bg-white">
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {REGIONS.map(region => (<SelectItem key={region} value={region}>{region}</SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <button onClick={handleEditRegionSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                        <button onClick={handleCancelEditRegion} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                    </div>
                                ) : (
                                    <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => {
                                        setEditedRegion((liveEdits?.gigalan_region ?? tx.gigalan_region) || '');
                                        setIsEditingRegion(true);
                                    }}>
                                        <p className={`font-semibold ${confirmedRegion ? 'text-gray-900' : 'text-red-600'}`}> {confirmedRegion || "Selecciona obligatorio"} </p>
                                        <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                    </div>
                                )
                            ) : (
                                <p className="font-semibold text-gray-900">{confirmedRegion || '-'}</p>
                            )}
                        </div>
                        {/* --- EDITABLE TYPE OF SALE --- */}
                        <div className="min-h-[60px]">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tipo de Venta</p>
                            {canEdit ? (
                                isEditingSaleType ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-grow max-w-[200px]">
                                            <Select value={editedSaleType || ''} onValueChange={setEditedSaleType}>
                                                <SelectTrigger className="text-sm h-9 bg-white">
                                                    <SelectValue placeholder="Selecciona..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SALE_TYPES.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <button onClick={handleEditSaleTypeSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                        <button onClick={handleCancelEditSaleType} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                                    </div>
                                ) : (
                                    <div className="group flex items-center space-x-2 cursor-pointer" onClick={() => {
                                        setEditedSaleType((liveEdits?.gigalan_sale_type ?? tx.gigalan_sale_type) || '');
                                        setIsEditingSaleType(true);
                                    }}>
                                        <p className={`font-semibold ${confirmedSaleType ? 'text-gray-900' : 'text-red-600'}`}> {confirmedSaleType || "Selecciona obligatorio"} </p>
                                        <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><EditPencilIcon /></div>
                                    </div>
                                )
                            ) : (
                                <p className="font-semibold text-gray-900">{confirmedSaleType || '-'}</p>
                            )}
                        </div>
                        {/* --- GigaLan PREVIOUS MONTHLY CHARGE Input (10) --- */}
                        {canEdit && confirmedSaleType === 'EXISTENTE' && (
                            <div className="min-h-[60px]">
                                <GigaLanCommissionInputs
                                    inputs={{ ...gigalanInputs, gigalan_sale_type: confirmedSaleType }}
                                    onInputChange={handleGigaLanOldMrcChange} 
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
            </div>
        </div>
    );
}
// src/features/transactions/components/TransactionOverviewInputs.tsx
import React, { useState, useEffect, useMemo } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import {
    EditPencilIcon,
    EditCheckIcon,
    EditXIcon
} from '@/components/shared/Icons';
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
    Transaction,
    KpiCalculationResponse
} from '@/types'; 
// *** NEW IMPORT ***
import { formatCurrency } from '@/lib/formatters'; 

type Currency = 'PEN' | 'USD';

interface OverviewInputsProps {
    tx: Transaction; // Base transaction data
    kpiData: KpiCalculationResponse['data'] | Transaction; // Live/recalculated data
    isFinanceView: boolean;
    canEdit: boolean;
    gigalanInputs: Record<string, any> | null;
    selectedUnidad: string;
    onGigalanInputChange: (key: string, value: any) => void;
    onUnidadChange: (value: string) => void;
}

export function TransactionOverviewInputs({
    tx,
    kpiData,
    isFinanceView,
    canEdit,
    gigalanInputs,
    selectedUnidad,
    onGigalanInputChange,
    onUnidadChange,
}: OverviewInputsProps) {

    // --- Local Editing State (Lifted from TransactionPreviewContent) ---
    const [isEditingPlazo, setIsEditingPlazo] = useState<boolean>(false);
    const [editedPlazo, setEditedPlazo] = useState<string | number | null>(null);
    const [isEditingUnidad, setIsEditingUnidad] = useState<boolean>(false);
    const [editedUnidad, setEditedUnidad] = useState<string | null>(null);
    const [isEditingRegion, setIsEditingRegion] = useState<boolean>(false);
    const [editedRegion, setEditedRegion] = useState<string | null>(null);
    const [isEditingSaleType, setIsEditingSaleType] = useState<boolean>(false);
    const [editedSaleType, setEditedSaleType] = useState<string | null>(null);

    // --- useEffect for initializing local state ---
    useEffect(() => {
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
    }, [tx, kpiData, selectedUnidad, gigalanInputs, isEditingPlazo, isEditingUnidad, isEditingRegion, isEditingSaleType, isFinanceView, editedPlazo, editedUnidad, editedRegion, editedSaleType]);


    // --- Local Handlers (Lifted from TransactionPreviewContent) ---
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
         if (!editedSaleType) {
            alert("Selección obligatoria: Por favor, selecciona un Tipo de Venta válido.");
            return;
        }
        
        const saleType = editedSaleType as ('NUEVO' | 'EXISTENTE');

        if (!SALE_TYPES.includes(saleType)) {
            alert("Selección obligatoria: Por favor, selecciona un Tipo de Venta válido.");
            return;
        }
        
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

    const baseOverviewData = useMemo(() => [
        { label: 'Transaction ID', value: tx.transactionID || '-' },
        { label: 'Nombre Cliente', value: tx.clientName },
        { label: 'RUC/DNI', value: tx.companyID },
        { label: 'Order ID', value: tx.orderID },
        { label: 'Tipo de Cambio', value: tx.tipoCambio },
        { label: 'Status', value: <StatusBadge status={tx.ApprovalStatus} /> },
    ], [tx.transactionID, tx.clientName, tx.companyID, tx.orderID, tx.tipoCambio, tx.ApprovalStatus]);

    return (
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
                                {/* FIX: Apply formatCurrency to the MRC value */}
                                <p className="font-semibold text-gray-900">{tx.gigalan_old_mrc ? formatCurrency(tx.gigalan_old_mrc) : '-'}</p>
                            </div>
                        )}
                    </>
                )}
                {/* --- END GIGALAN FIELDS --- */}
            </div>
        </div>
    );
}
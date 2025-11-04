// src/features/transactions/components/TransactionOverviewInputs.tsx
import React, { useState, useMemo } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
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
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext'; // 1. Import hook

// --- PROPS ARE THE SAME ---
interface TransactionOverviewInputsProps {
    isFinanceView: boolean;
}

export function TransactionOverviewInputs({ isFinanceView }: TransactionOverviewInputsProps) {

    // 2. GET NEW STATE AND DISPATCH FROM CONTEXT
    const {
        baseTransaction,
        draftState, // Get the entire draftState
        dispatch,     // Get the dispatch function
        canEdit
    } = useTransactionPreview();

    // 3. Destructure state from draftState
    const {
        liveKpis,
        liveEdits, // This replaces 'gigalanInputs'
    } = draftState;

    const tx = baseTransaction.transactions;
    const kpiData = liveKpis || tx;
    const gigalanInputs = liveEdits; // Use 'liveEdits' from context

    // --- Local Editing State (remains the same) ---
    const [isEditingPlazo, setIsEditingPlazo] = useState<boolean>(false);
    const [editedPlazo, setEditedPlazo] = useState<string | number | null>(null);
    const [isEditingUnidad, setIsEditingUnidad] = useState<boolean>(false);
    const [editedUnidad, setEditedUnidad] = useState<string | null>(null);
    const [isEditingRegion, setIsEditingRegion] = useState<boolean>(false);
    const [editedRegion, setEditedRegion] = useState<string | null>(null);
    const [isEditingSaleType, setIsEditingSaleType] = useState<boolean>(false);
    const [editedSaleType, setEditedSaleType] = useState<string | null>(null);

    // --- 4. Local Handlers (Now call dispatch) ---
    const handleEditPlazoSubmit = () => {
        const newPlazo = parseInt(editedPlazo as string, 10);
        if (!isNaN(newPlazo) && newPlazo > 0 && Number.isInteger(newPlazo)) {
            // Call dispatch instead of handleGigalanInputChange
            dispatch({
                type: 'UPDATE_TRANSACTION_FIELD',
                payload: { key: 'plazoContrato', value: newPlazo }
            });
            setIsEditingPlazo(false);
        } else {
            alert("Please enter a valid whole number greater than 0 for Plazo Contrato.");
        }
    };

    const handleCancelEditPlazo = () => setIsEditingPlazo(false);

    const handleEditUnidadSubmit = () => {
        if (!editedUnidad || !UNIDADES_NEGOCIO.includes(editedUnidad)) {
            alert("Selección obligatoria: Por favor, selecciona una Unidad de Negocio válida.");
            return;
        }
        // Call dispatch instead of handleUnidadChange
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
        // Call dispatch
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
        // Call dispatch
        dispatch({
            type: 'UPDATE_TRANSACTION_FIELD',
            payload: { key: 'gigalan_sale_type', value: editedSaleType }
        });
        setIsEditingSaleType(false);
    };

    const handleCancelEditSaleType = () => setIsEditingSaleType(false);

    // Wrapper function for GigaLanCommissionInputs
    const handleGigaLanOldMrcChange = (key: string, value: number | null) => {
        // This wrapper calls dispatch
        dispatch({
            type: 'UPDATE_TRANSACTION_FIELD',
            payload: { key, value }
        });
    };

    // --- 5. Derived Values (read from draftState) ---
    const confirmedUnidad = liveEdits?.unidadNegocio ?? tx.unidadNegocio;
    const confirmedRegion = liveEdits?.gigalan_region ?? tx.gigalan_region;
    const confirmedSaleType = liveEdits?.gigalan_sale_type ?? tx.gigalan_sale_type;

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
                            // 6. onClick now reads from draftState to populate local state
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
                                <Input type="number" value={editedPlazo || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedPlazo(e.target.value)} className="h-9 w-24 text-sm p-2 border-input ring-ring focus-visible:ring-1 bg-white" min="1" step="1" />
                                <button onClick={handleEditPlazoSubmit} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditCheckIcon /></button>
                                <button onClick={handleCancelEditPlazo} className="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"><EditXIcon /></button>
                            </div>
                        ) : (
                            // 6. onClick now reads from draftState to populate local state
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
                                    // 6. onClick now reads from draftState to populate local state
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
                                    // 6. onClick now reads from draftState to populate local state
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
                        {/* --- END EDITABLE TYPE OF SALE --- */}

                        {/* --- GigaLan PREVIOUS MONTHLY CHARGE Input --- */}
                        {canEdit && confirmedSaleType === 'EXISTENTE' && (
                            <div className="min-h-[60px]">
                                <GigaLanCommissionInputs
                                    inputs={{ ...gigalanInputs, gigalan_sale_type: confirmedSaleType }}
                                    onInputChange={handleGigaLanOldMrcChange} // <-- Use the wrapper
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
    );
}
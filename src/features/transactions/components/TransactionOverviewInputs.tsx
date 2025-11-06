// src/features/transactions/components/TransactionOverviewInputs.tsx

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
import { InlineEditWrapper } from './InlineEditWrapper'; 


interface TransactionOverviewInputsProps {
    isFinanceView: boolean;
}

// Local utility to format value and append currency for display mode
const formatCurrencyDisplay = (value: number | string | null | undefined, currency: string | null | undefined = 'PEN'): string => {
    const formattedValue = formatCurrency(value);
    
    // Only add the currency if the value is not "-"
    if (formattedValue === '-') {
        return formattedValue;
    }
    
    return `${formattedValue} ${currency || 'PEN'}`;
};

// --- Custom Renderer Components for InlineEditWrapper ---

// Custom Rendering Component for Select fields (Unidad, Region, Sale Type)
interface SelectInputProps {
    options: string[];
    valueKey: string;
}
const SelectInput: React.FC<SelectInputProps & { 
    localValue: string | number | null; 
    setLocalValue: React.Dispatch<React.SetStateAction<any>>;
    onConfirm: () => void;
}> = ({ 
    options, 
    valueKey, 
    localValue, 
    setLocalValue,
}) => (
    <Select value={localValue as string || ''} onValueChange={setLocalValue}>
        <SelectTrigger className="text-sm h-9 bg-white w-40"> {/* <-- ADD w-40 HERE */}
            <SelectValue placeholder={`Selecciona ${valueKey}...`} />
        </SelectTrigger>
        <SelectContent>
            {options.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
        </SelectContent>
    </Select>
);

// Custom Rendering Component for Number Input fields (Plazo)
const NumberInput: React.FC<{ 
    localValue: string | number | null; 
    setLocalValue: React.Dispatch<React.SetStateAction<any>>;
    onConfirm: () => void; 
}> = ({ localValue, setLocalValue, onConfirm }) => (
    <Input 
        type="number" 
        value={localValue || ''} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalValue(e.target.value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && onConfirm()}
        className="h-9 w-24 text-sm p-2 border-input ring-ring focus-visible:ring-1 bg-white" 
        min="1" 
        step="1" 
        autoFocus
    />
);

// Custom Rendering Component for Currency Input fields (MRC/NRC)
const CurrencyInput: React.FC<{ 
    localValue: string | number | null; 
    setLocalValue: React.Dispatch<React.SetStateAction<any>>;
    localCurrency: string | null;
    setLocalCurrency: React.Dispatch<React.SetStateAction<string | null>>;
    onConfirm: () => void; 
}> = ({ localValue, setLocalValue, localCurrency, setLocalCurrency, onConfirm }) => (
    <>
        {/* Input for Value */}
        <Input 
            type="number" 
            value={localValue ?? ''} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalValue(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && onConfirm()}
            className="h-9 w-24 text-sm p-2 border-input ring-ring focus-visible:ring-1 bg-white" 
            min="0" 
            step="0.01" 
            autoFocus
        />
        
        {/* Select for Currency */}
        <div className="w-20">
            <Select 
                value={localCurrency || ''} 
                onValueChange={(value) => setLocalCurrency(value)}
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
    </>
);

// Custom Rendering Component for Boolean (SI/NO) fields
const BooleanSelectInput: React.FC<{
    localValue: boolean | null | undefined;
    setLocalValue: React.Dispatch<React.SetStateAction<any>>;
    onConfirm: () => void;
}> = ({ localValue, setLocalValue }) => (
    <Select
        // We convert the boolean to a string for the Select component
        value={localValue === true ? "true" : "false"}
        onValueChange={(value) => {
            // Convert the string back to a boolean for our state
            setLocalValue(value === "true");
        }}
    >
        <SelectTrigger className="text-sm h-9 bg-white w-24">
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="true">SI</SelectItem>
            <SelectItem value="false">NO</SelectItem>
        </SelectContent>
    </Select>
);
// --- END of new component ---


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

    // Helper for dispatching updates to liveEdits (REMAINS THE SAME)
    const onValueChange = (key: string, newValue: string | number | null) => {
        dispatch({
            type: 'UPDATE_TRANSACTION_FIELD',
            payload: { key, value: newValue }
        });
    }

    const tx = baseTransaction.transactions;
    const kpiData = liveKpis || tx;
    const gigalanInputs = liveEdits;

    // --- NEW Confirmed Values (read from liveEdits or baseTx) ---
    const confirmedPlazo = liveEdits?.plazoContrato ?? kpiData.plazoContrato ?? tx.plazoContrato;
    
    const confirmedUnidad = liveEdits?.unidadNegocio ?? tx.unidadNegocio;
    const confirmedRegion = liveEdits?.gigalan_region ?? tx.gigalan_region;
    const confirmedSaleType = liveEdits?.gigalan_sale_type ?? tx.gigalan_sale_type;

    const confirmedMrcValue = liveEdits?.MRC ?? kpiData.MRC ?? tx.MRC;
    const confirmedMrcCurrency = liveEdits?.mrc_currency ?? kpiData.mrc_currency ?? tx.mrc_currency ?? 'PEN';
    const confirmedNrcValue = liveEdits?.NRC ?? kpiData.NRC ?? tx.NRC;
    const confirmedNrcCurrency = liveEdits?.nrc_currency ?? kpiData.nrc_currency ?? tx.nrc_currency ?? 'PEN';
    const confirmedAplicaCartaFianza = liveEdits?.aplicaCartaFianza ?? tx.aplicaCartaFianza;
    
    // Helper for static display blocks (RUC/DNI, Nombre Cliente, Comisión)
    const StaticField = ({ label, value, currency }: { label: string, value: React.ReactNode, currency?: string }) => (
        <div className="min-h-[60px]">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <div className="font-semibold text-gray-900">{value} {currency}</div>
        </div>
    );
    
    // --- Handlers now consolidated to simple onConfirm callbacks ---
    
    const handleConfirmPlazo = (finalValue: number | string | null) => {
        const newPlazo = parseInt(finalValue as string, 10);
        if (!isNaN(newPlazo) && newPlazo > 0 && Number.isInteger(newPlazo)) {
            // FIX: Use ATOMIC dispatch for PlazoContrato
            dispatch({
                type: 'UPDATE_MULTIPLE_TRANSACTION_FIELDS',
                payload: { plazoContrato: newPlazo }
            });
        } else {
            alert("Please enter a valid whole number greater than 0 for Plazo Contrato.");
        }
    };
    
    const handleConfirmUnidad = (finalValue: string | number | null) => {
        if (!finalValue || !UNIDADES_NEGOCIO.includes(finalValue as string)) {
            alert("Selección obligatoria: Por favor, selecciona una Unidad de Negocio válida.");
            return;
        }
        onValueChange('unidadNegocio', finalValue as string);
    };
    
    const handleConfirmRegion = (finalValue: string | number | null) => {
        if (!finalValue || !REGIONS.includes(finalValue as string)) {
            alert("Selección obligatoria: Por favor, selecciona una Región válida.");
            return;
        }
        onValueChange('gigalan_region', finalValue as string);
    };
    
    const handleConfirmSaleType = (finalValue: string | number | null) => {
        if (!finalValue || !SALE_TYPES.includes(finalValue as any)) {
            alert("Selección obligatoria: Por favor, selecciona un Tipo de Venta válido.");
            return;
        }
        onValueChange('gigalan_sale_type', finalValue as "NUEVO" | "EXISTENTE");
    };

    // 1. FIX: Make the second parameter optional to match InlineEditWrapper's definition
    const handleConfirmMrc = (finalValue: number | string | null, finalCurrency?: string | null) => {
        const newValue = parseFloat(finalValue as string); 
        const finalCurrencySafe = finalCurrency || confirmedMrcCurrency; 

        if (!isNaN(newValue) && newValue >= 0) {
            // FIX: Use single, ATOMIC dispatch for MRC/Currency pair
            dispatch({ 
                type: 'UPDATE_MULTIPLE_TRANSACTION_FIELDS', 
                payload: {
                    MRC: newValue,
                    mrc_currency: finalCurrencySafe
                }
            });
        } else {
            alert("Please enter a valid non-negative number for MRC.");
        }
    };
    
    const handleConfirmNrc = (finalValue: number | string | null, finalCurrency?: string | null) => {
        const newValue = parseFloat(finalValue as string);
        const finalCurrencySafe = finalCurrency || confirmedNrcCurrency; 

        if (!isNaN(newValue) && newValue >= 0) {
            // FIX: Use single, ATOMIC dispatch for NRC/Currency pair
            dispatch({ 
                type: 'UPDATE_MULTIPLE_TRANSACTION_FIELDS', 
                payload: {
                    NRC: newValue,
                    nrc_currency: finalCurrencySafe
                }
            });
        } else {
            alert("Please enter a valid non-negative number for NRC.");
        }
    };

    const handleConfirmCartaFianza = (finalValue: boolean | null | undefined) => {
        // Use single, ATOMIC dispatch
        dispatch({
            type: 'UPDATE_MULTIPLE_TRANSACTION_FIELDS',
            payload: { aplicaCartaFianza: finalValue === true } // Ensure it's a boolean
        });
    };

    // Wrapper function for GigaLanCommissionInputs
    const handleGigaLanOldMrcChange = (key: string, value: number | null) => {
        onValueChange(key, value);
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-start mb-3"> 
                <h3 className="font-semibold text-gray-800 text-lg">Transaction Overview</h3>
                
                {/* --- Master Variables (Horizontal) --- */}
                <div className="flex space-x-4 text-xs text-gray-500">
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
                    {/* --- ADD THESE TWO <p> BLOCKS --- */}
                    <p>
                        Tasa Carta Fianza:
                        <span className="font-semibold text-gray-700 ml-1">
                            {formatCurrency((tx.tasaCartaFianza || 0) * 100, { decimals: 2 })}%
                        </span>
                    </p>
                    <p>
                        Costo Carta Fianza:
                        <span className="font-semibold text-gray-700 ml-1">
                            {formatCurrency(kpiData.costoCartaFianza)}
                        </span>
                    </p>
                    {/* --- END OF ADDED BLOCK --- */}
                </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 items-start">
                
                {/* 1. UNIDAD DE NEGOCIO (Using InlineEditWrapper) */}
                <div className="min-h-[60px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unidad de Negocio</p>
                    <InlineEditWrapper<string | null>
                        fieldKey="Unidad de Negocio"
                        currentValue={confirmedUnidad}
                        canEdit={canEdit}
                        renderDisplay={(value) => value || "Selecciona obligatorio"}
                        renderEdit={(localValue, setLocalValue, _, __, onConfirm) => (
                            <SelectInput 
                                options={UNIDADES_NEGOCIO} 
                                valueKey="Unidad de Negocio" 
                                localValue={localValue} 
                                setLocalValue={setLocalValue} 
                                onConfirm={onConfirm}
                            />
                        )}
                        onConfirm={handleConfirmUnidad}
                    />
                </div>
                {/* 2. RUC/DNI (Static Field) */}
                <StaticField label="RUC/DNI" value={tx.companyID || '-'} />

                {/* 3. NOMBRE CLIENTE (Static Field) */}
                <StaticField label="Nombre Cliente" value={tx.clientName} />
                
                {/* 4. PLAZO DE CONTRATO (Using InlineEditWrapper) */}
                <div className="min-h-[60px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plazo de Contrato</p>
                    <InlineEditWrapper<number | null>
                        fieldKey="Plazo de Contrato"
                        currentValue={confirmedPlazo}
                        canEdit={canEdit}
                        initialValueTransformer={(value) => value ?? 0}
                        renderDisplay={(value) => `${value ?? '-'} meses`}
                        renderEdit={(localValue, setLocalValue, _, __, onConfirm) => (
                            <NumberInput 
                                localValue={localValue} 
                                setLocalValue={setLocalValue} 
                                onConfirm={onConfirm}
                            />
                        )}
                        onConfirm={handleConfirmPlazo}
                    />
                </div>

                {/* 5. MRC (Using InlineEditWrapper for dual input) */}
                <div className="min-h-[60px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">MRC (Recurrente Mensual)</p>
                    <InlineEditWrapper<number | null>
                        fieldKey="MRC"
                        currentValue={confirmedMrcValue}
                        currentCurrency={confirmedMrcCurrency}
                        canEdit={canEdit}
                        initialValueTransformer={(value) => value ?? 0}
                        initialCurrencyTransformer={(c) => c ?? 'PEN'}
                        renderDisplay={formatCurrencyDisplay}
                        renderEdit={(localValue, setLocalValue, localCurrency, setLocalCurrency, onConfirm) => (
                            <CurrencyInput 
                                localValue={localValue} 
                                setLocalValue={setLocalValue} 
                                localCurrency={localCurrency}
                                setLocalCurrency={setLocalCurrency}
                                onConfirm={onConfirm}
                            />
                        )}
                        onConfirm={handleConfirmMrc}
                    />
                </div>
                
                {/* 6. NRC (Using InlineEditWrapper for dual input) */}
                <div className="min-h-[60px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">NRC (Pago Único)</p>
                    <InlineEditWrapper<number | null>
                        fieldKey="NRC"
                        currentValue={confirmedNrcValue}
                        currentCurrency={confirmedNrcCurrency}
                        canEdit={canEdit}
                        initialValueTransformer={(value) => value ?? 0}
                        initialCurrencyTransformer={(c) => c ?? 'PEN'}
                        renderDisplay={formatCurrencyDisplay}
                        renderEdit={(localValue, setLocalValue, localCurrency, setLocalCurrency, onConfirm) => (
                            <CurrencyInput 
                                localValue={localValue} 
                                setLocalValue={setLocalValue} 
                                localCurrency={localCurrency}
                                setLocalCurrency={setLocalCurrency}
                                onConfirm={onConfirm}
                            />
                        )}
                        onConfirm={handleConfirmNrc}
                    />
                </div>
                {/* 7. COMISION DE VENTAS (Static Field) */}
                {((): React.ReactNode => {
                    const formattedValue = formatCurrency(kpiData.comisiones);
                    const displayCurrency = formattedValue === '-' ? undefined : "PEN";
                    return (
                        <StaticField 
                            label="Comisión de Ventas" 
                            value={formattedValue} 
                            currency={displayCurrency} 
                        />
                    );
                })()}

                {/* 8. APLICA CARTA FIANZA (Using InlineEditWrapper) */}
                <div className="min-h-[60px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Aplica Carta Fianza</p>
                    <InlineEditWrapper<boolean | null>
                        fieldKey="Aplica Carta Fianza"
                        currentValue={confirmedAplicaCartaFianza || false}
                        canEdit={canEdit}
                        initialValueTransformer={(value) => value === true}
                        renderDisplay={(value) => (value === true ? "SI" : "NO")}
                        renderEdit={(localValue, setLocalValue, _, __, onConfirm) => (
                            <BooleanSelectInput
                                localValue={localValue}
                                setLocalValue={setLocalValue}
                                onConfirm={onConfirm}
                            />
                        )}
                        onConfirm={handleConfirmCartaFianza}
                    />
                </div>

                {/* --- GIGALAN FIELDS --- */}
                {confirmedUnidad === 'GIGALAN' && (
                    <>
                        {/* --- EDITABLE REGION (8) --- */}
                        <div className="min-h-[60px]">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Región</p>
                            <InlineEditWrapper<string | null>
                                fieldKey="Región"
                                currentValue={confirmedRegion}
                                canEdit={canEdit}
                                renderDisplay={(value) => value || "Selecciona obligatorio"}
                                renderEdit={(localValue, setLocalValue, _, __, onConfirm) => (
                                    <SelectInput 
                                        options={REGIONS} 
                                        valueKey="Región" 
                                        localValue={localValue} 
                                        setLocalValue={setLocalValue} 
                                        onConfirm={onConfirm}
                                    />
                                )}
                                onConfirm={handleConfirmRegion}
                            />
                        </div>
                        {/* --- EDITABLE TYPE OF SALE --- */}
                        <div className="min-h-[60px]">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tipo de Venta</p>
                            <InlineEditWrapper<string | null>
                                fieldKey="Tipo de Venta"
                                currentValue={confirmedSaleType}
                                canEdit={canEdit}
                                renderDisplay={(value) => value || "Selecciona obligatorio"}
                                renderEdit={(localValue, setLocalValue, _, __, onConfirm) => (
                                    <SelectInput 
                                        options={SALE_TYPES} 
                                        valueKey="Tipo de Venta" 
                                        localValue={localValue} 
                                        setLocalValue={setLocalValue} 
                                        onConfirm={onConfirm}
                                    />
                                )}
                                onConfirm={handleConfirmSaleType}
                            />
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
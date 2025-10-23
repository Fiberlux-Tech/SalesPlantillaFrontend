import React, { useState } from 'react';
import KpiCard from './KpiCard';
import StatusBadge from './StatusBadge';
import CostBreakdownRow from './CostBreakdownRow';
import { CloseIcon, WarningIcon, CheckCircleIcon } from './Icons';
import FixedCostsTable from './FixedCostsTable';
import RecurringServicesTable from './RecurringServicesTable';
import { GigaLanCommissionInputs } from '../../features/sales/components/GigaLanCommissionInputs';

// Import the new footer components
import { SalesPreviewFooter } from '../../features/sales/components/SalesPreviewFooter';
import { FinancePreviewFooter } from '../../features/finance/components/FinancePreviewFooter';


function DataPreviewModal({ isOpen, onClose, onConfirm, data, isFinanceView = false, onApprove, onReject, onCalculateCommission, gigalanInputs, onGigalanInputChange }) {
    const formatCurrency = (value) => {
        if (typeof value !== 'number' || value === null || value === 0) return '-';
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };  

    const [openSections, setOpenSections] = useState({});

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!isOpen || !data?.transactions) return null;

    const tx = data.transactions;
    
    // NEW: Check if the transaction is pending (used for UI state and sales view inputs)
    const isPending = tx.ApprovalStatus === 'PENDING';

    // MODIFIED: Only returns Gigalan overview fields if it's the Finance View.
    const getGigalanOverview = () => {
        if (tx.unidadNegocio !== 'GIGALAN') return [];
        
        // This is the check that hides these fields from the Sales view
        if (!isFinanceView) return [];
        
        // This displays the SAVED values from the transaction (tx) object
        return [
            { label: 'REGIÓN', value: tx.gigalan_region || '-' },
            { label: 'TIPO', value: tx.gigalan_sale_type || '-' },
            { 
                label: 'MRC PREVIO', 
                // Display the saved amount if available
                value: (tx.gigalan_old_mrc) 
                    ? formatCurrency(tx.gigalan_old_mrc) 
                    : '-'
            },
        ];
    }

    // Base data
    const baseOverviewData = [
        { label: 'Unidad de Negocio', value: tx.unidadNegocio },
        { label: 'Transaction ID', value: tx.transactionID || '-' },
        { label: 'Nombre Cliente', value: tx.clientName },
        { label: 'RUC/DNI', value: tx.companyID },
        { label: 'Order ID', value: tx.orderID },
        { label: 'Tipo de Cambio', value: tx.tipoCambio },
        { label: 'Plazo de Contrato', value: `${tx.plazoContrato} meses` },
        { label: 'Status', value: <StatusBadge status={tx.ApprovalStatus} /> },
    ];
    
    // CRITICAL FIX: Merges base data with Gigalan-specific data, which is now filtered by isFinanceView
    const overviewData = [...baseOverviewData, ...getGigalanOverview()];
    // END CRITICAL FIX

    const totalFixedCosts = data.fixed_costs.reduce((acc, item) => acc + (item.total || 0), 0);
    const totalRecurringCosts = data.recurring_services.reduce((acc, item) => acc + (item.egreso || 0), 0);
    const totalRecurringIncome = data.recurring_services.reduce((acc, item) => acc + (item.ingreso || 0), 0);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full">
                <div className="flex justify-between items-center p-5 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Preview of Transaction Data</h2>
                        <p className="text-sm text-gray-500">File: {data.fileName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                </div>
                <div className="p-6 bg-gray-50 max-h-[75vh] overflow-y-auto">
                    
                    {/* NEW: Display message if transaction is approved/rejected in Sales View */}
                    {!isFinanceView && !isPending && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6 flex">
                            <WarningIcon />
                            <div className="ml-3">
                                <p className="font-semibold text-red-800">Transaction Status: {tx.ApprovalStatus}</p>
                                <p className="text-sm text-red-700">Modification of key inputs is **not allowed** once a transaction has been reviewed.</p>
                            </div>
                        </div>
                    )}

                    {/* EXISTING: Warning for Sales View when PENDING */}
                    {!isFinanceView && isPending && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 flex">
                            <WarningIcon />
                            <div className="ml-3">
                                <p className="font-semibold text-yellow-800">Por favor revisar la data cargada de manera minuciosa</p>
                                <p className="text-sm text-yellow-700">Asegurate que toda la informacion sea correcta antes de confirmarla.</p>
                            </div>
                        </div>
                    )}


                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Transaction Overview</h3>
                        <div className="bg-gray-100 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
                            {overviewData.map(item => (<div key={item.label}><p className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</p><p className="font-semibold text-gray-900 mt-1">{item.value}</p></div>))}
                            
                            {/* CORRECT LOCATION: GigaLan Commission Inputs for Sales View (ONLY if PENDING) */}
                            {/* This is the key change to hide the inputs once status is immutable */}
                            {!isFinanceView && tx.unidadNegocio === 'GIGALAN' && isPending && (
                                <div className="col-span-full pt-4 mt-4 border-t border-gray-200">
                                    <GigaLanCommissionInputs 
                                        inputs={gigalanInputs} 
                                        onInputChange={onGigalanInputChange} 
                                    />
                                </div>
                            )}
                            {/* END CORRECT LOCATION */}
                        </div>
                        
                    </div>
                    
                    {/* The mb-6 on the div above replaces the margin for the input component */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Detalle de Servicios</h3>
                        <div className="space-y-3">
                            <CostBreakdownRow
                                title="Servicios Recurrentes"
                                items={data.recurring_services.length}
                                total={totalRecurringCosts}
                                isOpen={openSections['recurringCosts']}
                                onToggle={() => toggleSection('recurringCosts')}
                            customTotalsNode={
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
                            }
                            >
                                <RecurringServicesTable data={data.recurring_services} />
                            </CostBreakdownRow>
                            <CostBreakdownRow
                                title="Inversión (Costos Fijos)"
                                items={data.fixed_costs.length}
                                total={totalFixedCosts}
                                isOpen={openSections['fixedCosts']}
                                onToggle={() => toggleSection('fixedCosts')}
                                customTotalsNode={ // <-- ADD this prop
                                    <div>
                                        {/* Add text-red-600 here */}
                                        <p className="font-semibold text-red-600 text-right">{formatCurrency(totalFixedCosts)}</p>
                                        <p className="text-xs text-gray-500 text-right">Total</p>
                                    </div>
                                }
                            >
                                <FixedCostsTable data={data.fixed_costs} />
                            </CostBreakdownRow>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Key Performance Indicators</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <KpiCard title="MRC (Recurrente Mensual)" value={formatCurrency(tx.MRC)} subtext="Métrica Clave" />
                            <KpiCard title="NRC (Pago Único)" value={formatCurrency(tx.NRC)} />
                            <KpiCard title="VAN" value={formatCurrency(tx.VAN)} />
                            <KpiCard title="TIR" value={`${(tx.TIR * 100)?.toFixed(2)}%`} />
                            <KpiCard title="Periodo de Payback" value={`${tx.payback} months`} />
                            <KpiCard title="Ingresos Totales" value={formatCurrency(tx.totalRevenue)} />
                            <KpiCard title="Gastos Totales" value={formatCurrency(tx.totalExpense)} isNegative={true} />
                            <KpiCard title="Utilidad Bruta" value={formatCurrency(tx.grossMargin)} />
                            <KpiCard title="Margen Bruto (%)" value={`${(tx.grossMarginRatio * 100)?.toFixed(2)}%`} />
                            <KpiCard title="Comisión de Ventas" value={formatCurrency(tx.comisiones)} />
                            <KpiCard title="Costo Instalación" value={formatCurrency(tx.costoInstalacion)} />
                            <KpiCard title="Costo Instalación (%)" value={`${(tx.costoInstalacionRatio * 100)?.toFixed(2)}%`} />
                        </div>
                    </div>
                </div>

                {/* --- FOOTER INTEGRATION --- */}
                {isFinanceView ? (
                    <FinancePreviewFooter
                        tx={tx}
                        onApprove={onApprove}
                        onReject={onReject}
                        onCalculateCommission={onCalculateCommission}
                    />
                ) : (
                    <SalesPreviewFooter 
                        onConfirm={onConfirm} 
                        onClose={onClose} 
                    />
                )}
            </div>
        </div>
    );
}

export default DataPreviewModal;
import React, { useState } from 'react';
import KpiCard from './KpiCard';
import StatusBadge from './StatusBadge';
import CostBreakdownRow from './CostBreakdownRow';
import { CloseIcon, WarningIcon, CheckCircleIcon } from './Icons';
import FixedCostsTable from './FixedCostsTable';
import RecurringServicesTable from './RecurringServicesTable';

function DataPreviewModal({ isOpen, onClose, onConfirm, data, isFinanceView = false, onApprove, onReject }) {
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!isOpen || !data?.transactions) return null;

    const tx = data.transactions;
    const overviewData = [
        { label: 'Business Unit', value: tx.unidadNegocio },
        { label: 'Transaction ID', value: tx.transactionID || 'N/A' },
        { label: 'Client Name', value: tx.clientName },
        { label: 'Company ID', value: tx.companyID },
        { label: 'Order ID', value: tx.orderID },
        { label: 'Exchange Rate', value: tx.tipoCambio },
        { label: 'Contract Lifetime', value: `${tx.plazoContrato} months` },
        { label: 'Status', value: <StatusBadge status={tx.ApprovalStatus} /> },
    ];

    const totalFixedCosts = data.fixed_costs.reduce((acc, item) => acc + (item.total || 0), 0);
    const totalRecurringCosts = data.recurring_services.reduce((acc, item) => acc + (item.egreso || 0), 0);

    const handleApproveClick = () => {
        if (window.confirm('Are you sure you want to approve this transaction?')) {
            onApprove(tx.id);
        }
    };

    const handleRejectClick = () => {
        if (window.confirm('Are you sure you want to reject this transaction?')) {
            onReject(tx.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
                <div className="flex justify-between items-center p-5 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Review Transaction Data</h2>
                        <p className="text-sm text-gray-500">File: {data.fileName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                </div>
                <div className="p-6 bg-gray-50 max-h-[75vh] overflow-y-auto">
                    {!isFinanceView && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 flex">
                            <WarningIcon />
                            <div className="ml-3">
                                <p className="font-semibold text-yellow-800">Please review all data carefully</p>
                                <p className="text-sm text-yellow-700">Ensure all information is correct before submitting.</p>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Transaction Overview</h3>
                        <div className="bg-gray-100 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
                            {overviewData.map(item => (<div key={item.label}><p className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</p><p className="font-semibold text-gray-900 mt-1">{item.value}</p></div>))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Key Performance Indicators</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <KpiCard title="MRC (Monthly Recurring)" value={`$${tx.MRC?.toLocaleString()}`} subtext="Key Revenue Metric" />
                            <KpiCard title="NRC (One-time Payment)" value={`$${tx.NRC?.toLocaleString()}`} />
                            <KpiCard title="NPV (VAN)" value={`$${tx.VAN?.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                            <KpiCard title="IRR (TIR)" value={`${(tx.TIR * 100)?.toFixed(2)}%`} />
                            <KpiCard title="Payback Period" value={`${tx.payback} months`} />
                            <KpiCard title="Total Revenue" value={`$${tx.totalRevenue?.toLocaleString()}`} />
                            <KpiCard title="Total Expenses" value={`$${tx.totalExpense?.toLocaleString()}`} isNegative={true} />
                            <KpiCard title="Gross Margin" value={`$${tx.grossMargin?.toLocaleString()}`} />
                            <KpiCard title="Gross Margin %" value={`${(tx.grossMarginRatio * 100)?.toFixed(2)}%`} />
                            <KpiCard title="Sales Commission" value={`$${tx.comisiones?.toLocaleString()}`} />
                            <KpiCard title="Installation Cost" value={`$${tx.costoInstalacion?.toLocaleString()}`} />
                            <KpiCard title="Installation Cost %" value={`${(tx.costoInstalacionRatio * 100)?.toFixed(2)}%`} />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3 text-lg">Cost Breakdown</h3>
                        <div className="space-y-3">
                            <CostBreakdownRow
                                title="Fixed Costs"
                                items={data.fixed_costs.length}
                                total={totalFixedCosts}
                                isOpen={openSections['fixedCosts']}
                                onToggle={() => toggleSection('fixedCosts')}
                            >
                                <FixedCostsTable data={data.fixed_costs} />
                            </CostBreakdownRow>
                            <CostBreakdownRow
                                title="Total Recurring Costs"
                                items={data.recurring_services.length}
                                total={totalRecurringCosts}
                                isOpen={openSections['recurringCosts']}
                                onToggle={() => toggleSection('recurringCosts')}
                            >
                                <RecurringServicesTable data={data.recurring_services} />
                            </CostBreakdownRow>
                        </div>
                    </div>
                </div>

                {/* --- MODIFIED FOOTER --- */}
                <div className="flex justify-end items-center p-5 border-t bg-white space-x-3">
                    {isFinanceView ? (
                        <>
                            <button onClick={handleRejectClick} className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                                Reject
                            </button>
                            <button onClick={handleApproveClick} className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                                Approve
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex-grow flex items-center text-sm text-gray-600">
                                <CheckCircleIcon />
                                <span className="ml-2">All data extracted from Excel file</span>
                            </div>
                            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={onConfirm} className="px-5 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">Confirm & Submit</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DataPreviewModal;
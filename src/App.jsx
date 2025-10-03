import React, { useState, useMemo, useEffect, useRef } from 'react';

// --- SVG Icons ---
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
      <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
const TrendUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);
const DollarSignIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
      <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);
const FileTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const FileUploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const ChevronUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

// --- Sub-Components ---

function StatsCard({ title, value, icon, iconBgColor }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}>{icon}</div>
            <div className="ml-4">
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
    const statusClasses = {
        PENDING: "bg-yellow-100 text-yellow-800",
        APPROVED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
}

function FileUploadModal({ isOpen, onClose, onNext }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleDropzoneClick = () => {
        fileInputRef.current.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Upload Deal Proposal</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />
                <div onClick={handleDropzoneClick} className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center mb-6 cursor-pointer">
                    <div className="flex justify-center mb-4"><FileUploadIcon /></div>
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    {selectedFile && <p className="text-sm text-green-600 mt-2 font-semibold">{selectedFile.name}</p>}
                    <p className="text-sm text-gray-400 mt-1">Excel files only (.xlsx, .xls)</p>
                </div>
                
                <div className="flex justify-end space-x-4 mb-6">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={() => onNext(selectedFile)} disabled={!selectedFile} className="px-6 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed">Next</button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Upload Instructions:</h3>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                        <li>Ensure your Excel file follows the approved template</li>
                        <li>All required fields must be filled out</li>
                        <li>You'll review the data before final submission</li>
                        <li>You'll receive an email once reviewed</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

const KpiCard = ({ title, value, subtext, isNegative = false }) => {
    const displayValue = value === null || value === undefined ? 'N/A' : value;
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${isNegative ? 'text-red-600' : 'text-gray-800'}`}>{displayValue}</p>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
    );
}

const CostBreakdownRow = ({ title, items, total }) => (
    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer">
        <div className="flex items-center">
            <ChevronRightIcon />
            <div className="ml-3">
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{items} items</p>
            </div>
        </div>
        <div>
            <p className="font-semibold text-gray-800">{`$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
            <p className="text-xs text-gray-500 text-right">Total</p>
        </div>
    </div>
);

function DataPreviewModal({ isOpen, onClose, onConfirm, data }) {
    if (!isOpen || !data.transactions) return null;

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
    const totalRecurringCosts = data.recurring_services.reduce((acc, item) => acc + (item.egreso || 0), 0) * tx.plazoContrato;

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
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 flex">
                        <WarningIcon />
                        <div className="ml-3">
                            <p className="font-semibold text-yellow-800">Please review all data carefully</p>
                            <p className="text-sm text-yellow-700">Ensure all information is correct before submitting.</p>
                        </div>
                    </div>

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
                            <CostBreakdownRow title="Fixed Costs" items={data.fixed_costs.length} total={totalFixedCosts} />
                            <CostBreakdownRow title="Total Recurring Costs" items={data.recurring_services.length} total={totalRecurringCosts} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center p-5 border-t bg-white">
                    <div className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon />
                        <span className="ml-2">All data extracted from Excel file</span>
                    </div>
                    <div className="space-x-3">
                        <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button onClick={onConfirm} className="px-5 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">Confirm & Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DatePicker({ selectedDate, onSelectDate, onClear, onSelectToday }) {
    const [displayDate, setDisplayDate] = useState(selectedDate || new Date());
    const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    const changeMonth = (delta) => {
        setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + delta, 1));
    };
    
    const firstDayOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const startingDay = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate();
    const calendarDays = Array.from({ length: startingDay }, (_, i) => <div key={`empty-${i}`}></div>);
    
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(displayDate.getFullYear(), displayDate.getMonth(), i);
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
        calendarDays.push(
            <div key={i} className={`flex items-center justify-center h-8 w-8 rounded-full cursor-pointer ${isSelected ? 'bg-black text-white' : 'hover:bg-gray-100'}`} onClick={() => onSelectDate(date)}>
                {i}
            </div>
        );
    }

    return (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronUpIcon /></button>
                <div className="font-semibold text-gray-800">{displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronDownIcon /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                {days.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm">{calendarDays}</div>
             <div className="flex justify-between items-center mt-4 pt-2 border-t">
                <button onClick={onClear} className="text-sm text-blue-600 hover:underline">Clear</button>
                <button onClick={onSelectToday} className="text-sm text-blue-600 hover:underline">Today</button>
            </div>
        </div>
    );
}

// --- Main App Component ---

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const datePickerRef = useRef(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [apiError, setApiError] = useState(null);

  const stats = useMemo(() => {
    const pendingApprovals = transactions.filter(t => t.status === 'PENDING').length;
    const totalValue = transactions.reduce((acc, t) => acc + t.totalValue, 0);
    const avgIRR = 24.5;
    const avgPayback = 20;
    return {
      pendingApprovals,
      totalValue: `$${(totalValue / 1000000).toFixed(2)}M`,
      avgIRR: `${avgIRR}%`,
      avgPayback: `${avgPayback} mo`,
    };
  }, [transactions]);
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        const clientMatch = t.client.toLowerCase().includes(filter.toLowerCase());
        if (!selectedDate) return clientMatch;
        const transactionDate = new Date(t.submissionDate + 'T00:00:00');
        return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
    });
  }, [transactions, filter, selectedDate]);
  
  useEffect(() => {
    function handleClickOutside(event) {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setIsDatePickerOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [datePickerRef]);

  const handleClearDate = () => { setSelectedDate(null); setIsDatePickerOpen(false); };
  const handleSelectToday = () => { setSelectedDate(new Date()); setIsDatePickerOpen(false); };

  const handleUploadNext = async (file) => {
    if (!file) return;
    setApiError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://127.0.0.1:5000/api/process-excel', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            const dataWithFilename = { ...result.data, fileName: file.name };
            setUploadedData(dataWithFilename);
            setIsModalOpen(false);
            setIsPreviewModalOpen(true);
        } else {
            setApiError(result.error || 'An unknown error occurred.');
            setIsModalOpen(false); // Or keep it open to show the error
        }
    } catch (error) {
        setApiError('Failed to connect to the server. Please ensure the backend is running.');
        setIsModalOpen(false);
    }
  };

  const handleConfirmSubmission = () => {
      // This will be connected to the "submit" API endpoint later.
      // For now, it just adds the data to the local state for demonstration.
      if(uploadedData && uploadedData.transactions) {
          const newTxData = uploadedData.transactions;
          const newTransactionForTable = {
            id: newTxData.orderID || `TXN-${Date.now()}`,
            client: newTxData.clientName,
            totalValue: newTxData.totalRevenue,
            totalExpenses: newTxData.totalExpense,
            submissionDate: new Date().toISOString().split('T')[0],
            npv: newTxData.VAN,
            payback: newTxData.payback,
            status: newTxData.ApprovalStatus,
          };
          setTransactions([newTransactionForTable, ...transactions]);
      }
      setIsPreviewModalOpen(false);
      setUploadedData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="container mx-auto p-8">
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Deal Approval Portal</h1>
            <p className="text-gray-500 mt-1">Submit and track your deal proposals</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"><ExportIcon /><span>Export</span></button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg shadow-sm hover:bg-gray-800"><UploadIcon /><span>Upload File</span></button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Pending Approvals" value={stats.pendingApprovals} icon={<FileTextIcon />} iconBgColor="bg-yellow-100" />
            <StatsCard title="Total Value" value={stats.totalValue} icon={<DollarSignIcon />} iconBgColor="bg-green-100" />
            <StatsCard title="Avg IRR" value={stats.avgIRR} icon={<TrendUpIcon />} iconBgColor="bg-blue-100" />
            <StatsCard title="Avg Payback" value={stats.avgPayback} icon={<ClockIcon />} iconBgColor="bg-purple-100" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="relative w-full max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                    <input type="text" placeholder="Filter by client name..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={filter} onChange={(e) => setFilter(e.target.value)} />
                </div>
                <div className="relative w-full max-w-xs" ref={datePickerRef}>
                    <button onClick={() => setIsDatePickerOpen(!isDatePickerOpen)} className="w-full flex justify-between items-center text-left px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <span className={selectedDate ? 'text-gray-800' : 'text-gray-400'}>{selectedDate ? selectedDate.toLocaleDateString('en-CA') : 'dd/mm/yyyy'}</span>
                        <CalendarIcon />
                    </button>
                    {isDatePickerOpen && <DatePicker selectedDate={selectedDate} onSelectDate={(date) => {setSelectedDate(date); setIsDatePickerOpen(false);}} onClear={handleClearDate} onSelectToday={handleSelectToday} />}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Transaction ID</th>
                            <th scope="col" className="px-6 py-3">Client</th>
                            <th scope="col" className="px-6 py-3">Total Value</th>
                            <th scope="col" className="px-6 py-3">Total Expenses</th>
                            <th scope="col" className="px-6 py-3">Submission Date</th>
                            <th scope="col" className="px-6 py-3">NPV</th>
                            <th scope="col" className="px-6 py-3">Payback</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((tx) => (
                            <tr key={tx.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                                <td className="px-6 py-4 font-medium text-gray-900">{tx.id}</td>
                                <td className="px-6 py-4 font-bold text-gray-900">{tx.client}</td>
                                <td className="px-6 py-4">{`$${tx.totalValue.toLocaleString()}`}</td>
                                <td className="px-6 py-4">{!isNaN(tx.totalExpenses) ? `$${tx.totalExpenses.toLocaleString()}` : 'N/A'}</td>
                                <td className="px-6 py-4">{tx.submissionDate}</td>
                                <td className="px-6 py-4 text-green-600 font-medium">{`$${tx.npv.toLocaleString()}`}</td>
                                <td className="px-6 py-4">{`${tx.payback} months`}</td>
                                <td className="px-6 py-4"><StatusBadge status={tx.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
      {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}
      <FileUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onNext={handleUploadNext} />
      <DataPreviewModal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} onConfirm={handleConfirmSubmission} data={uploadedData} />
    </div>
  );
}
import React, { useState, useMemo, useEffect, useRef } from 'react';

// --- Component Imports ---
import StatsCard from './components/StatsCard';
import StatusBadge from './components/StatusBadge';
import FileUploadModal from './components/FileUploadModal';
import DataPreviewModal from './components/DataPreviewModal';
import DatePicker from './components/DatePicker';

// --- Icon Imports ---
import {
    ClockIcon,
    TrendUpIcon,
    DollarSignIcon,
    FileTextIcon,
    UploadIcon,
    ExportIcon,
    SearchIcon,
    CalendarIcon
} from './components/Icons';

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

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // --- Fetch Transactions from the Backend ---
    const fetchTransactions = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/transactions?page=${currentPage}&per_page=30`);
            const result = await response.json();
            if (result.success) {
                // --- 1. UPDATED DATA MAPPING ---
                const formattedTransactions = result.data.transactions.map(tx => ({
                    id: tx.id, // Use the new unique ID from the backend
                    client: tx.clientName,
                    salesman: tx.salesman,
                    grossMarginRatio: tx.grossMarginRatio,
                    payback: tx.payback,
                    submissionDate: new Date(tx.submissionDate).toISOString().split('T')[0],
                    approvalDate: tx.approvalDate ? new Date(tx.approvalDate).toISOString().split('T')[0] : 'N/A',
                    status: tx.ApprovalStatus,
                }));
                setTransactions(formattedTransactions);
                setTotalPages(result.data.pages);
            } else {
                setApiError(result.error || 'Failed to fetch transactions.');
            }
        } catch (error) {
            setApiError('Failed to connect to the server. Please ensure the backend is running.');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, [currentPage]);

    // This section is for the top stats cards and remains unchanged
    const stats = useMemo(() => {
        const pendingApprovals = transactions.filter(t => t.status === 'PENDING').length;
        // You might want to update these based on the new data, but we'll leave them for now
        const totalValue = transactions.reduce((acc, t) => acc + (t.totalValue || 0), 0);
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

    // File upload and submission logic remains the same
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
                setIsModalOpen(false);
            }
        } catch (error) {
            setApiError('Failed to connect to the server. Please ensure the backend is running.');
            setIsModalOpen(false);
        }
    };

    const handleConfirmSubmission = async () => {
        if (!uploadedData) return;
        setApiError(null);
        try {
            const response = await fetch('http://127.0.0.1:5000/api/submit-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(uploadedData),
            });
            const result = await response.json();
            if (result.success) {
                // Refresh the table by fetching the latest data from the server
                fetchTransactions(); // Use the existing fetch function
                setIsPreviewModalOpen(false);
                setUploadedData(null);
            } else {
                setApiError(result.error || 'An unknown error occurred.');
            }
        } catch (error) {
            setApiError('Failed to connect to the server. Please ensure the backend is running.');
        }
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
                            {isDatePickerOpen && <DatePicker selectedDate={selectedDate} onSelectDate={(date) => { setSelectedDate(date); setIsDatePickerOpen(false); }} onClear={handleClearDate} onSelectToday={handleSelectToday} />}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            {/* --- 2. UPDATED TABLE HEADERS --- */}
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Transaction ID</th>
                                    <th scope="col" className="px-6 py-3">Client</th>
                                    <th scope="col" className="px-6 py-3">Salesman</th>
                                    <th scope="col" className="px-6 py-3">Margin %</th>
                                    <th scope="col" className="px-6 py-3">Payback (Months)</th>
                                    <th scope="col" className="px-6 py-3">Submission Date</th>
                                    <th scope="col" className="px-6 py-3">Approval Date</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan="8" className="text-center py-4">Loading transactions...</td></tr>
                                ) : (
                                    // --- 3. UPDATED TABLE BODY ---
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                                            <td className="px-6 py-4 font-medium text-gray-900">{tx.id}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900">{tx.client}</td>
                                            <td className="px-6 py-4">{tx.salesman}</td>
                                            <td className="px-6 py-4 font-medium text-blue-600">{`${(tx.grossMarginRatio * 100).toFixed(2)}%`}</td>
                                            <td className="px-6 py-4">{tx.payback}</td>
                                            <td className="px-6 py-4">{tx.submissionDate}</td>
                                            <td className="px-6 py-4">{tx.approvalDate}</td>
                                            <td className="px-6 py-4"><StatusBadge status={tx.status} /></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* --- Pagination Controls --- */}
                    <div className="flex justify-between items-center pt-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}
            <FileUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onNext={handleUploadNext} />
            <DataPreviewModal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} onConfirm={handleConfirmSubmission} data={uploadedData} />
        </div>
    );
}
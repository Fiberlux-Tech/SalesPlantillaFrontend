// src/features/finance/components/FinanceToolBar.tsx
import React from 'react';
import DatePicker from '@/components/shared/DatePicker'; // Assumes DatePicker.tsx
import { SearchIcon, CalendarIcon } from '@/components/shared/Icons'; // Assumes Icons.tsx

// 1. Define the props interface
interface FinanceToolBarProps {
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    isDatePickerOpen: boolean;
    setIsDatePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedDate: Date | null;
    setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
    datePickerRef: React.RefObject<HTMLDivElement>;
    onClearDate: () => void;
    onSelectToday: () => void;
}

// 2. Apply the props interface
export function FinanceToolBar({
    filter,
    setFilter,
    isDatePickerOpen,
    setIsDatePickerOpen,
    selectedDate,
    setSelectedDate,
    datePickerRef,
    onClearDate,
    onSelectToday
}: FinanceToolBarProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                <input 
                    type="text" 
                    placeholder="Filter by client name..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={filter} 
                    // 3. Type the event handler inline
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)} 
                />
            </div>
            <div className="relative w-full max-w-xs" ref={datePickerRef}>
                <button 
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)} 
                    className="w-full flex justify-between items-center text-left px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <span className={selectedDate ? 'text-gray-800' : 'text-gray-400'}>
                        {selectedDate ? selectedDate.toLocaleDateString('en-CA') : 'dd/mm/yyyy'}
                    </span>
                    <CalendarIcon />
                </button>
                {isDatePickerOpen && (
                    <DatePicker 
                        selectedDate={selectedDate} 
                        onSelectDate={(date: Date) => { 
                            setSelectedDate(date); 
                            setIsDatePickerOpen(false); 
                        }} 
                        onClear={onClearDate} 
                        onSelectToday={onSelectToday} 
                    />
                )}
            </div>
        </div>
    );
}
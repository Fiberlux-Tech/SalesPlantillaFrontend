import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from './Icons';

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

export default DatePicker;
import React from 'react';
import { ChevronRightIcon, ChevronDownIcon } from './shared/Icons';

const CostBreakdownRow = ({ title, items, total, isOpen, onToggle, children }) => (
    <div>
        <div onClick={onToggle} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
                {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
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
        {isOpen && <div className="p-4 border border-t-0 border-gray-200 rounded-b-lg">{children}</div>}
    </div>
);

export default CostBreakdownRow;
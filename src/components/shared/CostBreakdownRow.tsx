// src/components/shared/CostBreakdownRow.tsx
import type { ReactNode } from 'react'; // FIX: Import type explicitly
import { ChevronRightIcon, ChevronDownIcon } from './Icons'; // Assumes Icons.tsx

// 1. Define props interface
interface CostBreakdownRowProps {
    title: string;
    items: number;
    total: number | null; // Allow null for cases like CashFlow
    isOpen: boolean;
    onToggle: () => void;
    children: ReactNode; // FIX: Use imported type
    customTotalsNode?: ReactNode; // FIX: Use imported type
}

// 2. Apply props
const CostBreakdownRow = ({ 
    title, 
    items, 
    total, 
    isOpen, 
    onToggle, 
    children, 
    customTotalsNode 
}: CostBreakdownRowProps) => (
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
                {customTotalsNode ? (
                    customTotalsNode 
                ) : (
                     <>
                        {/* 3. Handle null 'total' prop */}
                        <p className="font-semibold text-gray-800">
                            {total !== null 
                                ? `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : '-'
                            }
                        </p>
                        <p className="text-xs text-gray-500 text-right">Total</p>
                    </>
                )}
            </div>
        </div>
        {isOpen && <div className="p-4 border border-t-0 border-gray-200 rounded-b-lg">{children}</div>}
    </div>
);

export default CostBreakdownRow;
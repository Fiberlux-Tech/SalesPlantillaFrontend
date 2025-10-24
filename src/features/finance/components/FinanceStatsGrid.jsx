// fiberlux-tech/salesplantillafrontend/SalesPlantillaFrontend-64ed8b30ed6e79e4876344359d7698df855dbf56/src/features/finance/components/FinanceStatsGrid.jsx

import React from 'react';
import StatsCard from '@/components/shared/StatsCard'; // Standardized import
// --- Icons ---
import { // Standardized imports
    ClockIcon,
    TrendUpIcon,
    DollarSignIcon,
    FileTextIcon,
} from '@/components/shared/Icons'; 

export function FinanceStatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Valor Total Aprobado" value={stats.totalApprovedValue} icon={<DollarSignIcon />} iconBgColor="bg-green-100" />
            <StatsCard title="Margen Promedio" value={stats.averageMargin} icon={<TrendUpIcon />} iconBgColor="bg-blue-100" />
            <StatsCard title="High-Risk Deals" value={stats.highRiskDeals} icon={<FileTextIcon />} iconBgColor="bg-yellow-100" />
            <StatsCard title="Deals This Month" value={stats.dealsThisMonth} icon={<ClockIcon />} iconBgColor="bg-purple-100" />
        </div>
    );
}
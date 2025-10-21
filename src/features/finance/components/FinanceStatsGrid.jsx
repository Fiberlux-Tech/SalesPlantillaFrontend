import React from 'react';
import StatsCard from '../../../components/shared/StatsCard';
// --- Icons ---
import {
    ClockIcon,
    TrendUpIcon,
    DollarSignIcon,
    FileTextIcon,
} from '../../../components/shared/Icons';

// Note: You should consider moving StatsCard into 'src/features/finance/components'
// or 'src/components/shared' if it's used elsewhere.
// The icon paths are also adjusted based on the new file location.

export function FinanceStatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Approved Value" value={stats.totalApprovedValue} icon={<DollarSignIcon />} iconBgColor="bg-green-100" />
            <StatsCard title="Average Margin" value={stats.averageMargin} icon={<TrendUpIcon />} iconBgColor="bg-blue-100" />
            <StatsCard title="High-Risk Deals" value={stats.highRiskDeals} icon={<FileTextIcon />} iconBgColor="bg-yellow-100" />
            <StatsCard title="Deals This Month" value={stats.dealsThisMonth} icon={<ClockIcon />} iconBgColor="bg-purple-100" />
        </div>
    );
}
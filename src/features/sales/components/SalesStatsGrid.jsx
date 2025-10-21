import React from 'react';
import StatsCard from '../../../components/shared/StatsCard'; // From shared components
import {
    ClockIcon,
    TrendUpIcon,
    DollarSignIcon,
    FileTextIcon,
} from './Icons'; // From feature-specific components

export function SalesStatsGrid({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Pending Approvals" value={stats.pendingApprovals} icon={<FileTextIcon />} iconBgColor="bg-yellow-100" />
            <StatsCard title="Total Value" value={stats.totalValue} icon={<DollarSignIcon />} iconBgColor="bg-green-100" />
            <StatsCard title="Avg IRR" value={stats.avgIRR} icon={<TrendUpIcon />} iconBgColor="bg-blue-100" />
            <StatsCard title="Avg Payback" value={stats.avgPayback} icon={<ClockIcon />} iconBgColor="bg-purple-100" />
        </div>
    );
}
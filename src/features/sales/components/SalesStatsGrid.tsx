// src/features/sales/components/SalesStatsGrid.tsx
import StatsCard from '../../../components/shared/StatsCard'; // Assumes StatsCard.tsx
import {
    ClockIcon,
    TrendUpIcon,
    DollarSignIcon,
    FileTextIcon,
} from '../../../components/shared/Icons'; // Assumes Icons.tsx

// 1. Define the props interface for 'stats'
interface SalesStatsGridProps {
    stats: {
        pendingApprovals: number;
        totalValue: string;
        avgIRR: string;
        avgPayback: string;
    };
}

// 2. Apply the props interface
export function SalesStatsGrid({ stats }: SalesStatsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Aprobaciones Pendiente" value={stats.pendingApprovals} icon={<FileTextIcon />} iconBgColor="bg-yellow-100" />
TA           <StatsCard title="Valor Total" value={stats.totalValue} icon={<DollarSignIcon />} iconBgColor="bg-green-100" />
            <StatsCard title="Avg TIR" value={stats.avgIRR} icon={<TrendUpIcon />} iconBgColor="bg-blue-100" />
            <StatsCard title="Avg Payback" value={stats.avgPayback} icon={<ClockIcon />} iconBgColor="bg-purple-100" />
        </div>
    );
}
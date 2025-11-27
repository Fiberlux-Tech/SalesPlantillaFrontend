// src/features/finance/components/FinanceStatsGrid.tsx
import StatsCard from '@/features/transactions/components/StatsCard'; // Assumes StatsCard.tsx
import { 
    ClockIcon,
    TrendUpIcon,
    DollarSignIcon,
    FileTextIcon,
} from '@/components/shared/Icons'; // Assumes Icons.tsx
import { FINANCE_STATS_LABELS } from '@/config';

// 1. Define the props interface for 'stats'
interface StatsGridProps {
    stats: {
        totalApprovedValue: string;
        averageMargin: string;
        highRiskDeals: number;
        dealsThisMonth: number;
    };
}

// 2. Apply the props interface
export function FinanceStatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title={FINANCE_STATS_LABELS.VALOR_TOTAL_APROBADO} value={stats.totalApprovedValue} icon={<DollarSignIcon />} iconBgColor="bg-green-100" />
            <StatsCard title={FINANCE_STATS_LABELS.MARGEN_PROMEDIO} value={stats.averageMargin} icon={<TrendUpIcon />} iconBgColor="bg-blue-100" />
            <StatsCard title={FINANCE_STATS_LABELS.HIGH_RISK_DEALS} value={stats.highRiskDeals} icon={<FileTextIcon />} iconBgColor="bg-yellow-100" />
            <StatsCard title={FINANCE_STATS_LABELS.DEALS_THIS_MONTH} value={stats.dealsThisMonth} icon={<ClockIcon />} iconBgColor="bg-purple-100" />
        </div>
    );
}
// src/features/transactions/components/KpiMetricsGrid.tsx
import KpiCard from '@/components/shared/KpiCard';
import { EditableKpiCard } from '@/components/shared/EditableKpiCard';
import { formatCurrency } from '@/lib/formatters'; 
import type { 
    Transaction, 
    KpiCalculationResponse,
} from '@/types'; 

interface KpiMetricsGridProps {
    tx: Transaction;
    kpiData: KpiCalculationResponse['data'] | Transaction;
    canEdit: boolean;
    onGigalanInputChange: (key: string, value: any) => void;
}

export function KpiMetricsGrid({
    tx,
    kpiData,
    canEdit,
    onGigalanInputChange
}: KpiMetricsGridProps) {
    return (
        <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EditableKpiCard
                    title="MRC (Recurrente Mensual)"
                    kpiKey="MRC"
                    currencyKey="mrc_currency"
                    currentValue={kpiData.MRC ?? tx.MRC}
                    currentCurrency={kpiData.mrc_currency ?? tx.mrc_currency ?? 'PEN'}
                    subtext="Métrica Clave"
                    canEdit={canEdit} 
                    onValueChange={onGigalanInputChange}
                />
                
                <EditableKpiCard
                    title="NRC (Pago Único)"
                    kpiKey="NRC"
                    currencyKey="nrc_currency"
                    currentValue={kpiData.NRC ?? tx.NRC}
                    currentCurrency={kpiData.nrc_currency ?? tx.nrc_currency ?? 'PEN'}
                    canEdit={canEdit} 
                    onValueChange={onGigalanInputChange}
                />

                <KpiCard title="VAN" value={formatCurrency(kpiData.VAN)} currency="PEN" />
                <KpiCard title="TIR" value={`${(kpiData.TIR * 100)?.toFixed(2)}%`} />
                <KpiCard title="Periodo de Payback" value={`${kpiData.payback} meses`} />
                <KpiCard title="Ingresos Totales" value={formatCurrency(kpiData.totalRevenue)} currency="PEN" />
                <KpiCard title="Gastos Totales" value={formatCurrency(kpiData.totalExpense)} currency="PEN" isNegative={true} />
                <KpiCard title="Utilidad Bruta" value={formatCurrency(kpiData.grossMargin)} currency="PEN" />
                <KpiCard title="Margen Bruto (%)" value={`${(kpiData.grossMarginRatio * 100)?.toFixed(2)}%`} />
                <KpiCard title="Comisión de Ventas" value={formatCurrency(kpiData.comisiones)} currency="PEN" />
                <KpiCard title="Costo Instalación" value={formatCurrency(tx.costoInstalacion)} currency="PEN" />
                <KpiCard title="Costo Instalación (%)" value={`${(kpiData.costoInstalacionRatio * 100)?.toFixed(2)}%`} />
            </div>
        </div>
    );
}
// src/features/transactions/components/KpiMetricsGrid.tsx
import KpiCard from '@/components/shared/KpiCard';
// REMOVED: EditableKpiCard is no longer needed here
import { formatCurrency } from '@/lib/formatters';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext'; 

// --- REMOVED PROPS INTERFACE ---

export function KpiMetricsGrid() {

    const {
        baseTransaction,
        draftState, 
    } = useTransactionPreview();

    const { liveKpis } = draftState; 
    const tx = baseTransaction.transactions;
    const kpiData = liveKpis || tx;

    // Filtered/Ordered list of KpiCard elements (Point 4)
    const kpiCards = [
        // 1. INGRESOS TOTALES
        <KpiCard key="totalRevenue" title="Ingresos Totales" value={formatCurrency(kpiData.totalRevenue)} currency="PEN" />,
        // 2. GASTOS TOTALES
        <KpiCard key="totalExpense" title="Gastos Totales" value={formatCurrency(kpiData.totalExpense)} currency="PEN" isNegative={true} />,
        // 3. UTILIDAD BRUTA
        <KpiCard key="grossMargin" title="Utilidad Bruta" value={formatCurrency(kpiData.grossMargin)} currency="PEN" />,
        // 4. MARGEN BRUTO (%)
        <KpiCard key="grossMarginRatio" title="Margen Bruto (%)" value={`${(kpiData.grossMarginRatio * 100)?.toFixed(2)}%`} />,
        // 5. PERIODO DE PAYBACK
        <KpiCard key="payback" title="Periodo de Payback" value={`${kpiData.payback} meses`} />,
        // 6. TIR
        <KpiCard key="TIR" title="TIR" value={`${(kpiData.TIR * 100)?.toFixed(2)}%`} />,
        // 7. VAN
        <KpiCard key="VAN" title="VAN" value={formatCurrency(kpiData.VAN)} currency="PEN" />,
        // 8. COSTO INSTALACION (%)
        <KpiCard key="costoInstalacionRatio" title="Costo Instalación (%)" value={`${(kpiData.costoInstalacionRatio * 100)?.toFixed(2)}%`} />,
    ];

    return (
        <div className="mb-8"> {/* MODIFIED: Increased margin from mb-8 to mb-12 */}
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards}
            </div>
        </div>
    );
}
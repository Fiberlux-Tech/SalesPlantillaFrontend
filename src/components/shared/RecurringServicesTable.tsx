// src/components/shared/RecurringServicesTable.tsx
import { formatCurrency, formatCellData } from '@/lib/formatters';
import { EditableCurrencyCell } from '@/components/shared/EditableCurrencyCell'; 
import type { RecurringService } from '@/types'; // 1. Import the data type

// 2. Define props interface
interface RecurringServicesTableProps {
    data: RecurringService[] | null | undefined;
    canEdit?: boolean;
    onServiceChange?: (index: number, field: keyof RecurringService, value: string | number) => void;
}

const RecurringServicesTable = ({ 
    data,
    canEdit = false, 
    onServiceChange = () => {}
}: RecurringServicesTableProps) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">No recurring services data available.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg">
      <table className="w-full text-sm divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-40 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo Servicio
            </th>
            <th className="w-[10rem] px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ubicación
            </th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Q</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Moneda
            </th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ingreso</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CU1</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CU2</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Moneda
            </th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Egreso</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-gray-50"> {/* 3. Use item.id for key */}
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                {formatCellData(item.tipo_servicio)}
              </td>
              <td
                className="px-3 py-2 text-gray-800 align-middle truncate max-w-[160px]"
                // FIX: Convert the result of formatCellData to string to satisfy the 'title' prop requirement
                title={`${formatCellData(item.ubicacion)}`}
              >
                {formatCellData(item.ubicacion)}
              </td>
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                {formatCellData(item.Q)}
              </td>
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                {formatCurrency(item.P)}
              </td>
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                <EditableCurrencyCell
                    currentValue={item.p_currency ?? 'PEN'}
                    // 4. Ensure field name matches RecurringService type
                    onConfirm={(newValue) => onServiceChange(index, 'p_currency', newValue)}
                    canEdit={canEdit}
                />
              </td>
              <td className="px-3 py-2 text-green-600 font-semibold align-middle text-center whitespace-nowrap">
                {formatCurrency(item.ingreso)}
              </td>
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                {formatCurrency(item.CU1)}
              </td>
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                {formatCurrency(item.CU2)}
              </td>
              <td
                className="px-3 py-2 text-gray-800 align-middle truncate text-center max-w-[150px]"
                // FIX: Apply the same fix here
                title={`${formatCellData(item.proveedor)}`}
              >
                {formatCellData(item.proveedor)}
              </td>
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                <EditableCurrencyCell
                    currentValue={item.cu_currency ?? 'USD'}
                    onConfirm={(newValue) => onServiceChange(index, 'cu_currency', newValue)}
                    canEdit={canEdit}
                />
              </td>
              <td className="px-3 py-2 text-red-600 font-semibold align-middle text-center whitespace-nowrap">
                {formatCurrency(item.egreso)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecurringServicesTable;
// fiberlux-tech/salesplantillafrontend/SalesPlantillaFrontend/src/components/shared/FixedCostsTable.jsx

import React from 'react';
import { formatCurrency, formatCellData } from '@/lib/formatters'; // Import shared formatters
import { EditableTableCell } from '@/components/shared/EditableTableCell'; 
// NEW: Import the EditableCurrencyCell
import { EditableCurrencyCell } from '@/components/shared/EditableCurrencyCell'; 

const FixedCostsTable = ({ 
    data, 
    canEdit = false, 
    onCostChange = (index, field, value) => {} 
}) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">No fixed cost data available.</p>;
  }
  
  return (
    <div className="overflow-x-auto bg-white rounded-lg">
      <table className="min-w-full text-sm divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          {/* --- UPDATED: Column order --- */}
          <tr>
            <th className="w-40 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="w-40 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Servicio</th>
            <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
            <th className="w-32 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
            <th className="w-20 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            <th className="w-28 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Unitario</th>
            <th className="w-28 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo Inicio</th>
            <th className="w-28 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Duración (Meses)</th>
            {/* --- NEW: Currency Column --- */}
            <th className="w-28 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Moneda</th>
            <th className="w-28 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 overflow-hidden truncate">{formatCellData(item.categoria)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 overflow-hidden truncate">{formatCellData(item.tipo_servicio)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 overflow-hidden truncate">{formatCellData(item.ticket)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 overflow-hidden truncate">{formatCellData(item.ubicacion)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">{formatCellData(item.cantidad)}</td>
              
              {/* MODIFIED: Costo Unitario now shows currency */}
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">
                {formatCurrency(item.costoUnitario)}
              </td>

              {/* Editable Periodo Inicio */}
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">
                <EditableTableCell
                    currentValue={item.periodo_inicio ?? 0}
                    onConfirm={(newValue) => onCostChange(index, 'periodo_inicio', newValue)}
                    canEdit={canEdit}
                    min={0}
                />
              </td>
              
              {/* Editable Duracion Meses */}
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">
                <EditableTableCell
                    currentValue={item.duracion_meses ?? 1}
                    onConfirm={(newValue) => onCostChange(index, 'duracion_meses', newValue)}
                    canEdit={canEdit}
                    min={1} // Duration must be at least 1
                />
              </td>

              {/* --- NEW: Editable Currency Cell --- */}
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">
                <EditableCurrencyCell
                    currentValue={item.costo_currency ?? 'USD'}
                    onConfirm={(newValue) => onCostChange(index, 'costo_currency', newValue)}
                    canEdit={canEdit}
                />
              </td>

              <td className="px-4 py-2 whitespace-nowrap text-red-600 font-semibold text-center">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FixedCostsTable;
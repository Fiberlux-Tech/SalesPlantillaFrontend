// fiberlux-tech/salesplantillafrontend/SalesPlantillaFrontend-64ed8b30ed6e79e4876344359d7698df855dbf56/src/components/shared/RecurringServicesTable.jsx

import React from 'react';
import { formatCurrency, formatCellData } from '@/lib/formatters'; // Import shared formatters

const RecurringServicesTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">No recurring services data available.</p>;
  }

  // NOTE: Local formatCurrency and formatCellData functions have been removed.

  return (
    <div className="overflow-x-auto bg-white rounded-lg">
      <table className="w-full text-sm divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-40 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo Servicio
            </th>
            <th className="w-[14rem] px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nota
            </th>
            <th className="w-[10rem] px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ubicación
            </th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Q</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ingreso</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CU1</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CU2</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
            <th className="w-20 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Egreso</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {/* Tipo Servicio */}
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                {formatCellData(item.tipo_servicio)}
              </td>

              {/* Nota */}
              <td
                className="px-3 py-2 text-gray-800 align-middle truncate max-w-[200px]"
                title={formatCellData(item.nota)} // Use helper for title too
              >
                {formatCellData(item.nota)}
              </td>

              {/* Ubicación */}
              <td
                className="px-3 py-2 text-gray-800 align-middle truncate max-w-[160px]"
                title={formatCellData(item.ubicacion)} // Use helper for title too
              >
                {formatCellData(item.ubicacion)}
              </td>

              {/* Q */}
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                {formatCellData(item.Q)} {/* Use the general helper for Q */}
              </td>

              {/* P */}
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                {formatCurrency(item.P)}
              </td>

              {/* Ingreso */}
              <td className="px-3 py-2 text-green-600 font-semibold align-middle text-center whitespace-nowrap">
                {formatCurrency(item.ingreso)}
              </td>

              {/* CU1 */}
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                {formatCurrency(item.CU1)}
              </td>

              {/* CU2 */}
              <td className="px-3 py-2 text-gray-800 align-middle text-center whitespace-nowrap">
                {formatCurrency(item.CU2)}
              </td>

              {/* Proveedor */}
              <td
                className="px-3 py-2 text-gray-800 align-middle truncate text-center max-w-[150px]"
                title={formatCellData(item.proveedor)} // Use helper for title too
              >
                {formatCellData(item.proveedor)}
              </td>

              {/* Egreso */}
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
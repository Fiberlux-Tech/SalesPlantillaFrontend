import React from 'react';

const FixedCostsTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">No hay costos fijos disponible.</p>;
  }

  // Handles currency formatting AND returns '-' for 0/null/undefined
  const formatCurrency = (value) => {
    if (value === null || typeof value === 'undefined' || value === 0) return '-';
    if (typeof value !== 'number') return '-'; // Treat non-numbers (except handled above) as '-'
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Handles non-currency data (text and numbers like 'Cantidad') and returns '-' for 0/null/undefined/empty/N/A
  const formatCellData = (value) => {
    if (value === null || typeof value === 'undefined' || value === '' || value === 'N/A' || value === 0) {
      return '-';
    }
    return value; // Return original value otherwise
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg">
      <table className="min-w-full text-sm divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-40 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="w-40 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Servicio</th>
            <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
            <th className="w-32 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
            {/* Changed text-right to text-center */}
            <th className="w-20 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            {/* Changed text-right to text-center */}
            <th className="w-28 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Unitario</th>
            {/* Changed text-right to text-center */}
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
              {/* Changed text-right to text-center */}
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">{formatCellData(item.cantidad)}</td>
              {/* Changed text-right to text-center */}
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-center">{formatCurrency(item.costoUnitario)}</td>
              {/* Changed text-right to text-center and added text-red-600 */}
              <td className="px-4 py-2 whitespace-nowrap text-red-600 font-semibold text-center">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FixedCostsTable;
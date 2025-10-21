import React from 'react';

const FixedCostsTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">No fixed cost data available.</p>;
  }

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg">
      <table className="min-w-full text-sm divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Servicio</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Unitario</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">{item.categoria || 'N/A'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">{item.tipo_servicio || 'N/A'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">{item.ticket || 'N/A'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">{item.ubicacion || 'N/A'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-right">{item.cantidad || 0}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-right">{formatCurrency(item.costoUnitario)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-semibold text-right">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FixedCostsTable;

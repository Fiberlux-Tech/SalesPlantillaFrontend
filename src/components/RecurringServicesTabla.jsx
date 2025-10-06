import React from 'react';

const RecurringServicesTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">No recurring services data available.</p>;
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
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Servicio</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Q</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingreso</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CU1</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CU2</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Egreso</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">{item.tipo_servicio || 'N/A'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">{item.nota || 'N/A'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">{item.ubicacion || 'N/A'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-right">{item.Q || 0}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-right">{formatCurrency(item.P)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-green-600 font-semibold text-right">{formatCurrency(item.ingreso)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-right">{formatCurrency(item.CU1)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-right">{formatCurrency(item.CU2)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">{item.proveedor || 'N/A'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-red-600 font-semibold text-right">{formatCurrency(item.egreso)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecurringServicesTable;
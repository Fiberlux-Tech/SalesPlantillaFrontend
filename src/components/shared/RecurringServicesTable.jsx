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
      {/* The table-fixed class is crucial here to make the column widths stick */}
      <table className="min-w-full text-sm divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            {/* Tipo Servicio: Add truncate classes */}
            <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden whitespace-nowrap truncate">Tipo Servicio</th>
            {/* Nota: Add truncate classes */}
            <th className="w-56 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden whitespace-nowrap truncate">Nota</th>
            {/* Ubicación: Add truncate classes */}
            <th className="w-28 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden whitespace-nowrap truncate">Ubicación</th>
            {/* Q, P, Ingreso, etc. (Numeric fields - shorter widths) */}
            <th className="w-16 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Q</th>
            <th className="w-28 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
            <th className="w-28 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingreso</th>
            <th className="w-28 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CU1</th>
            <th className="w-28 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CU2</th>
            {/* Proveedor: Add truncate classes */}
            <th className="w-32 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden whitespace-nowrap truncate">Proveedor</th>
            <th className="w-28 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Egreso</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              
              {/* Tipo Servicio - ADD: truncate, overflow-hidden */}
              <td className="w-24 px-4 py-2 whitespace-nowrap text-gray-800 overflow-hidden truncate">{item.tipo_servicio || 'N/A'}</td>
              
              {/* Nota - ADD: whitespace-nowrap, truncate, overflow-hidden */}
              <td className="w-56 px-4 py-2 whitespace-nowrap text-gray-800 overflow-hidden truncate">{item.nota || 'N/A'}</td>
              
              {/* Ubicación - ADD: truncate, overflow-hidden */}
              <td className="w-28 px-4 py-2 whitespace-nowrap text-gray-800 overflow-hidden truncate">{item.ubicacion || 'N/A'}</td>
              
              {/* Numeric columns - Keep as is (nowrap is good for currency alignment) */}
              <td className="w-16 px-4 py-2 whitespace-nowrap text-gray-800 text-right">{item.Q || 0}</td>
              <td className="w-28 px-4 py-2 whitespace-nowrap text-gray-800 text-right">{formatCurrency(item.P)}</td>
              <td className="w-28 px-4 py-2 whitespace-nowrap text-green-600 font-semibold text-right">{formatCurrency(item.ingreso)}</td>
              <td className="w-28 px-4 py-2 whitespace-nowrap text-gray-800 text-right">{formatCurrency(item.CU1)}</td>
              <td className="w-28 px-4 py-2 whitespace-nowrap text-gray-800 text-right">{formatCurrency(item.CU2)}</td>
              
              {/* Proveedor - ADD: truncate, overflow-hidden */}
              <td className="w-32 px-4 py-2 whitespace-nowrap text-gray-800 overflow-hidden truncate">{item.proveedor || 'N/A'}</td>
              
              <td className="w-28 px-4 py-2 whitespace-nowrap text-red-600 font-semibold text-right">{formatCurrency(item.egreso)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecurringServicesTable;
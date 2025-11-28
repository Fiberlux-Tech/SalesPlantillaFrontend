import React from 'react';
import type { FixedCost } from '@/types';
import { formatCurrency } from '@/lib/formatters';

interface FixedCostDetailModalProps {
  cost: FixedCost | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FixedCostDetailModal: React.FC<FixedCostDetailModalProps> = ({
  cost,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !cost) return null;

  // Simple calculation: Costo Unitario × Cantidad
  const simpleTotalCost = (cost.costoUnitario || 0) * (cost.cantidad || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Content */}
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {cost.categoria || 'EQUIPAMIENTO'}
            </p>
            <p className="text-2xl font-bold text-gray-900">{cost.tipo_servicio}</p>
          </div>

          {/* Details Grid */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* Ubicación */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Ubicación</p>
              <p className="text-lg font-semibold text-gray-900">{cost.ubicacion || '-'}</p>
            </div>

            {/* Cantidad */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Cantidad</p>
              <p className="text-lg font-semibold text-gray-900">{cost.cantidad || '-'}</p>
            </div>

            {/* Costo Unitario */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Costo Unitario</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(cost.costoUnitario) || '-'}
                {cost.costoUnitario !== null && cost.costoUnitario !== undefined && cost.costoUnitario !== 0 && (
                  <span className="text-base font-medium text-gray-600 ml-1">{cost.costo_currency || 'USD'}</span>
                )}
              </p>
            </div>

            {/* Simple Total Cost Calculation */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Cost (Costo Unit. × Cantidad)</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(simpleTotalCost)}
                <span className="text-lg font-medium ml-1">{cost.costo_currency || 'USD'}</span>
              </p>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

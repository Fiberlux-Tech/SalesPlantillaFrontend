import React, { useState, useEffect } from 'react';
import type { FixedCost } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { NumberInput, TextInput, CurrencySelect } from './ModalInputs';

interface FixedCostDetailModalProps {
  cost: FixedCost | null;
  isOpen: boolean;
  onClose: () => void;
  isEditMode?: boolean;
  onSave?: (updatedCost: FixedCost) => void;
}

export const FixedCostDetailModal: React.FC<FixedCostDetailModalProps> = ({
  cost,
  isOpen,
  onClose,
  isEditMode = false,
  onSave,
}) => {
  // Local state for edited values
  const [editedValues, setEditedValues] = useState<Partial<FixedCost>>({});
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  // Initialize edited values when cost changes
  useEffect(() => {
    if (cost && isEditMode) {
      setEditedValues({
        cantidad: cost.cantidad,
        costoUnitario_original: cost.costoUnitario_original,
        costoUnitario_currency: cost.costoUnitario_currency,
        costoUnitario_pen: cost.costoUnitario_pen,
        ubicacion: cost.ubicacion,
        periodo_inicio: cost.periodo_inicio,
        duracion_meses: cost.duracion_meses,
      });
      setCalculatedTotal(cost.total_pen || 0);
    }
  }, [cost, isEditMode]);

  // Real-time calculation
  useEffect(() => {
    if (!isEditMode || !cost) return;

    const timer = setTimeout(() => {
      const cantidad = editedValues.cantidad ?? cost.cantidad ?? 0;
      const costoUnitarioPen = editedValues.costoUnitario_pen ?? cost.costoUnitario_pen ?? 0;

      // Simple calculation: Costo Unitario (in PEN) × Cantidad
      // Note: The actual total might depend on duration if it's a monthly cost,
      // but for "Inversion" (Fixed Cost) usually it's a one-time or total project cost.
      // However, the original code had `total` in the type.
      // Let's assume Total = Cantidad * Costo Unitario for the display.
      setCalculatedTotal(cantidad * costoUnitarioPen);
    }, 300);

    return () => clearTimeout(timer);
  }, [editedValues, cost, isEditMode]);

  const getCurrentValue = (field: keyof FixedCost) => {
    if (isEditMode && editedValues[field] !== undefined) {
      return editedValues[field];
    }
    return cost?.[field];
  };

  const handleFieldChange = (field: keyof FixedCost, value: any) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!cost || !onSave) return;

    const updatedCost: FixedCost = {
      ...cost,
      ...editedValues,
      total_pen: calculatedTotal,
    };

    onSave(updatedCost);
    onClose();
  };

  if (!isOpen || !cost) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Content */}
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {cost.categoria || 'EQUIPAMIENTO'}
            </p>
            <p className="text-2xl font-bold text-gray-900">{cost.tipo_servicio}</p>
            <p className="text-sm text-gray-500 mt-1">Ticket: {cost.ticket}</p>
          </div>

          {/* Details Grid */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Ubicación */}
              {isEditMode ? (
                <TextInput
                  value={getCurrentValue('ubicacion') as string}
                  onChange={(value) => handleFieldChange('ubicacion', value)}
                  label="Ubicación"
                  className=""
                />
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Ubicación</p>
                  <p className="text-lg font-semibold text-gray-900">{cost.ubicacion || '-'}</p>
                </div>
              )}

              {/* Cantidad */}
              {isEditMode ? (
                <NumberInput
                  value={getCurrentValue('cantidad') as number}
                  onChange={(value) => handleFieldChange('cantidad', value)}
                  label="Cantidad"
                  step="1"
                />
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Cantidad</p>
                  <p className="text-lg font-semibold text-gray-900">{cost.cantidad || '-'}</p>
                </div>
              )}

              {/* Costo Unitario */}
              {isEditMode ? (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Costo Unitario</p>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={getCurrentValue('costoUnitario_original') as number}
                      onChange={(e) => handleFieldChange('costoUnitario_original', parseFloat(e.target.value) || 0)}
                      className="w-full text-2xl font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.01"
                    />
                    <CurrencySelect
                      value={getCurrentValue('costoUnitario_currency') as "PEN" | "USD"}
                      onChange={(value) => handleFieldChange('costoUnitario_currency', value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Costo Unitario</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(cost.costoUnitario_original) || '-'}
                    {cost.costoUnitario_original !== null && cost.costoUnitario_original !== undefined && cost.costoUnitario_original !== 0 && (
                      <span className="text-base font-medium text-gray-600 ml-1">{cost.costoUnitario_currency || 'USD'}</span>
                    )}
                  </p>
                </div>
              )}

              {/* Periodo Inicio & Duracion (Editable only in modal if needed, but also in table) */}
              {isEditMode && (
                <>
                  <NumberInput
                    value={getCurrentValue('periodo_inicio') as number}
                    onChange={(value) => handleFieldChange('periodo_inicio', value)}
                    label="Inicio (Mes)"
                    step="1"
                  />
                  <NumberInput
                    value={getCurrentValue('duracion_meses') as number}
                    onChange={(value) => handleFieldChange('duracion_meses', value)}
                    label="Duración (Meses)"
                    step="1"
                  />
                </>
              )}

            </div>

            {/* Simple Total Cost Calculation */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Cost (Costo Unit. × Cantidad) - in PEN</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(isEditMode ? calculatedTotal : cost.total_pen || (cost.costoUnitario_pen * cost.cantidad))}
                <span className="text-lg font-medium ml-1">PEN</span>
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            {isEditMode ? (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Guardar
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

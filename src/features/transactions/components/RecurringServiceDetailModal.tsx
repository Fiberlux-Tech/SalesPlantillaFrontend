import React, { useState, useEffect } from 'react';
import type { RecurringService } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { NumberInput, TextInput, CurrencySelect } from './ModalInputs';

interface RecurringServiceDetailModalProps {
  service: RecurringService | null;
  isOpen: boolean;
  onClose: () => void;
  isEditMode?: boolean;
  onSave?: (updatedService: RecurringService) => void;
}

export const RecurringServiceDetailModal: React.FC<RecurringServiceDetailModalProps> = ({
  service,
  isOpen,
  onClose,
  isEditMode = false,
  onSave,
}) => {
  // Local state for edited values
  const [editedValues, setEditedValues] = useState<Partial<RecurringService>>({});
  const [calculatedIngreso, setCalculatedIngreso] = useState(0);
  const [calculatedEgreso, setCalculatedEgreso] = useState(0);

  // Initialize edited values when service changes
  useEffect(() => {
    if (service && isEditMode) {
      setEditedValues({
        Q: service.Q,
        P: service.P,
        p_currency: service.p_currency,
        CU1: service.CU1,
        CU2: service.CU2,
        cu_currency: service.cu_currency,
        proveedor: service.proveedor,
      });
      setCalculatedIngreso(service.ingreso);
      setCalculatedEgreso(service.egreso);
    }
  }, [service, isEditMode]);

  // Real-time calculation with 300ms debounce
  useEffect(() => {
    if (!isEditMode || !service) return;

    const timer = setTimeout(() => {
      const Q = editedValues.Q ?? service.Q ?? 0;
      const P = editedValues.P ?? service.P ?? 0;
      const CU1 = editedValues.CU1 ?? service.CU1 ?? 0;
      const CU2 = editedValues.CU2 ?? service.CU2 ?? 0;

      setCalculatedIngreso(Q * P);
      setCalculatedEgreso(Q * (CU1 + CU2));
    }, 300);

    return () => clearTimeout(timer);
  }, [editedValues, service, isEditMode]);

  // Helper functions
  const getCurrentValue = (field: keyof RecurringService) => {
    if (isEditMode && editedValues[field] !== undefined) {
      return editedValues[field];
    }
    return service?.[field];
  };

  const handleFieldChange = (field: keyof RecurringService, value: any) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!service || !onSave) return;

    const updatedService: RecurringService = {
      ...service,
      ...editedValues,
      ingreso: calculatedIngreso,
      egreso: calculatedEgreso,
    };

    onSave(updatedService);
    onClose();
  };

  if (!isOpen || !service) return null;

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
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">SERVICIO</p>
              <p className="text-2xl font-bold text-gray-900">{service.tipo_servicio}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">UBICACIÓN</p>
              <p className="text-lg text-gray-900">{service.ubicacion || '-'}</p>
            </div>
          </div>

          {/* Ingreso and Costo Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Ingreso Mensual */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">INGRESO MENSUAL</p>
              <p className="text-3xl font-bold text-blue-700">
                {formatCurrency(isEditMode ? calculatedIngreso : service.ingreso)}{' '}
                <span className="text-xl font-medium">
                  {isEditMode ? (
                    <CurrencySelect
                      value={getCurrentValue('p_currency') as "PEN" | "USD"}
                      onChange={(value) => handleFieldChange('p_currency', value)}
                    />
                  ) : (
                    service.p_currency || 'PEN'
                  )}
                </span>
              </p>
            </div>

            {/* Costo Mensual */}
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm font-medium text-red-600 uppercase tracking-wider mb-1">COSTO MENSUAL</p>
              <p className="text-3xl font-bold text-red-700">
                {formatCurrency(isEditMode ? calculatedEgreso : service.egreso)}{' '}
                <span className="text-xl font-medium">
                  {isEditMode ? (
                    <CurrencySelect
                      value={getCurrentValue('cu_currency') as "PEN" | "USD"}
                      onChange={(value) => handleFieldChange('cu_currency', value)}
                    />
                  ) : (
                    service.cu_currency || 'USD'
                  )}
                </span>
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Cantidad */}
              {isEditMode ? (
                <NumberInput
                  value={getCurrentValue('Q') as number}
                  onChange={(value) => handleFieldChange('Q', value)}
                  label="Cantidad"
                />
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Cantidad</p>
                  <p className="text-2xl font-semibold text-gray-900">{service.Q || '-'}</p>
                </div>
              )}

              {/* Precio Unitario */}
              {isEditMode ? (
                <NumberInput
                  value={getCurrentValue('P') as number}
                  onChange={(value) => handleFieldChange('P', value)}
                  label="Precio Unitario"
                />
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Precio Unitario</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(service.P) || '-'}
                    {service.P !== null && service.P !== undefined && service.P !== 0 && (
                      <span className="text-base font-medium text-gray-600 ml-1">{service.p_currency || 'PEN'}</span>
                    )}
                  </p>
                </div>
              )}

              {/* Costo Unitario (CU1) */}
              {isEditMode ? (
                <NumberInput
                  value={getCurrentValue('CU1') as number}
                  onChange={(value) => handleFieldChange('CU1', value)}
                  label="Costo Unitario"
                />
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Costo Unitario</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(service.CU1) || '-'}
                    {service.CU1 !== null && service.CU1 !== undefined && service.CU1 !== 0 && (
                      <span className="text-base font-medium text-gray-600 ml-1">{service.cu_currency || 'USD'}</span>
                    )}
                  </p>
                </div>
              )}

              {/* Costo Unit. (Transporte) (CU2) */}
              {isEditMode ? (
                <NumberInput
                  value={getCurrentValue('CU2') as number}
                  onChange={(value) => handleFieldChange('CU2', value)}
                  label="Costo Unit. (Transporte)"
                />
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Costo Unit. (Transporte)</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(service.CU2) || '-'}
                    {service.CU2 !== null && service.CU2 !== undefined && service.CU2 !== 0 && (
                      <span className="text-base font-medium text-gray-600 ml-1">{service.cu_currency || 'USD'}</span>
                    )}
                  </p>
                </div>
              )}

              {/* Proveedor */}
              {isEditMode ? (
                <TextInput
                  value={getCurrentValue('proveedor') as string}
                  onChange={(value) => handleFieldChange('proveedor', value)}
                  label="Proveedor"
                />
              ) : (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">Proveedor</p>
                  <p className="text-xl font-semibold text-gray-900">{service.proveedor || '-'}</p>
                </div>
              )}
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

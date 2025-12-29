import React, { useState, useEffect } from 'react';
import type { RecurringService } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { NumberInput, TextInput, CurrencySelect } from './ModalInputs';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext';
import { convertToPEN, calculateRecurringServiceTotals } from '@/lib/calculations';

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

  // Access tipoCambio from context
  const { baseTransaction } = useTransactionPreview();
  const tipoCambio = baseTransaction.transactions.tipoCambio;

  // Derive effective PEN values from current state (no effect needed)
  const effectiveP_pen = convertToPEN(
    editedValues.P_original ?? service?.P_original ?? 0,
    editedValues.P_currency ?? service?.P_currency ?? "PEN",
    tipoCambio
  );

  const effectiveCU1_pen = convertToPEN(
    editedValues.CU1_original ?? service?.CU1_original ?? 0,
    editedValues.CU_currency ?? service?.CU_currency ?? "PEN",
    tipoCambio
  );

  const effectiveCU2_pen = convertToPEN(
    editedValues.CU2_original ?? service?.CU2_original ?? 0,
    editedValues.CU_currency ?? service?.CU_currency ?? "PEN",
    tipoCambio
  );

  // Initialize edited values when service changes
  useEffect(() => {
    if (service && isEditMode) {
      setEditedValues({
        Q: service.Q,
        P_original: service.P_original,
        P_currency: service.P_currency,
        P_pen: service.P_pen,
        CU1_original: service.CU1_original,
        CU2_original: service.CU2_original,
        CU_currency: service.CU_currency,
        CU1_pen: service.CU1_pen,
        CU2_pen: service.CU2_pen,
        proveedor: service.proveedor,
      });
      setCalculatedIngreso(service.ingreso_pen);
      setCalculatedEgreso(service.egreso_pen);
    }
  }, [service, isEditMode]);

  // Real-time calculation with 300ms debounce using derived PEN values
  useEffect(() => {
    if (!isEditMode || !service) return;

    const timer = setTimeout(() => {
      const Q = editedValues.Q ?? service.Q ?? 0;

      const { ingreso_pen, egreso_pen } = calculateRecurringServiceTotals(
        Q,
        effectiveP_pen,
        effectiveCU1_pen,
        effectiveCU2_pen
      );

      setCalculatedIngreso(ingreso_pen);
      setCalculatedEgreso(egreso_pen);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    editedValues.Q,
    editedValues.P_original,
    editedValues.P_currency,
    editedValues.CU1_original,
    editedValues.CU2_original,
    editedValues.CU_currency,
    effectiveP_pen,
    effectiveCU1_pen,
    effectiveCU2_pen,
    tipoCambio,
    service,
    isEditMode,
  ]);

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

    // Calculate final PEN values explicitly before saving
    const finalP_pen = convertToPEN(
      editedValues.P_original ?? service.P_original ?? 0,
      editedValues.P_currency ?? service.P_currency ?? "PEN",
      tipoCambio
    );

    const finalCU1_pen = convertToPEN(
      editedValues.CU1_original ?? service.CU1_original ?? 0,
      editedValues.CU_currency ?? service.CU_currency ?? "PEN",
      tipoCambio
    );

    const finalCU2_pen = convertToPEN(
      editedValues.CU2_original ?? service.CU2_original ?? 0,
      editedValues.CU_currency ?? service.CU_currency ?? "PEN",
      tipoCambio
    );

    const updatedService: RecurringService = {
      ...service,
      ...editedValues,
      P_pen: finalP_pen,
      CU1_pen: finalCU1_pen,
      CU2_pen: finalCU2_pen,
      ingreso_pen: calculatedIngreso,
      egreso_pen: calculatedEgreso,
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
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">INGRESO MENSUAL (PEN)</p>
              <p className="text-3xl font-bold text-blue-700">
                {formatCurrency(isEditMode ? calculatedIngreso : service.ingreso_pen)}{' '}
                <span className="text-xl font-medium">PEN</span>
              </p>
            </div>

            {/* Costo Mensual */}
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm font-medium text-red-600 uppercase tracking-wider mb-1">COSTO MENSUAL (PEN)</p>
              <p className="text-3xl font-bold text-red-700">
                {formatCurrency(isEditMode ? calculatedEgreso : service.egreso_pen)}{' '}
                <span className="text-xl font-medium">PEN</span>
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
              <div className="col-span-2">
                {isEditMode ? (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Precio Unitario</p>
                    <div className="flex items-center gap-2">
                      <NumberInput
                        value={getCurrentValue('P_original') as number}
                        onChange={(value) => handleFieldChange('P_original', value)}
                        label=""
                      />
                      <CurrencySelect
                        value={getCurrentValue('P_currency') as "PEN" | "USD"}
                        onChange={(value) => handleFieldChange('P_currency', value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Precio Unitario</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(service.P_original) || '-'}
                      {service.P_original !== null && service.P_original !== undefined && service.P_original !== 0 && (
                        <span className="text-base font-medium text-gray-600 ml-1">{service.P_currency || 'PEN'}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Costo Unitario (CU1) and Costo Unit. Transporte (CU2) */}
              <div className="col-span-2">
                {isEditMode ? (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Costos Unitarios</p>
                    <div className="flex items-center gap-2">
                      <NumberInput
                        value={getCurrentValue('CU1_original') as number}
                        onChange={(value) => handleFieldChange('CU1_original', value)}
                        label="CU1"
                      />
                      <NumberInput
                        value={getCurrentValue('CU2_original') as number}
                        onChange={(value) => handleFieldChange('CU2_original', value)}
                        label="CU2"
                      />
                      <CurrencySelect
                        value={getCurrentValue('CU_currency') as "PEN" | "USD"}
                        onChange={(value) => handleFieldChange('CU_currency', value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Costo Unitario</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(service.CU1_original) || '-'}
                        {service.CU1_original !== null && service.CU1_original !== undefined && service.CU1_original !== 0 && (
                          <span className="text-base font-medium text-gray-600 ml-1">{service.CU_currency || 'USD'}</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Costo Unit. (Transporte)</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(service.CU2_original) || '-'}
                        {service.CU2_original !== null && service.CU2_original !== undefined && service.CU2_original !== 0 && (
                          <span className="text-base font-medium text-gray-600 ml-1">{service.CU_currency || 'USD'}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

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

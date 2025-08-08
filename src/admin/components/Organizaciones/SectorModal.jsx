import React, { useState, useEffect } from 'react';

/**
 * Modal para agregar o editar un sector (edificio/manzana)
 * Props:
 * - open: boolean
 * - onClose: function
 * - onSave: function (recibe el sector)
 * - initialData: { tipo, nombre } (opcional)
 * - modo: 'agregar' | 'editar'
 */
export default function SectorModal({ open, onClose, onSave, initialData = {}, modo = 'agregar' }) {
  const safeInitialData = initialData || {};
  const [tipo, setTipo] = useState(safeInitialData.tipo || '');
  const [nombre, setNombre] = useState(safeInitialData.nombre || '');

  useEffect(() => {
    setTipo((safeInitialData && safeInitialData.tipo) || '');
    setNombre((safeInitialData && safeInitialData.nombre) || '');
  }, [safeInitialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tipo || !nombre) return;
    onSave({ tipo, nombre });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
          onClick={onClose}
          title="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">
          {modo === 'agregar' ? 'Agregar sector' : 'Editar sector'}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold mb-1">Tipo de sector</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              required
            >
              <option value="">Seleccione</option>
              <option value="edificio">Edificio</option>
              <option value="manzana">Manzana</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Nombre/Identificador</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Edificio A, Manzana 1"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800 transition font-semibold"
            >
              {modo === 'agregar' ? 'Agregar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

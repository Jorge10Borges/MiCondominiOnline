import React, { useEffect, useState } from 'react';

export default function UnidadEditModal({ open, unidad, onClose, onSave }) {
  const [identificador, setIdentificador] = useState(unidad?.identificador || '');
  const [telefono, setTelefono] = useState(unidad?.telefono || '');
  const [propietario, setPropietario] = useState(unidad?.propietario_nombre || '');
  const [alicuota, setAlicuota] = useState(
    typeof unidad?.alicuota === 'number' || typeof unidad?.alicuota === 'string'
      ? String(unidad.alicuota)
      : ''
  );

  useEffect(() => {
    if (!open) return;
    setIdentificador(unidad?.identificador || '');
    setTelefono(unidad?.telefono || '');
  setPropietario(unidad?.propietario_nombre || '');
    setAlicuota(
      typeof unidad?.alicuota === 'number' || typeof unidad?.alicuota === 'string'
        ? String(unidad.alicuota)
        : ''
    );
  }, [open, unidad]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: unidad?.id ?? null,
      sector_id: unidad?.sector_id ?? null,
      numero_orden: unidad?.numero_orden ?? null,
      identificador: identificador?.trim(),
      telefono: telefono?.trim() || null,
  propietario: propietario?.trim() || null,
  alicuota: Number.isFinite(parseFloat(alicuota)) ? parseFloat(alicuota) : 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Unidad</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Identificador</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              value={identificador}
              onChange={e => setIdentificador(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Propietario</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              value={propietario}
              onChange={e => setPropietario(e.target.value)}
              placeholder="Nombre del propietario"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Alicuota (%)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="-100"
              max="100"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              value={alicuota}
              onChange={e => setAlicuota(e.target.value)}
              placeholder="Ej: 2.5"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-Regalia text-white hover:bg-purple-800">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

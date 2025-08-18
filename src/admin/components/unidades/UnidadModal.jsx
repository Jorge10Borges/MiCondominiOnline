import React, { useEffect, useState } from 'react';

export default function UnidadModal({ unidad, open, onClose, onSave }) {
  const [identificador, setIdentificador] = useState(unidad?.identificador || '');
  
  useEffect(() => {
    if (!open) return;
    setIdentificador(unidad?.identificador || '');
  }, [open, unidad]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Unidad</h2>
  <form onSubmit={e => { e.preventDefault(); onSave({ ...unidad, identificador }); }}>
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
          {/* El modal ya no edita propietario desde aquí */}
          
          
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-Regalia text-white hover:bg-purple-800">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

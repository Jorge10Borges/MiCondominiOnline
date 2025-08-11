import React, { useState, useEffect } from 'react';

/**
 * Modal para agregar o editar una organización.
 * Props:
 * - open: boolean (si el modal está visible)
 * - onClose: función para cerrar el modal
 * - onSave: función({nombre, tipo, fecha_expiracion}) para guardar
 * - initialData: objeto con datos iniciales (opcional)
 * - modo: 'agregar' | 'editar'
 */
export default function OrganizacionModal({ open, onClose, onSave, initialData = {}, modo = 'agregar' }) {
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'condominio',
  });

  useEffect(() => {
    if (open) {
      setForm({
        nombre: initialData.nombre || '',
        tipo: initialData.tipo || 'condominio',
      });
    }
  }, [open, initialData]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-2 p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">
          {modo === 'agregar' ? 'Agregar Organización' : 'Editar Organización'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded w-full"
              placeholder="Nombre de la organización"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Tipo</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="condominio">Condominio</option>
              <option value="urbanizacion">Urbanización</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {modo === 'agregar' ? 'Agregar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ...existing code from OrganizacionModal.jsx...

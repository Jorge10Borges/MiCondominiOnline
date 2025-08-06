import React, { useState } from 'react';
import PenIcon from '../../assets/images/pen.svg?react';
import TrashIcon from '../../assets/images/trash.svg?react';
import PlusLargeIcon from '../../assets/images/plusLarge.svg?react';

/**
 * Modal para mostrar y gestionar las unidades (apartamentos/casas) de un sector.
 * Props:
 * - open: boolean
 * - onClose: función para cerrar el modal
 * - unidades: array de unidades [{id, nombre, propietario, dni}]
 * - setUnidades: función para actualizar las unidades
 * - tipo: 'edificio' | 'manzana'
 * - nombreSector: string (opcional)
 */
export default function UnidadesModal({ open, onClose, unidades, setUnidades, tipo, nombreSector }) {
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ nombre: '', propietario: '', dni: '' });

  if (!open) return null;

  const resetForm = () => {
    setForm({ nombre: '', propietario: '', dni: '' });
    setEditIndex(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    if (editIndex !== null) {
      // Editar
      setUnidades(unidades.map((u, i) => i === editIndex ? { ...u, ...form } : u));
    } else {
      // Agregar
      setUnidades([
        ...unidades,
        { id: Date.now(), ...form },
      ]);
    }
    resetForm();
  };

  const handleEdit = (idx) => {
    setEditIndex(idx);
    setForm({
      nombre: unidades[idx].nombre,
      propietario: unidades[idx].propietario || '',
      dni: unidades[idx].dni || '',
    });
    setShowForm(true);
  };

  const handleDelete = (idx) => {
    setUnidades(unidades.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-2 p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">
          {tipo === 'edificio' ? 'Apartamentos' : 'Casas'} {nombreSector ? `de ${nombreSector}` : ''}
        </h2>
        <div className="mb-4 flex justify-end">
          <button
            className="bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800 transition flex items-center gap-2"
            onClick={() => { setShowForm(true); setEditIndex(null); setForm({ nombre: '', propietario: '', dni: '' }); }}
          >
            <PlusLargeIcon className="w-5 h-5" />
            Agregar {tipo === 'edificio' ? 'apartamento' : 'casa'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm md:text-base border">
            <thead>
              <tr className="bg-blue-100">
                <th className="py-2 px-2 border">ID</th>
                <th className="py-2 px-2 border">Nombre</th>
                <th className="py-2 px-2 border">Propietario</th>
                <th className="py-2 px-2 border">Cédula/DNI</th>
                <th className="py-2 px-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {unidades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">No hay {tipo === 'edificio' ? 'apartamentos' : 'casas'} registrados.</td>
                </tr>
              ) : (
                unidades.map((u, idx) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2 px-2 border">{u.id}</td>
                    <td className="py-2 px-2 border">{u.nombre}</td>
                    <td className="py-2 px-2 border">{u.propietario || '-'}</td>
                    <td className="py-2 px-2 border">{u.dni || '-'}</td>
                    <td className="py-2 px-2 border flex gap-2 items-center">
                      <button className="text-yellow-600 hover:underline mr-2 flex items-center gap-1" onClick={() => handleEdit(idx)} title="Editar">
                        <PenIcon className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:underline flex items-center gap-1" onClick={() => handleDelete(idx)} title="Eliminar">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 bg-gray-50 p-4 rounded shadow space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block font-semibold mb-1">Nombre</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1">Propietario</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={form.propietario}
                  onChange={e => setForm({ ...form, propietario: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1">Cédula/DNI</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={form.dni}
                  onChange={e => setForm({ ...form, dni: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300" onClick={resetForm}>Cancelar</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editIndex !== null ? 'Guardar cambios' : 'Agregar'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';

/**
 * Componente para gestionar unidades (apartamentos/casas) de un sector.
 * Props:
 * - unidades: array de unidades [{id, nombre}]
 * - setUnidades: función para actualizar las unidades
 * - tipo: 'edificio' | 'manzana'
 */
export default function UnidadesManager({ unidades, setUnidades, tipo }) {
  const [nuevaUnidad, setNuevaUnidad] = useState('');

  const handleAgregarUnidad = (e) => {
    e.preventDefault();
    if (!nuevaUnidad.trim()) return;
    setUnidades([
      ...unidades,
      { id: Date.now(), nombre: nuevaUnidad.trim() },
    ]);
    setNuevaUnidad('');
  };

  const handleEliminarUnidad = (id) => {
    setUnidades(unidades.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1">
            {tipo === 'edificio' ? 'Apartamento' : 'Casa'}
          </label>
          <input
            className="border rounded px-3 py-2"
            value={nuevaUnidad}
            onChange={e => setNuevaUnidad(e.target.value)}
            placeholder={tipo === 'edificio' ? 'Ej: Apto 101' : 'Ej: Casa 2'}
            required
          />
        </div>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleAgregarUnidad}
        >
          Agregar {tipo === 'edificio' ? 'apartamento' : 'casa'}
        </button>
      </div>
      <ul className="list-disc pl-6">
        {unidades.length === 0 && <li className="text-gray-400">No hay unidades registradas.</li>}
        {unidades.map(u => (
          <li key={u.id} className="flex justify-between items-center">
            <span>{u.nombre}</span>
            <button
              className="text-red-600 hover:underline text-xs ml-2"
              onClick={() => handleEliminarUnidad(u.id)}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

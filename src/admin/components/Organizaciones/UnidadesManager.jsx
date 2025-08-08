import React, { useState } from 'react';
import PenIcon from '../../assets/images/pen.svg?react';
import TrashIcon from '../../assets/images/trash.svg?react';
import UnidadModal from './UnidadModal';

/**
 * Componente para gestionar unidades (apartamentos/casas) de un sector.
 * Props:
 * - unidades: array de unidades [{id, nombre}]
 * - setUnidades: función para actualizar las unidades
 * - sector: objeto con tipo y nombre
 * - onBack: función para regresar a SectoresManager
 */
export default function UnidadesManager({ unidades, setUnidades, sector, onBack }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalModo, setModalModo] = useState('agregar');
  const [unidadEdit, setUnidadEdit] = useState(null);

  // Determinar tipo de unidad
  const tipoUnidad = sector?.tipo === 'edificio' ? 'Apartamento' : 'Casa';
  const placeholderUnidad = sector?.tipo === 'edificio' ? 'Ej: Apto 101' : 'Ej: Casa 2';

  // Abrir modal para agregar
  const handleAbrirAgregar = () => {
    setUnidadEdit(null);
    setModalModo('agregar');
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleAbrirEditar = (unidad) => {
    setUnidadEdit(unidad);
    setModalModo('editar');
    setModalOpen(true);
  };

  // Guardar unidad (agregar o editar)
  const handleGuardarUnidad = (data) => {
    if (!data.identificador.trim() || !data.dni.trim()) return;
    if (modalModo === 'agregar') {
      setUnidades([
        ...unidades,
        { id: Date.now(), ...data },
      ]);
    } else {
      setUnidades(unidades.map(u => u.id === unidadEdit.id ? { ...data, id: u.id } : u));
    }
    setModalOpen(false);
    setUnidadEdit(null);
  };

  // Eliminar unidad
  const handleEliminarUnidad = (id) => {
    setUnidades(unidades.filter(u => u.id !== id));
  };

  return (
    <section className="px-2 sm:px-4 md:px-4 py-4 mx-auto w-full">
      <UnidadModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setUnidadEdit(null); }}
        onSave={handleGuardarUnidad}
        unidad={modalModo === 'editar' ? unidadEdit : null}
        modo={modalModo}
        tipoUnidad={tipoUnidad}
        placeholderUnidad={placeholderUnidad}
      />
      <button
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium"
        onClick={onBack}
      >
        ← Volver a Sectores
      </button>
      <h2 className="text-2xl font-bold mb-6 text-center">Unidades de {sector?.nombre}</h2>
      <div className="flex justify-end mb-6">
        <button
          className="bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800 flex items-center gap-2"
          onClick={handleAbrirAgregar}
        >
          Agregar {tipoUnidad.toLowerCase()}
        </button>
      </div>
      {/* Tabla de unidades */}
      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full bg-white rounded-xl shadow border border-gray-200">
          <thead className="bg-blue-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold border-b border-gray-200">Identificador</th>
              <th className="py-3 px-4 text-left font-semibold border-b border-gray-200">Propietario</th>
              <th className="py-3 px-4 text-left font-semibold border-b border-gray-200">DNI</th>
              <th className="py-3 px-4 text-center font-semibold border-b border-gray-200">Estado</th>
              <th className="py-3 px-4 text-center font-semibold border-b border-gray-200">Teléfono</th>
              <th className="py-3 px-4 text-center font-semibold border-b border-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {unidades.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">No hay unidades registradas.</td>
              </tr>
            ) : (
              unidades.map(u => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="py-3 px-4 align-middle whitespace-nowrap font-medium text-gray-900">{u.identificador}</td>
                  <td className="py-3 px-4 align-middle whitespace-nowrap">{u.propietario}</td>
                  <td className="py-3 px-4 align-middle whitespace-nowrap">{u.dni}</td>
                  <td className="py-3 px-4 align-middle text-center whitespace-nowrap">{u.estado}</td>
                  <td className="py-3 px-4 align-middle text-center whitespace-nowrap">{u.telefono}</td>
                  <td className="py-3 px-4 align-middle flex gap-2 justify-center">
                    <button className="text-purple-600 hover:text-purple-700 cursor-pointer" title="Editar" onClick={() => handleAbrirEditar(u)}>
                      <PenIcon className="w-5 h-5 inline" />
                    </button>
                    <button className="text-red-600 hover:text-red-700 cursor-pointer" title="Eliminar" onClick={() => handleEliminarUnidad(u.id)}>
                      <TrashIcon className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

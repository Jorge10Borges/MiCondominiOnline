import React, { useState } from 'react';
import UnidadesModal from './UnidadesModal';
import AddIcon from '../../assets/images/plusLarge.svg?react'; // Icono para agregar organización
import ShowIcon from '../../assets/images/eye.svg?react'; // Icono para mostrar unidades
import TrashIcon from '../../assets/images/trash.svg?react'; // Icono para eliminar sector

/**
 * Componente para gestionar sectores (edificios/manzanas) y sus unidades.
 */
export default function SectoresManager({ sectores, setSectores }) {
  const [nuevoSector, setNuevoSector] = useState({ tipo: '', nombre: '' });
  const [sectorActivo, setSectorActivo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sectorModal, setSectorModal] = useState(null);

  // Agregar sector
  const handleAgregarSector = (e) => {
    e.preventDefault();
    if (!nuevoSector.tipo || !nuevoSector.nombre) return;
    setSectores([
      ...sectores,
      {
        id: Date.now(),
        tipo: nuevoSector.tipo,
        nombre: nuevoSector.nombre,
        unidades: [],
      },
    ]);
    setNuevoSector({ tipo: '', nombre: '' });
  };

  // Eliminar sector
  const handleEliminarSector = (id) => {
    setSectores(sectores.filter(s => s.id !== id));
    if (sectorActivo === id) setSectorActivo(null);
  };

  // Mostrar el modal de unidades
  const handleShowUnidades = (sector) => {
    setSectorModal(sector);
    setModalOpen(true);
  };

  // Actualizar unidades de un sector desde el modal
  const handleSetUnidadesModal = (sectorId, unidades) => {
    setSectores(sectores.map(s =>
      s.id === sectorId ? { ...s, unidades } : s
    ));
  };

  return (
    <div className="space-y-6 col-span-full">
      <div className="grid gap-6 grid-cols-7 items-end">
        <div className="col-span-7 md:col-span-2">
          <label className="block font-semibold mb-1">Tipo de sector</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={nuevoSector.tipo}
            onChange={e => setNuevoSector({ ...nuevoSector, tipo: e.target.value })}
            required
          >
            <option value="">Seleccione</option>
            <option value="edificio">Edificio</option>
            <option value="manzana">Manzana</option>
          </select>
        </div>
        <div className="col-span-7 md:col-span-3">
          <label className="block font-semibold mb-1">Nombre/Identificador</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={nuevoSector.nombre}
            onChange={e => setNuevoSector({ ...nuevoSector, nombre: e.target.value })}
            placeholder="Ej: Edificio A, Manzana 1"
            required
          />
        </div>
        <div className="col-span-7 md:col-span-2 place-self-center md:place-self-start md:self-end">
          <button
            className="col-span-2 bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800 transition cursor-pointer"
            onClick={handleAgregarSector}
          >
            <AddIcon className="w-5 h-5 me-1 inline" />
            Agregar sector
          </button>
        </div>
      </div>
      <div className="mt-6 grid grid-col-1 sm:grid-cols-[repeat(auto-fill,minmax(278px,1fr))] place-items-center gap-4">
        {sectores.map(sector => (
          <div key={sector.id} className="border rounded p-4 bg-gray-50 w-full md:w-[278px] ">
            <div className="flex mb-2">
              <div className="flex-5 flex flex-col align-center justify-center">
                <div className="text-sm font-semibold capitalize text-center">
                  {sector.tipo}:
                </div>
                <div className="font-bold text-center">
                  {sector.nombre}
                </div>
                <div className="text-sm text-center text-gray-500">
                  {sector.unidades.length} {sector.tipo === 'edificio' ? 'apartamentos' : 'casas'}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <button
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => handleShowUnidades(sector)}
                >
                  <ShowIcon className="w-7 h-7 inline" />
                </button>
                <button
                  className="text-red-600 hover:underline cursor-pointer"
                  onClick={() => handleEliminarSector(sector.id)}
                >
                  <TrashIcon className="w-7 h-7 inline" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && sectorModal && (
        <UnidadesModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          unidades={sectorModal.unidades}
          setUnidades={unidades => handleSetUnidadesModal(sectorModal.id, unidades)}
          tipo={sectorModal.tipo}
          nombreSector={sectorModal.nombre}
        />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import SectorModal from '../components/Organizaciones/SectorModal';
// import UnidadesModal from '../components/Organizaciones/UnidadesModal'; // Eliminado: el archivo no existe
import AddIcon from '../assets/images/plusLarge.svg?react';
import ShowIcon from '../assets/images/eye.svg?react';
import TrashIcon from '../assets/images/trash.svg?react';

// Demo inicial de sectores
const sectoresDemo = [
  { id: 1, tipo: 'edificio', nombre: 'Edificio A', unidades: [] },
  { id: 2, tipo: 'manzana', nombre: 'Manzana 1', unidades: [] },
];

export default function SectoresPage() {
  const [sectores, setSectores] = useState(sectoresDemo);
  const [sectorModalOpen, setSectorModalOpen] = useState(false);
  const [sectorModalData, setSectorModalData] = useState(null);
  const [sectorModalModo, setSectorModalModo] = useState('agregar');
  const [unidadesModalOpen, setUnidadesModalOpen] = useState(false);
  const [unidadesModalSector, setUnidadesModalSector] = useState(null);

  // Abrir modal para agregar sector
  const handleOpenAgregarSector = () => {
    setSectorModalData({ tipo: '', nombre: '' });
    setSectorModalModo('agregar');
    setSectorModalOpen(true);
  };

  // Abrir modal para editar sector
  const handleOpenEditarSector = (sector) => {
    setSectorModalData(sector);
    setSectorModalModo('editar');
    setSectorModalOpen(true);
  };

  // Guardar sector (agregar o editar)
  const handleSaveSector = (data) => {
    if (sectorModalModo === 'agregar') {
      setSectores([
        ...sectores,
        {
          id: Date.now(),
          ...data,
          unidades: [],
        },
      ]);
    } else if (sectorModalModo === 'editar' && sectorModalData) {
      setSectores(sectores.map(s => s.id === sectorModalData.id ? { ...s, ...data } : s));
    }
  };

  // Eliminar sector
  const handleEliminarSector = (id) => {
    setSectores(sectores.filter(s => s.id !== id));
  };

  // Mostrar el modal de unidades
  const handleShowUnidades = (sector) => {
    setUnidadesModalSector(sector);
    setUnidadesModalOpen(true);
  };

  // Actualizar unidades de un sector desde el modal
  const handleSetUnidadesModal = (sectorId, unidades) => {
    setSectores(sectores.map(s =>
      s.id === sectorId ? { ...s, unidades } : s
    ));
  };

  return (
    <section className="px-2 sm:px-4 md:px-4 py-4 mx-auto w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Gestión de Sectores</h1>
        <button
          className="bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800 transition flex items-center gap-2"
          onClick={handleOpenAgregarSector}
        >
          <AddIcon className="w-5 h-5 inline" />
          Agregar sector
        </button>
      </div>
      <div className="overflow-x-auto mt-6">
        <table className="min-w-[500px] w-full bg-white rounded-xl shadow border border-gray-200">
          <thead className="bg-blue-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold border-b border-gray-200">Tipo</th>
              <th className="py-3 px-4 text-left font-semibold border-b border-gray-200">Nombre/Identificador</th>
              <th className="py-3 px-4 text-center font-semibold border-b border-gray-200">Unidades</th>
              <th className="py-3 px-4 text-center font-semibold border-b border-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sectores.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">No hay sectores registrados.</td>
              </tr>
            ) : (
              sectores.map(sector => (
                <tr key={sector.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="py-3 px-4 align-middle capitalize whitespace-nowrap font-medium text-gray-900">{sector.tipo}</td>
                  <td className="py-3 px-4 align-middle whitespace-nowrap">{sector.nombre}</td>
                  <td className="py-3 px-4 align-middle text-center whitespace-nowrap">{sector.unidades.length} {sector.tipo === 'edificio' ? 'apartamentos' : 'casas'}</td>
                  <td className="py-3 px-4 align-middle flex gap-2 justify-center">
                    <button className="text-blue-600 hover:text-blue-700 cursor-pointer" title="Ver unidades" onClick={() => handleShowUnidades(sector)}>
                      <ShowIcon className="w-5 h-5 inline" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-700 cursor-pointer" title="Editar" onClick={() => handleOpenEditarSector(sector)}>
                      <AddIcon className="w-5 h-5 inline rotate-90" />
                    </button>
                    <button className="text-red-600 hover:text-red-700 cursor-pointer" title="Eliminar" onClick={() => handleEliminarSector(sector.id)}>
                      <TrashIcon className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal de unidades */}
      {unidadesModalOpen && unidadesModalSector && (
        <UnidadesModal
          open={unidadesModalOpen}
          onClose={() => setUnidadesModalOpen(false)}
          unidades={unidadesModalSector.unidades}
          setUnidades={unidades => handleSetUnidadesModal(unidadesModalSector.id, unidades)}
          tipo={unidadesModalSector.tipo}
          nombreSector={unidadesModalSector.nombre}
        />
      )}
      {/* Modal para agregar/editar sector */}
      <SectorModal
        open={sectorModalOpen}
        onClose={() => setSectorModalOpen(false)}
        onSave={handleSaveSector}
        initialData={sectorModalData}
        modo={sectorModalModo}
      />
    </section>
  );
}

import React, { useState } from 'react';
import OrganizacionModal from '../components/organizaciones/OrganizacionModal';
import OrganizacionInfo from '../components/organizaciones/OrganizacionInfo';
import ConfirmDialog from '../../components/ConfirmDialog';
import TrashIcon from '../assets/images/trash.svg?react';
import PenIcon from '../assets/images/pen.svg?react';
import InfoIcon from '../assets/images/info.svg?react';


// Lista simulada de organizaciones
const organizacionesDemo = [
  {
    id: 1,
    nombre: 'Residencias Miranda',
    tipo: 'condominio',
    licencia_activa: true,
    fecha_expiracion: '2025-12-31',
  },
  {
    id: 2,
    nombre: 'Urbanización El Sol',
    tipo: 'urbanizacion',
    licencia_activa: false,
    fecha_expiracion: '2024-10-15',
  },
];


export default function Organizaciones() {
  // Aquí se validará el rol de superusuario para mostrar el contenido

  const [orgs, setOrgs] = useState(organizacionesDemo);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalModo, setModalModo] = useState('agregar');
  const [modalData, setModalData] = useState(null);
  // Estado para página de información
  const [infoView, setInfoView] = useState(false);
  const [infoData, setInfoData] = useState(null);

  // Estado para confirmación de eliminación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);

  // Abrir modal para agregar
  const handleAgregar = () => {
    setModalModo('agregar');
    setModalData({});
    setModalOpen(true);
  };

  // Ir a la página de información
  const handleInfo = (org) => {
    setInfoData(org);
    setInfoView(true);
  };

  // Volver a la tabla principal
  const handleBack = () => {
    setInfoView(false);
    setInfoData(null);
  };

  // Abrir modal para editar
  const handleEditar = (org) => {
    setModalModo('editar');
    setModalData(org);
    setModalOpen(true);
  };

  // Confirmar eliminación
  const handleEliminar = (org) => {
    setOrgToDelete(org);
    setConfirmOpen(true);
  };

  // Ejecutar eliminación
  const handleDeleteConfirmed = () => {
    setOrgs(orgs.filter(o => o.id !== orgToDelete.id));
    setConfirmOpen(false);
    setOrgToDelete(null);
  };

  // Guardar (agregar o editar)
  const handleSave = (data) => {
    if (modalModo === 'agregar') {
      setOrgs([
        ...orgs,
        {
          id: orgs.length ? Math.max(...orgs.map(o => o.id)) + 1 : 1,
          ...data,
          licencia_activa: true,
        },
      ]);
    } else if (modalModo === 'editar' && modalData) {
      setOrgs(orgs.map(o => o.id === modalData.id ? { ...o, ...data } : o));
    }
    setModalOpen(false);
  };

  if (infoView && infoData) {
    return (
      <section className="px-2 sm:px-4 md:px-4 py-4 mx-auto w-full">
        <button
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium"
          onClick={handleBack}
        >
          ← Volver a la lista
        </button>
        <OrganizacionInfo nombre={infoData.nombre} />
      </section>
    );
  }

  return (
    <section className="px-2 sm:px-4 md:px-4 py-4 mx-auto w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Gestión de Organizaciones</h1>
        <button
          type="button"
          className="bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800 transition"
          onClick={handleAgregar}
        >
          + Agregar Organización
        </button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm md:text-base">
          <thead>
            <tr className="bg-blue-100">
              <th className="py-3 px-2 md:px-4 text-left whitespace-nowrap">Nombre</th>
              <th className="py-3 px-2 md:px-4 text-center whitespace-nowrap">Tipo</th>
              <th className="py-3 px-2 md:px-4 text-center whitespace-nowrap">Licencia</th>
              <th className="py-3 px-2 md:px-4 text-center whitespace-nowrap">Expira</th>
              <th className="py-3 px-2 md:px-4 text-center whitespace-nowrap w-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">No hay organizaciones registradas.</td>
              </tr>
            ) : (
              orgs.map(org => (
                <tr key={org.id} className="border-b hover:bg-blue-50 transition">
                  <td className="py-2 px-2 md:px-4 break-words max-w-[120px] md:max-w-none">{org.nombre}</td>
                  <td className="py-2 px-2 md:px-4 capitalize text-center">{org.tipo}</td>
                  <td className="py-2 px-2 md:px-4 text-center">
                    {org.licencia_activa ? (
                      <span className="text-green-600 font-semibold">Activa</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Vencida</span>
                    )}
                  </td>
                  <td className="py-2 px-2 md:px-4 text-center">{org.fecha_expiracion}</td>
                  <td className="py-2 px-2 md:px-4 flex gap-2 justify-center whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-700 cursor-pointer" title="Información" onClick={() => handleInfo(org)}>
                      <InfoIcon className="w-5 h-5 inline" />
                    </button>
                    <button className="text-yellow-500 hover:text-yellow-600 cursor-pointer" title="Editar" onClick={() => handleEditar(org)}>
                      <PenIcon className="w-5 h-5 inline" />
                    </button>
                    <button className="text-red-600 hover:text-red-700 cursor-pointer" title="Eliminar" onClick={() => handleEliminar(org)}>
                      <TrashIcon className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-2 text-xs text-gray-500 sm:hidden text-center">Desliza la tabla para ver todas las columnas</div>
      </div>
      <OrganizacionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={modalData}
        modo={modalModo}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar organización"
        message={orgToDelete ? `¿Seguro que deseas eliminar "${orgToDelete.nombre}"? Esta acción no se puede deshacer.` : ''}
        onCancel={() => { setConfirmOpen(false); setOrgToDelete(null); }}
        onConfirm={handleDeleteConfirmed}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import OrganizacionModal from '../components/Organizaciones/OrganizacionModal';
import OrganizacionInfo from '../components/Organizaciones/OrganizacionInfo';
import ConfirmDialog from '../../components/ConfirmDialog';
import TrashIcon from '../assets/images/trash.svg?react';
import PenIcon from '../assets/images/pen.svg?react';
import InfoIcon from '../assets/images/info.svg?react';
import AddIcon from '../assets/images/plusLarge.svg?react'; // Icono para agregar organización
import QrIcon from '../assets/images/qr.svg?react'; // Icono QR para sectores
import SectoresManager from '../components/Organizaciones/SectoresManager';
  



export default function Organizaciones() {
  // Aquí se validará el rol de superusuario para mostrar el contenido

  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/organizaciones.php`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Error al cargar organizaciones');
          setOrgs([]);
        } else {
          setOrgs(data.organizaciones || []);
        }
      } catch (err) {
        setError('Error de conexión con el servidor');
        setOrgs([]);
      }
      setLoading(false);
    };
    fetchOrgs();
  }, []);
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

  // Estado para SectoresManager
  const [sectoresOpen, setSectoresOpen] = useState(false);
  const [sectoresOrg, setSectoresOrg] = useState(null);

  // Abrir modal de SectoresManager
  const handleSectores = (org) => {
    setSectoresOrg(org);
    setSectoresOpen(true);
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

  if (sectoresOpen && sectoresOrg) {
    // Función para actualizar los sectores de la organización seleccionada
    const handleSetSectores = (sectoresActualizados) => {
      setOrgs(orgs.map(o =>
        o.id === sectoresOrg.id ? { ...o, sectores: sectoresActualizados } : o
      ));
      setSectoresOrg({ ...sectoresOrg, sectores: sectoresActualizados });
    };
    return (
      <section className="px-2 sm:px-4 md:px-4 py-4 mx-auto w-full">
        <button
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium"
          onClick={() => { setSectoresOpen(false); setSectoresOrg(null); }}
        >
          ← Volver a Organizaciones
        </button>
        <SectoresManager
          sectores={sectoresOrg.sectores || []}
          setSectores={handleSetSectores}
        />
      </section>
    );
  }

  return (
    <section className="sm:px-4 md:px-4 py-4 mx-auto max-w-full w-full relative">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Gestión de Organizaciones</h1>
        <button
          type="button"
          className="bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800 transition"
          onClick={handleAgregar}
        >
          <AddIcon className="w-5 h-5 me-1 inline" />
          Agregar Organización
        </button>
      </div>
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto w-full max-w-full">
        {loading && <div className="py-8 text-center text-gray-400">Cargando organizaciones...</div>}
        {error && <div className="py-8 text-center text-red-500 font-semibold">{error}</div>}
        <table className="min-w-[600px] w-full" >
          <thead className="sticky top-0 z-10">
            <tr className="bg-blue-100">
              <th scope="col" className="py-3 px-2 md:px-4 text-left font-semibold border-b border-gray-200">Nombre</th>
              <th scope="col" className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Tipo</th>
              <th scope="col" className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Licencia</th>
              <th scope="col" className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Expira</th>
              <th scope="col" className="py-3 px-2 md:px-4 text-center w-1 font-semibold border-b border-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">No hay organizaciones registradas.</td>
              </tr>
            ) : (
              orgs.map(org => (
                <tr key={org.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="py-3 px-2 md:px-4 align-middle whitespace-nowrap font-medium text-gray-900">{org.nombre}</td>
                  <td className="py-3 px-2 md:px-4 align-middle capitalize text-center whitespace-nowrap">{org.tipo}</td>
                  <td className="py-3 px-2 md:px-4 align-middle text-center">
                    {org.estado_licencia === 'activa' ? (
                      <span className="text-green-600 font-semibold">Activa</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Vencida</span>
                    )}
                  </td>
                  <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{org.fecha_expiracion}</td>
                  <td className="py-3 px-2 md:px-4 align-middle flex gap-2 justify-center">
                    <button className="text-blue-600 hover:text-blue-700 cursor-pointer" title="Información" onClick={() => handleInfo(org)}>
                      <InfoIcon className="w-5 h-5 inline" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-700 cursor-pointer" title="Sectores" onClick={() => handleSectores(org)}>
                      <QrIcon className="w-5 h-5 inline" />
                    </button>
                    <button className="text-yellow-500 hover:text-yellow-600 cursor-pointer" title="Editar" onClick={() => handleEditar(org)}>
                      <PenIcon className="w-5 h-5 inline" />
                    </button>
                    <button className="text-red-600 hover:text-red-700 cursor-pointer" title="Eliminar" onClick={() => handleEliminar(org)}>
                      <TrashIcon className="w-5 h-5 inline" />
                    </button>
                  </td>
      {/* Aquí iría el modal SectoresManager, ejemplo: */}
      {/* <SectoresManager open={sectoresOpen} onClose={() => setSectoresOpen(false)} org={sectoresOrg} /> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-2 text-xs text-gray-500 sm:hidden text-center select-none pointer-events-none">
          <span className="inline-block bg-gradient-to-r from-white via-gray-100 to-white px-2 py-1 rounded shadow-sm">
            Desliza la tabla para ver todas las columnas
          </span>
        </div>
      </div>
      <OrganizacionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={modalData}
        modo={modalModo}
      />
      {/* SectoresManager ya se muestra como página completa, no como modal. Eliminado para evitar error de .map sobre undefined. */}
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar organización"
        message={orgToDelete ? `¿Seguro que deseas eliminar \"${orgToDelete.nombre}\"? Esta acción no se puede deshacer.` : ''}
        onCancel={() => { setConfirmOpen(false); setOrgToDelete(null); }}
        onConfirm={handleDeleteConfirmed}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </section>
  );
}

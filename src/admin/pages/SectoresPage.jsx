import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import SectorModal from '../components/Organizaciones/SectorModal';
import AddIcon from '../assets/images/plusLarge.svg?react';
import TrashIcon from '../assets/images/trash.svg?react';
import PenIcon from '../assets/images/pen.svg?react';
import BuildingsIcon from '../assets/images/buildings.svg?react';
import ConfirmDialog from '../components/ConfirmDialog';
import ToastMessage from '../components/ToastMessage';

export default function SectoresPage({ organizacion }) {
  // Redirección a index
  const redirectToIndex = () => {
    window.location.href = '/';
  };
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sectorModalOpen, setSectorModalOpen] = useState(false);
  const [sectorModalData, setSectorModalData] = useState(null);
  const [sectorModalModo, setSectorModalModo] = useState('agregar');
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sectorAEliminar, setSectorAEliminar] = useState(null);

  useEffect(() => {
    const fetchSectores = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/sectores.php?organizacion_id=${organizacion.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.error === 'Token inválido o expirado' && data.detalle === 'Expired token') {
          redirectToIndex();
          return;
        }
        if (!res.ok) {
          setError(data.error || 'Error al cargar sectores');
          setSectores([]);
        } else {
          setSectores(data.sectores || []);
        }
      } catch (err) {
        setError('Error de conexión con el servidor');
        setSectores([]);
      }
      setLoading(false);
    };
    fetchSectores();
  }, [organizacion.id]);

  const handleOpenAgregarSector = () => {
    setSectorModalData({ tipo: '', nombre: '', numero_unidades: '' });
    setSectorModalModo('agregar');
    setSectorModalOpen(true);
  };

  const handleOpenEditarSector = (sector) => {
    setSectorModalData(sector);
    setSectorModalModo('editar');
    setSectorModalOpen(true);
  };

  const handleSaveSector = async (data) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const payload = sectorModalModo === 'editar'
        ? { ...data, organizacion_id: organizacion.id, id: sectorModalData.id }
        : { ...data, organizacion_id: organizacion.id };
      const res = await fetch(`${API_BASE_URL}/sectores.php`, {
        method: sectorModalModo === 'agregar' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.error === 'Token inválido o expirado' && result.detalle === 'Expired token') {
        redirectToIndex();
        return;
      }
      if (!res.ok) {
        setError(result.error || 'Error al guardar sector');
        setToast({ show: true, type: 'error', message: result.error || 'Error al guardar sector' });
      } else {
        // Recargar sectores
        const resSectores = await fetch(`${API_BASE_URL}/sectores.php?organizacion_id=${organizacion.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const dataSectores = await resSectores.json();
        if (dataSectores.error === 'Token inválido o expirado' && dataSectores.detalle === 'Expired token') {
          redirectToIndex();
          return;
        }
        setSectores(dataSectores.sectores || []);
        setSectorModalOpen(false);
        setToast({ show: true, type: 'success', message: 'Sector guardado correctamente' });
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setToast({ show: true, type: 'error', message: 'Error de conexión con el servidor' });
    }
    setLoading(false);
  };

  const handleEliminarSector = async (id) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/sectores.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await res.json();
      if (result.error === 'Token inválido o expirado' && result.detalle === 'Expired token') {
        redirectToIndex();
        return;
      }
      if (!res.ok) {
        setError(result.error || 'Error al eliminar sector');
        setToast({ show: true, type: 'error', message: result.error || 'Error al eliminar sector' });
      } else {
        // Recargar sectores
        const resSectores = await fetch(`${API_BASE_URL}/sectores.php?organizacion_id=${organizacion.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const dataSectores = await resSectores.json();
        if (dataSectores.error === 'Token inválido o expirado' && dataSectores.detalle === 'Expired token') {
          redirectToIndex();
          return;
        }
        setSectores(dataSectores.sectores || []);
        setToast({ show: true, type: 'success', message: 'Sector eliminado correctamente' });
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setToast({ show: true, type: 'error', message: 'Error de conexión con el servidor' });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, type: '', message: '' }), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  return (
    <section className="px-2 sm:px-4 md:px-4 py-4 mx-auto w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Sectores de la organización: <span className="text-blue-700">{organizacion.nombre}</span></h2>
      <button
        type="button"
        className="bg-Regalia text-white px-4 py-2 mb-4 rounded shadow hover:bg-purple-800 transition"
        onClick={handleOpenAgregarSector}
      >
        <AddIcon className="w-5 h-5 inline mr-1 align-middle" />
        <span className="align-middle">Agregar Sector</span>
      </button>
      {loading && <div className="py-8 text-center text-gray-400">Cargando sectores...</div>}
      {error && <div className="py-8 text-center text-red-500 font-semibold">{error}</div>}
      {toast.show && <ToastMessage type={toast.type} message={toast.message} />}
      {!error && (
        <table className="min-w-[400px] w-full mb-6">
          <thead>
            <tr className="bg-blue-100">
              <th className="py-3 px-4 text-left font-semibold border-b">Nombre</th>
              <th className="py-3 px-4 text-left font-semibold border-b">Tipo</th>
              <th className="py-3 px-4 text-center font-semibold border-b">N° Unidades</th>
              <th className="py-3 px-4 text-center font-semibold border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sectores.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">No hay sectores registrados.</td>
              </tr>
            ) : (
              sectores.map(sector => (
                <tr key={sector.id} className="border-b hover:bg-blue-50 transition">
                  <td className="py-3 px-4 align-middle font-medium text-gray-900">{sector.nombre}</td>
                  <td className="py-3 px-4 align-middle text-gray-700 capitalize">{sector.tipo}</td>
                  <td className="py-3 px-4 align-middle text-center font-semibold">{sector.numero_unidades}</td>
                  <td className="py-3 px-4 align-middle text-center">
                    <button className="text-blue-500 hover:text-blue-600 cursor-pointer mr-2 p-1" title="Asignar unidades" onClick={() => alert(`Asignar unidades a: ${sector.nombre}`)}>
                      <BuildingsIcon className="w-5 h-5" />
                    </button>
                    <button className="text-yellow-500 hover:text-yellow-600 cursor-pointer mr-2 p-1" title="Editar" onClick={() => handleOpenEditarSector(sector)}>
                      <PenIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-600 cursor-pointer p-1"
                      title="Eliminar"
                      onClick={() => {
                        setSectorAEliminar(sector);
                        setConfirmOpen(true);
                      }}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      <SectorModal
        open={sectorModalOpen}
        onClose={() => setSectorModalOpen(false)}
        onSave={handleSaveSector}
        initialData={sectorModalData}
        modo={sectorModalModo}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar eliminación"
        message={sectorAEliminar ? `¿Seguro que deseas eliminar el sector "${sectorAEliminar.nombre}"? Esta acción no se puede deshacer.` : ''}
        onCancel={() => {
          setConfirmOpen(false);
          setSectorAEliminar(null);
        }}
        onConfirm={async () => {
          if (sectorAEliminar) {
            await handleEliminarSector(sectorAEliminar.id);
            setConfirmOpen(false);
            setSectorAEliminar(null);
          }
        }}
      />
    </section>
  );
}
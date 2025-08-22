import React, { useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import PenIcon from '../assets/images/pen.svg?react';
import TrashIcon from '../assets/images/trash.svg?react';
import UserIcon from '../assets/images/user-hand-up.svg?react';
import ConfirmDialog from '../components/ConfirmDialog';
import ToastMessage from '../components/ToastMessage';
import UnidadEditModal from '../components/unidades/UnidadEditModal';
import UsuarioUnidadModal from '../components/unidades/UsuarioUnidadModal';

export default function UnidadesPage() {
  const [numUnidades, setNumUnidades] = useState('');
  const [sectores, setSectores] = useState([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState('');
  const { usuario } = useContext(AuthContext);
  const [unidades, setUnidades] = useState([]);
  const [organizaciones, setOrganizaciones] = useState([]);
  const [orgSeleccionada, setOrgSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editUnidad, setEditUnidad] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [userOpen, setUserOpen] = useState(false);
  const [userUnidad, setUserUnidad] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    // Obtener organizaciones asignadas al usuario logueado
    if (!usuario) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    const orgsUrl = (usuario?.rol === 'superusuario' || usuario?.rol === 'root')
      ? `${API_BASE_URL}/organizaciones.php`
      : `${API_BASE_URL}/organizaciones.php?usuario_id=${usuario.id}`;
    fetch(orgsUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          if (data.error && (data.error.includes('Token inválido') || data.error.includes('expirado'))) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/';
            return;
          }
          setError(data.error || 'Error al cargar organizaciones');
          setOrganizaciones([]);
        } else {
          setOrganizaciones(data.organizaciones || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar organizaciones');
        setLoading(false);
      });
  }, [usuario]);
  // Obtener sectores al seleccionar organización
  useEffect(() => {
    if (!orgSeleccionada) {
      setSectores([]);
      setUnidades([]);
      setSectorSeleccionado('');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/sectores.php?organizacion_id=${orgSeleccionada}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          if (data.error && (data.error.includes('Token inválido') || data.error.includes('expirado'))) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/';
            return;
          }
          setError(data.error || 'Error al cargar sectores');
          setSectores([]);
        } else {
          setSectores(data.sectores || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar sectores');
        setLoading(false);
      });
  }, [orgSeleccionada]);

  // Filtrar unidades por sector seleccionado y actualizar numUnidades
  useEffect(() => {
    if (!sectorSeleccionado) {
      setUnidades([]);
      setNumUnidades('');
      return;
    }
    // Buscar el sector seleccionado y actualizar numUnidades
    const sectorObj = sectores.find(sec => sec.id === parseInt(sectorSeleccionado));
    setNumUnidades(sectorObj ? sectorObj.numero_unidades : '');
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/unidades.php?sector_id=${sectorSeleccionado}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          if (data.error && (data.error.includes('Token inválido') || data.error.includes('expirado'))) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/';
            return;
          }
          setError(data.error || 'Error al cargar unidades');
          setUnidades([]);
        } else {
          setUnidades(data.unidades || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar unidades');
        setLoading(false);
      });
  }, [sectorSeleccionado, sectores]);

  return (
    <section className="sm:px-4 md:px-4 py-4 mx-auto max-w-full w-full relative">
      <div className="">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Gestión de Unidades</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-auto mb-2 sm:mb-0">
            <label htmlFor="orgSelect" className="block text-sm font-medium text-gray-700 mb-1">Organización</label>
            <select
              id="orgSelect"
              className="w-full sm:w-64 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              value={orgSeleccionada}
              onChange={e => setOrgSeleccionada(e.target.value)}
            >
              <option value="">Seleccione una organización</option>
              {organizaciones.map(org => (
                <option key={org.id} value={org.id}>{org.nombre}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-auto mb-2 sm:mb-0">
            <label htmlFor="sectorSelect" className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select
              id="sectorSelect"
              className="w-full sm:w-64 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              value={sectorSeleccionado}
              onChange={e => setSectorSeleccionado(e.target.value)}
              disabled={!sectores.length}
            >
              <option value="">Seleccione un sector</option>
              {sectores.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.nombre}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-auto mb-2 sm:mb-0">
            <label htmlFor="numUnidades" className="block text-sm font-medium text-gray-700 mb-1">N° Unidades</label>
            <input
              id="numUnidades"
              type="number"
              className="w-full sm:w-32 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 text-center"
              value={numUnidades}
              readOnly
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto w-full max-w-full">
        {loading && <div className="py-8 text-center text-gray-400">Cargando unidades...</div>}
        {error && <div className="py-8 text-center text-red-500 font-semibold">{error}</div>}
        <table className="min-w-[600px] w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-blue-100">
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200 w-1 whitespace-nowrap">#</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Unidad</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Propietario</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Telefono</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Alícuota (%)</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Usuario</th>
              <th className="py-3 px-2 md:px-4 text-center w-1 font-semibold border-b border-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {numUnidades ? (
              Array.from({ length: numUnidades }, (_, i) => {
                const orden = i + 1;
                const unidad = unidades.find(u => parseInt(u.numero_orden) === orden);
                return (
                  <tr key={orden} className="border-b border-gray-100 hover:bg-blue-50 transition">
                    <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap font-semibold w-1">{orden}</td>
                    <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{unidad ? unidad.identificador : <span className="text-gray-400">N/E</span>}</td>
                    <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{unidad && unidad.propietario_nombre ? unidad.propietario_nombre : <span className="text-gray-400">N/E</span>}</td>
                    <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{unidad && unidad.telefono ? unidad.telefono : <span className="text-gray-400">N/E</span>}</td>
                    <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">
                      {unidad && unidad.alicuota !== undefined && unidad.alicuota !== null && !Number.isNaN(parseFloat(unidad.alicuota))
                        ? `${parseFloat(unidad.alicuota).toFixed(2)}%`
                        : <span className="text-gray-400">N/E</span>}
                    </td>
                    <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{unidad && unidad.usuario_email ? unidad.usuario_email : <span className="text-gray-400">N/E</span>}</td>
                    <td className="py-3 px-2 md:px-4 align-middle flex gap-2 justify-center">
                      <button
                        className="text-yellow-500 hover:text-yellow-600 cursor-pointer"
                        title="Editar"
                        onClick={() => {
                          if (unidad) {
                            setEditUnidad(unidad);
                          } else {
                            setEditUnidad({ id: null, sector_id: parseInt(sectorSeleccionado), numero_orden: orden, identificador: '', telefono: null, propietario_nombre: '' });
                          }
                          setEditOpen(true);
                        }}
                      >
                        <PenIcon className="w-5 h-5 inline" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Usuario"
                        disabled={!unidad}
                        onClick={() => { if (!unidad) return; setUserUnidad(unidad); setUserOpen(true); }}
                      >
                        <UserIcon className="w-5 h-5 inline" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar"
                        disabled={!unidad}
                        onClick={() => { if (!unidad) return; setToDelete(unidad); setConfirmOpen(true); }}
                      >
                        <TrashIcon className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">Seleccione sector para ver unidades.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
  <UnidadEditModal
        open={editOpen}
        unidad={editUnidad}
        onClose={() => { setEditOpen(false); setEditUnidad(null); }}
        onSave={async (payload) => {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/unidades.php`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                id: payload.id ?? null,
                sector_id: payload.sector_id,
                numero_orden: payload.numero_orden,
                identificador: payload.identificador,
                telefono: payload.telefono ?? null,
                propietario: payload.propietario ?? null,
                alicuota: typeof payload.alicuota === 'number' ? payload.alicuota : 0,
              }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data?.error) {
              const msg = data?.error || 'Error al guardar la unidad';
              if (msg.includes('Token inválido') || msg.includes('expirado')) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = '/';
                return;
              }
              setError(msg);
              return;
            }
            const u = data.unidad;
            if (!u) { setError('Respuesta inválida del servidor'); return; }
            setUnidades((prev) => {
              const idx = prev.findIndex(x => x.id === u.id || (!x.id && x.numero_orden === u.numero_orden) || x.numero_orden === u.numero_orden);
              if (idx >= 0) {
                const copia = [...prev];
                copia[idx] = { ...copia[idx], ...u };
                return copia;
              }
              return [...prev, u];
            });
            setEditOpen(false);
            setEditUnidad(null);
          } catch (e) {
            setError('Error de red al guardar la unidad');
          }
        }}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar unidad"
        message={toDelete ? `¿Seguro que deseas eliminar "${toDelete.identificador}"?` : ''}
        onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/unidades.php?id=${toDelete.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data?.error) {
              const msg = data?.error || 'Error al eliminar la unidad';
              if (msg.includes('Token inválido') || msg.includes('expirado')) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = '/';
                return;
              }
              setError(msg);
              return;
            }
            setUnidades(prev => prev.filter(u => u.id !== toDelete.id).map(u => u.id === toDelete.id ? { ...u, usuario_email: null } : u));
            setConfirmOpen(false);
            setToDelete(null);
            setToast({ show: true, message: 'Unidad eliminada correctamente', type: 'success' });
          } catch (e) {
            setError('Error de red al eliminar la unidad');
          }
        }}
      />
      <UsuarioUnidadModal
        open={userOpen}
        unidad={userUnidad}
        onClose={() => { setUserOpen(false); setUserUnidad(null); }}
        apiBaseUrl={API_BASE_URL}
        token={localStorage.getItem('token')}
        onAssigned={({ unidadId, usuarioEmail }) => {
          if (!unidadId || !usuarioEmail) return;
          setUnidades(prev => prev.map(u => u.id === unidadId ? { ...u, usuario_email: usuarioEmail } : u));
          setToast({ show: true, message: 'Usuario asignado a la unidad', type: 'success' });
        }}
      />
      <ToastMessage
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </section>
  );
}

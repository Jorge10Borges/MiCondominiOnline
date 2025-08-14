import React, { useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import PlusIcon from '../assets/images/plus.svg?react';

export default function UnidadesPage() {
  const { usuario } = useContext(AuthContext);
  const [unidades, setUnidades] = useState([]);
  const [organizaciones, setOrganizaciones] = useState([]);
  const [orgSeleccionada, setOrgSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Obtener organizaciones asignadas al usuario logueado
    if (!usuario) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/organizaciones.php?usuario_id=${usuario.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setOrganizaciones(data.organizaciones || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar organizaciones');
        setLoading(false);
      });
  }, [usuario]);
  // Filtrar unidades por organización seleccionada
  useEffect(() => {
    if (!orgSeleccionada) {
      setUnidades([]);
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/unidades.php?organizacion_id=${orgSeleccionada}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setUnidades(data.unidades || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar unidades');
        setLoading(false);
      });
  }, [orgSeleccionada]);

  return (
    <section className="sm:px-4 md:px-4 py-4 mx-auto max-w-full w-full relative">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Gestión de Unidades</h1>
        <button
          type="button"
          className="bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800 transition"
        >
          <PlusIcon className="w-5 h-5 me-1 inline" />
          Nueva Unidad
        </button>
      </div>
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto w-full max-w-full">
        {loading && <div className="py-8 text-center text-gray-400">Cargando unidades...</div>}
        {error && <div className="py-8 text-center text-red-500 font-semibold">{error}</div>}
        <table className="min-w-[600px] w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-blue-100">
              <th className="py-3 px-2 md:px-4 text-left font-semibold border-b border-gray-200">Organización</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Sector</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Unidad</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Propietario</th>
              <th className="py-3 px-2 md:px-4 text-center w-1 font-semibold border-b border-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {unidades.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">No hay unidades registradas.</td>
              </tr>
            ) : (
              unidades.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="py-3 px-2 md:px-4 align-middle whitespace-nowrap font-medium text-gray-900">{u.organizacion}</td>
                  <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{u.sector}</td>
                  <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{u.nombre}</td>
                  <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{u.propietario}</td>
                  <td className="py-3 px-2 md:px-4 align-middle flex gap-2 justify-center">
                    <button className="text-yellow-500 hover:text-yellow-600 cursor-pointer" title="Editar">
                      {/* Icono de editar */}
                      <span className="material-icons">edit</span>
                    </button>
                    <button className="text-red-600 hover:text-red-700 cursor-pointer" title="Eliminar">
                      {/* Icono de eliminar */}
                      <span className="material-icons">delete</span>
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

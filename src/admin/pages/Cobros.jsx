import React, { useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import PeriodoMesAnio from '../components/Gastos/PeriodoMesAnio';

export default function CobrosPage() {
  const { usuario } = useContext(AuthContext);
  const [organizaciones, setOrganizaciones] = useState([]);
  const [orgSeleccionada, setOrgSeleccionada] = useState('');
  const [sectores, setSectores] = useState([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState('');
  const [unidades, setUnidades] = useState([]);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [cobros, setCobros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!usuario) return;
    const token = localStorage.getItem('token');
    const url = (usuario?.rol === 'superusuario' || usuario?.rol === 'root')
      ? `${API_BASE_URL}/organizaciones.php`
      : `${API_BASE_URL}/organizaciones.php?usuario_id=${usuario.id}`;
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          if (data?.error && (data.error.includes('Token inválido') || data.error.includes('expirado'))) {
            localStorage.removeItem('token'); localStorage.removeItem('usuario'); window.location.href = '/'; return;
          }
          setError(data?.error || 'Error al cargar organizaciones'); setOrganizaciones([]);
        } else {
          setOrganizaciones(data.organizaciones || []);
        }
      })
      .catch(() => setError('Error al cargar organizaciones'));
  }, [usuario]);

  useEffect(() => {
    setSectores([]); setSectorSeleccionado(''); setUnidades([]); setUnidadSeleccionada(''); setCobros([]);
    if (!orgSeleccionada) return;
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/sectores.php?organizacion_id=${orgSeleccionada}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          if (data?.error && (data.error.includes('Token inválido') || data.error.includes('expirado'))) {
            localStorage.removeItem('token'); localStorage.removeItem('usuario'); window.location.href = '/'; return;
          }
          setError(data?.error || 'Error al cargar sectores'); setSectores([]);
        } else {
          setSectores(data.sectores || []);
        }
      })
      .catch(() => setError('Error al cargar sectores'));
  }, [orgSeleccionada]);

  useEffect(() => {
    setUnidades([]); setUnidadSeleccionada('');
    if (!sectorSeleccionado) return;
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/unidades.php?sector_id=${sectorSeleccionado}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          if (data?.error && (data.error.includes('Token inválido') || data.error.includes('expirado'))) {
            localStorage.removeItem('token'); localStorage.removeItem('usuario'); window.location.href = '/'; return;
          }
          setError(data?.error || 'Error al cargar unidades'); setUnidades([]);
        } else {
          setUnidades(data.unidades || []);
        }
      })
      .catch(() => setError('Error al cargar unidades'));
  }, [sectorSeleccionado]);

  const cargarCobros = () => {
    if (!orgSeleccionada) return;
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ organizacion_id: orgSeleccionada });
    if (sectorSeleccionado) params.append('sector_id', sectorSeleccionado);
    if (unidadSeleccionada) params.append('unidad_id', unidadSeleccionada);
    if (periodo) {
      const [yy, mm] = periodo.split('-');
      const start = `${yy}-${mm}-01`;
      const lastDay = new Date(Number(yy), Number(mm), 0).getDate();
      const end = `${yy}-${mm}-${String(lastDay).padStart(2, '0')}`;
      params.append('desde', start);
      params.append('hasta', end);
    }
    fetch(`${API_BASE_URL}/cobros.php?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(async res => {
        const data = await res.json();
        if (!res.ok || data?.error) {
          const msg = data?.error || 'Error al cargar cobros';
          if (msg.includes('Token inválido') || msg.includes('expirado')) {
            localStorage.removeItem('token'); localStorage.removeItem('usuario'); window.location.href = '/'; return;
          }
          setError(msg); setCobros([]);
        } else {
          setCobros(data.cobros || []);
        }
        setLoading(false);
      })
      .catch(() => { setError('Error al cargar cobros'); setLoading(false); });
  };

  return (
    <section className="sm:px-4 md:px-4 py-4 mx-auto max-w-full w-full relative">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Cobros</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organización</label>
          <select className="w-64 px-3 py-2 border rounded focus:outline-none focus:ring" value={orgSeleccionada} onChange={e => setOrgSeleccionada(e.target.value)}>
            <option value="">Seleccione una organización</option>
            {organizaciones.map(org => <option key={org.id} value={org.id}>{org.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
          <select className="w-64 px-3 py-2 border rounded focus:outline-none focus:ring" value={sectorSeleccionado} onChange={e => setSectorSeleccionado(e.target.value)} disabled={!sectores.length}>
            <option value="">Todos</option>
            {sectores.map(sec => <option key={sec.id} value={sec.id}>{sec.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
          <select className="w-64 px-3 py-2 border rounded focus:outline-none focus:ring" value={unidadSeleccionada} onChange={e => setUnidadSeleccionada(e.target.value)} disabled={!unidades.length}>
            <option value="">Todas</option>
            {unidades.map(u => <option key={u.id} value={u.id}>{u.identificador}</option>)}
          </select>
        </div>
        <div>
          <PeriodoMesAnio value={periodo} onChange={setPeriodo} />
        </div>
        <div className="flex items-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={cargarCobros} disabled={!orgSeleccionada}>Buscar</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
        {loading && <div className="py-8 text-center text-gray-400">Cargando cobros...</div>}
        {error && <div className="py-8 text-center text-red-500 font-semibold">{error}</div>}
        <table className="min-w-[700px] w-full">
          <thead>
            <tr className="bg-blue-100">
              <th className="py-3 px-4 text-left font-semibold border-b">Fecha</th>
              <th className="py-3 px-4 text-left font-semibold border-b">Unidad</th>
              <th className="py-3 px-4 text-right font-semibold border-b">Monto</th>
              <th className="py-3 px-4 text-left font-semibold border-b">Método</th>
              <th className="py-3 px-4 text-left font-semibold border-b">Referencia</th>
              <th className="py-3 px-4 text-left font-semibold border-b">Recibo</th>
            </tr>
          </thead>
          <tbody>
            {cobros.length ? cobros.map(c => (
              <tr key={c.id} className="border-b hover:bg-blue-50">
                <td className="py-2 px-4">{c.fecha}</td>
                <td className="py-2 px-4">{c.unidad_identificador || c.unidad_id}</td>
                <td className="py-2 px-4 text-right">{Number(c.monto).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-2 px-4">{c.metodo || '-'}</td>
                <td className="py-2 px-4">{c.referencia || '-'}</td>
                <td className="py-2 px-4">{c.recibo_num || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

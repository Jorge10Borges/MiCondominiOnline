import React, { useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import ToastMessage from '../components/ToastMessage';
import GastoModal from '../components/Gastos/GastoModal';
import PeriodoMesAnio from '../components/Gastos/PeriodoMesAnio';

export default function GastosPage() {
  const { usuario } = useContext(AuthContext);
  const [organizaciones, setOrganizaciones] = useState([]);
  const [orgSeleccionada, setOrgSeleccionada] = useState('');
  const [sectores, setSectores] = useState([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState('');
  const [periodo, setPeriodo] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0,7); // YYYY-MM
  }); // formato YYYY-MM (mes actual por defecto)
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Tasas de cambio (BCV)
  const [tasas, setTasas] = useState({ loading: false, error: '', vesPorUsd: null, vesPorEur: null, fecha: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // Modal de alta
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoEdit, setGastoEdit] = useState(null);
  const totalUsd = gastos.reduce((acc, g) => acc + (g.monto_usd != null ? parseFloat(g.monto_usd) : 0), 0);
  const totalVes = (tasas.vesPorUsd ? totalUsd * tasas.vesPorUsd : null);

  // Cargar organizaciones según el rol
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

  // Cargar tasas de cambio actuales (VES y EUR) a partir de tipos_cambio.php
  const cargarTasas = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setTasas(t => ({ ...t, loading: true, error: '' }));
    // Pedimos las tasas vigentes para VES y EUR (usd_por_unidad)
    const fetchMoneda = (mon) => fetch(`${API_BASE_URL}/tipos_cambio.php?moneda=${mon}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .catch(() => ({ ok: false, data: { error: 'Error de red' } }));
    Promise.all([fetchMoneda('VES'), fetchMoneda('EUR')])
      .then(([vesRes, eurRes]) => {
        if (!vesRes.ok || vesRes.data?.error) {
          setTasas(t => ({ ...t, loading: false, error: vesRes.data?.error || 'Error al cargar tasa VES' }));
          return;
        }
        // usd_por_unidad(VES) = USD por 1 VES => para mostrar VES por USD invertimos
        const usdPorUnidadVES = vesRes.data.tasa.usd_por_unidad;
        const vesPorUsd = usdPorUnidadVES ? (1 / parseFloat(usdPorUnidadVES)) : null;
  const fechaVigencia = vesRes.data.tasa.efectivo_desde; // formato 'YYYY-MM-DD HH:MM:SS'
        let vesPorEur = null;
        if (eurRes.ok && !eurRes.data?.error) {
          // usd_por_unidad(EUR) = USD por 1 EUR
            const usdPorUnidadEUR = parseFloat(eurRes.data.tasa.usd_por_unidad);
            // Para VES por EUR: (USD por 1 EUR) / (USD por 1 VES) => usdPorUnidadEUR / usdPorUnidadVES
            vesPorEur = (usdPorUnidadEUR && usdPorUnidadVES) ? (usdPorUnidadEUR / usdPorUnidadVES) : null;
        }
        setTasas({ loading: false, error: '', vesPorUsd, vesPorEur, fecha: fechaVigencia });
      })
      .catch(() => setTasas(t => ({ ...t, loading: false, error: 'Error al cargar tasas' })));
  };

  useEffect(() => {
    if (usuario) cargarTasas();
  }, [usuario]);

  // Cargar sectores al elegir organización
  useEffect(() => {
    setSectores([]); setSectorSeleccionado(''); setGastos([]);
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

  // Buscar gastos
  const cargarGastos = () => {
    if (!orgSeleccionada || !sectorSeleccionado || !periodo) return;
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ organizacion_id: orgSeleccionada });
    params.append('sector_id', sectorSeleccionado);
    // Si hay período, convertirlo a rango de fechas del mes
  if (periodo) {
      const [yy, mm] = periodo.split('-');
      const start = `${yy}-${mm}-01`;
      // Calcular fin de mes
      const lastDay = new Date(Number(yy), Number(mm), 0).getDate();
      const end = `${yy}-${mm}-${String(lastDay).padStart(2, '0')}`;
      params.append('desde', start);
      params.append('hasta', end);
  }
    fetch(`${API_BASE_URL}/gastos.php?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(async res => {
        const data = await res.json();
        if (!res.ok || data?.error) {
          const msg = data?.error || 'Error al cargar gastos';
          if (msg.includes('Token inválido') || msg.includes('expirado')) {
            localStorage.removeItem('token'); localStorage.removeItem('usuario'); window.location.href = '/'; return;
          }
          setError(msg); setGastos([]);
        } else {
          setGastos(data.gastos || []);
        }
        setLoading(false);
      })
      .catch(() => { setError('Error al cargar gastos'); setLoading(false); });
  };

  // Crear gasto (desde modal)
  const crearGasto = async (payload) => {
    try {
      setError('');
    if (!orgSeleccionada || !sectorSeleccionado || !payload?.fecha || payload?.monto == null) { setError('Complete organización, sector, fecha y monto'); return; }
      const token = localStorage.getItem('token');
      const isEdit = !!payload?.id;
      const url = isEdit ? `${API_BASE_URL}/gastos.php?id=${payload.id}` : `${API_BASE_URL}/gastos.php`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          organizacion_id: parseInt(orgSeleccionada),
          sector_id: parseInt(sectorSeleccionado),
          fecha: payload.fecha,
          monto: parseFloat(payload.monto),
          moneda: payload.moneda || 'USD',
          categoria: payload.categoria || null,
          descripcion: payload.descripcion || null,
          proveedor: payload.proveedor || null,
          comprobante: payload.comprobante || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        const msg = data?.error || (isEdit ? 'Error al actualizar gasto' : 'Error al crear gasto');
        if (msg.includes('Token inválido') || msg.includes('expirado')) { localStorage.removeItem('token'); localStorage.removeItem('usuario'); window.location.href = '/'; return; }
        setError(msg); return;
      }
      setToast({ show: true, message: isEdit ? 'Gasto actualizado' : 'Gasto creado', type: 'success' });
      setModalOpen(false); setGastoEdit(null);
      cargarGastos();
    } catch {
      setError('Error de red al guardar gasto');
    }
  };

  // Eliminar gasto
  const eliminarGasto = async () => {
    if (!toDelete) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/gastos.php?id=${toDelete.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        const msg = data?.error || 'Error al eliminar gasto';
        if (msg.includes('Token inválido') || msg.includes('expirado')) { localStorage.removeItem('token'); localStorage.removeItem('usuario'); window.location.href = '/'; return; }
        setError(msg); return;
      }
      setConfirmOpen(false); setToDelete(null);
      setToast({ show: true, message: 'Gasto eliminado', type: 'success' });
      cargarGastos();
    } catch {
      setError('Error de red al eliminar gasto');
    }
  };

  // Auto-carga cuando se seleccionan organización, sector y periodo
  useEffect(() => {
    if (orgSeleccionada && sectorSeleccionado && periodo) {
      cargarGastos();
    }
  }, [orgSeleccionada, sectorSeleccionado, periodo]);

  return (
    <section className="sm:px-4 md:px-4 py-4 mx-auto max-w-full w-full relative">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Gastos</h1>
      </div>

      {/* Panel de tasas de cambio */}
      <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div className="text-sm">
          {(() => {
            // Mostrar siempre hora de Caracas
            let vigenciaCaracas = null;
            if (tasas.fecha) {
              try {
                const raw = tasas.fecha.replace(' ', 'T');
                const d = new Date(raw);
                const fmtOpts = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'America/Caracas' };
                vigenciaCaracas = new Intl.DateTimeFormat('es-VE', fmtOpts).format(d);
              } catch (_) { vigenciaCaracas = tasas.fecha; }
            }
            return <div className="font-semibold mb-1">Tasas BCV {vigenciaCaracas && <span className="font-normal text-gray-500">(Caracas: {vigenciaCaracas})</span>}</div>;
          })()}
          {tasas.error && <div className="text-red-600">{tasas.error}</div>}
          {!tasas.error && (
            <div className="flex flex-wrap gap-4 text-gray-700">
              <span>USD: {tasas.loading ? '...' : (tasas.vesPorUsd ? `Bs ${tasas.vesPorUsd.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}` : '—')}</span>
              <span>EUR: {tasas.loading ? '...' : (tasas.vesPorEur ? `Bs ${tasas.vesPorEur.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}` : '—')}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={cargarTasas} className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50" disabled={tasas.loading}>Refrescar tasa</button>
        </div>
      </div>

      {/* Filtros */}
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
            <option value="">Seleccione un sector</option>
            {sectores.map(sec => <option key={sec.id} value={sec.id}>{sec.nombre}</option>)}
          </select>
        </div>
        <div>
          <PeriodoMesAnio value={periodo} onChange={setPeriodo} />
        </div>
        <div className="flex items-end">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50" onClick={() => setModalOpen(true)} disabled={!orgSeleccionada || !sectorSeleccionado}>Nuevo gasto</button>
        </div>
      </div>

      {/* Alta por modal */}
      {/* <div className="flex justify-end mb-4">
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50" onClick={() => setModalOpen(true)} disabled={!orgSeleccionada}>Nuevo gasto</button>
      </div> */}

      {/* Resultados */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between px-4 pt-4 pb-2 text-sm text-gray-700">
          <div className="font-semibold">Totales del mes seleccionado</div>
          <div className="flex gap-6">
            <span>Total USD: {totalUsd.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}</span>
            <span>Total VES: {totalVes != null ? totalVes.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2}) : '—'}</span>
          </div>
        </div>
        {loading && <div className="py-8 text-center text-gray-400">Cargando gastos...</div>}
        {error && <div className="py-8 text-center text-red-500 font-semibold">{error}</div>}
        <table className="min-w-[700px] w-full">
          <thead>
            <tr className="bg-blue-100">
              <th className="py-3 px-4 text-left font-semibold border-b">Fecha</th>
              <th className="py-3 px-4 text-left font-semibold border-b">Categoría</th>
              <th className="py-3 px-4 text-left font-semibold border-b">Descripción</th>
              <th className="py-3 px-4 text-left font-semibold border-b">Proveedor</th>
              <th className="py-3 px-4 text-right font-semibold border-b">Monto</th>
              <th className="py-3 px-4 text-right font-semibold border-b">Moneda</th>
              <th className="py-3 px-4 text-right font-semibold border-b">Monto (USD)</th>
              <th className="py-3 px-4 text-center font-semibold border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.length ? gastos.map(g => (
              <tr key={g.id} className="border-b hover:bg-blue-50">
                <td className="py-2 px-4">{g.fecha}</td>
                <td className="py-2 px-4">{g.categoria || '-'}</td>
                <td className="py-2 px-4">{g.descripcion || '-'}</td>
                <td className="py-2 px-4">{g.proveedor || '-'}</td>
                <td className="py-2 px-4 text-right">{Number(g.monto).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-2 px-4 text-right">{g.moneda || 'USD'}</td>
                <td className="py-2 px-4 text-right">{(g.monto_usd != null ? Number(g.monto_usd) : Number(g.monto)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-2 px-4 text-center">
                  <div className="flex gap-3 justify-center">
                    <button className="text-blue-700 hover:text-blue-800" onClick={() => { setGastoEdit(g); setModalOpen(true); }}>Editar</button>
                    <button className="text-red-600 hover:text-red-700" onClick={() => { setToDelete(g); setConfirmOpen(true); }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-400">Sin resultados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar gasto"
        message={toDelete ? `¿Seguro que deseas eliminar el gasto del ${toDelete.fecha} por ${Number(toDelete.monto).toFixed(2)}?` : ''}
        onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
        onConfirm={eliminarGasto}
      />
      <ToastMessage
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
      <GastoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={crearGasto}
        organizacionId={orgSeleccionada}
  gasto={gastoEdit}
  tasas={{ vesPorUsd: tasas.vesPorUsd, vesPorEur: tasas.vesPorEur }}
      />
    </section>
  );
}

import React, { useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';
import { authFetch } from '../../services/apiClient';
import { AuthContext } from '../../context/AuthContext';
import PeriodoMesAnio from '../components/Gastos/PeriodoMesAnio';

// Vista agrupada por periodo con drill-down hacia /admin/recibos
export default function RecibosResumen(){
  const { usuario } = useContext(AuthContext);
  const [organizacionId, setOrganizacionId] = useState('');
  const [orgs, setOrgs] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [sectorId, setSectorId] = useState('');
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [periodos,setPeriodos] = useState([]);
  const [refetchToggle,setRefetchToggle] = useState(0);
  // Para navegación rápida a detalle
  const [periodoBusqueda,setPeriodoBusqueda] = useState('');

  // Cargar organizaciones
  useEffect(()=>{ if(!usuario) return; (async()=>{
    try {
      const base = `${API_BASE_URL}/organizaciones.php`;
      const url = (usuario.rol==='superusuario' || usuario.rol==='root') ? base : `${base}?usuario_id=${usuario.id}`;
      const r = await authFetch(url); const d = await r.json();
      if(!r.ok||d.error){ setError(d.error||'Error organizaciones'); setOrgs([]);return; }
      setOrgs(d.organizaciones||[]);
      if((d.organizaciones||[]).length===1) setOrganizacionId(String(d.organizaciones[0].id));
    } catch(e){ setError('Red organizaciones'); }
  })(); },[usuario]);

  // Cargar sectores al elegir organización
  useEffect(()=>{ if(!organizacionId){ setSectores([]); setSectorId(''); return; } (async()=>{ try { const r= await authFetch(`${API_BASE_URL}/sectores.php?organizacion_id=${organizacionId}`); const d= await r.json(); if(r.ok) setSectores(d.sectores||[]); } catch{} })(); },[organizacionId]);

  // Cargar resumen periodos
  useEffect(()=>{ if(!organizacionId) return; (async()=>{ setLoading(true); setError(''); try { const params = new URLSearchParams({ organizacion_id: organizacionId }); if(sectorId) params.set('sector_id', sectorId); const r= await authFetch(`${API_BASE_URL}/recibos_resumen.php?${params.toString()}`); const d= await r.json(); if(!r.ok||d.error){ setError(d.error||'Error resumen'); setPeriodos([]); } else { setPeriodos(d.resumen_periodos||[]); } } catch(e){ setError('Red resumen'); setPeriodos([]);} setLoading(false); })(); },[organizacionId, sectorId, refetchToggle]);

  const irADetalle = (periodo)=>{ const url = `/admin/recibos?organizacion_id=${organizacionId}&periodo=${periodo}${sectorId?`&sector_id=${sectorId}`:''}`; window.location.href = url; };
  const buscarPeriodo = ()=>{ if(!periodoBusqueda) return; const p = periodos.find(p=>p.periodo===periodoBusqueda); if(p) irADetalle(p.periodo); else alert('Periodo no listado (limite 12 últimos)'); };

  return (
    <section className="px-2 sm:px-4 py-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Resumen de Recibos por Periodo</h1>
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Organización</label>
          <select className="w-full border rounded px-2 py-1" value={organizacionId} onChange={e=>setOrganizacionId(e.target.value)}>
            <option value="">-- Selecciona --</option>
            {orgs.map(o=> <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sector</label>
          <select className="w-full border rounded px-2 py-1" value={sectorId} onChange={e=>setSectorId(e.target.value)} disabled={!sectores.length}>
            <option value="">Todos</option>
            {sectores.map(s=> <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ir a periodo (YYYY-MM)</label>
          <div className="flex gap-2">
            <input className="border rounded px-2 py-1 w-32" placeholder="2025-08" value={periodoBusqueda} onChange={e=>setPeriodoBusqueda(e.target.value)} />
            <button className="bg-Regalia text-white px-3 py-1 rounded" onClick={buscarPeriodo} disabled={!periodoBusqueda}>Ir</button>
          </div>
        </div>
        <div className="flex items-end">
          <button className="bg-blue-600 text-white px-3 py-2 rounded mr-2" onClick={()=>setRefetchToggle(v=>v+1)} disabled={loading||!organizacionId}>Refrescar</button>
        </div>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div className="text-gray-500">Cargando...</div>}
      {!loading && !error && periodos.length===0 && organizacionId && <div className="text-gray-400">Sin periodos / recibos.</div>}

      {periodos.length>0 && (
        <div className="overflow-x-auto bg-white border rounded shadow">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="bg-blue-100">
                <th className="p-2 text-left">Periodo</th>
                <th className="p-2 text-left">Estado Periodo</th>
                <th className="p-2 text-left">Recibos</th>
                <th className="p-2 text-left">Emitidos</th>
                <th className="p-2 text-left">Parcial</th>
                <th className="p-2 text-left">Pagados</th>
                <th className="p-2 text-left">Anulados</th>
                <th className="p-2 text-left">Total USD</th>
                <th className="p-2 text-left">Pagado USD</th>
                <th className="p-2 text-left">Saldo USD</th>
                <th className="p-2 text-left">% Cobrado</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {periodos.map(p=> (
                <tr key={p.periodo_id} className="border-b hover:bg-blue-50">
                  <td className="p-2 font-semibold">{p.periodo}</td>
                  <td className="p-2 capitalize">{p.estado_periodo}</td>
                  <td className="p-2">{p.total_recibos}</td>
                  <td className="p-2">{p.estados.emitido}</td>
                  <td className="p-2">{p.estados.pagado_parcial}</td>
                  <td className="p-2">{p.estados.pagado_total}</td>
                  <td className="p-2">{p.estados.anulado}</td>
                  <td className="p-2">{p.monto_total_usd.toFixed(2)}</td>
                  <td className="p-2">{p.pagado_usd.toFixed(2)}</td>
                  <td className="p-2">{p.saldo_usd.toFixed(2)}</td>
                  <td className="p-2">{p.porcentaje_cobrado.toFixed(2)}%</td>
                  <td className="p-2">
                    <button className="text-blue-600 hover:underline mr-2" onClick={()=>irADetalle(p.periodo)}>Detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

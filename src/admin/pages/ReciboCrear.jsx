import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { authFetch } from '../../services/apiClient';
import PeriodoMesAnio from '../components/Gastos/PeriodoMesAnio';

export default function ReciboCrear(){
  const { usuario } = useContext(AuthContext);
  const [organizacionId,setOrganizacionId] = useState('');
  const [orgs,setOrgs] = useState([]);
  const [sectores,setSectores] = useState([]);
  const [sectorId,setSectorId] = useState('');
  const [periodo,setPeriodo] = useState(()=> new Date().toISOString().slice(0,7));
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [gastos,setGastos] = useState([]);
  const [loadingGastos,setLoadingGastos] = useState(false);
  const [errorGastos,setErrorGastos] = useState('');

  useEffect(()=>{ if(!usuario) return; (async()=>{ try { const base=`${API_BASE_URL}/organizaciones.php`; const url=(usuario.rol==='superusuario'||usuario.rol==='root')?base:`${base}?usuario_id=${usuario.id}`; const r= await authFetch(url); const d= await r.json(); if(r.ok&&!d.error){ setOrgs(d.organizaciones||[]); if((d.organizaciones||[]).length===1) setOrganizacionId(String(d.organizaciones[0].id)); } } catch(e){/*ignore*/} })(); },[usuario]);

  // Cargar sectores al seleccionar organización
  useEffect(()=>{ if(!organizacionId){ setSectores([]); setSectorId(''); return; } (async()=>{ try{ const r= await authFetch(`${API_BASE_URL}/sectores.php?organizacion_id=${organizacionId}`); const d= await r.json(); if(r.ok && !d.error){ setSectores(d.sectores||[]); if((d.sectores||[]).length===1) setSectorId(String(d.sectores[0].id)); } }catch(e){/*ignore*/} })(); },[organizacionId]);

  const iniciar = ()=>{ alert(`Flujo en construcción para org=${organizacionId} sector=${sectorId} periodo=${periodo}`); };

  // Cargar todos los gastos del sector (sin filtrar por periodo). El periodo solo se usará al construir el recibo.
  useEffect(()=>{
    if(!organizacionId || !sectorId) { setGastos([]); return; }
    const cargar = async ()=>{
      setLoadingGastos(true); setErrorGastos('');
      try {
        const url = new URL(`${API_BASE_URL}/gastos.php`);
        url.searchParams.set('organizacion_id', organizacionId);
        url.searchParams.set('sector_id', sectorId);
        const r = await authFetch(url.toString());
        const d = await r.json();
        if(!r.ok || d.error){ setErrorGastos(d.error||'Error cargando gastos'); setGastos([]); }
        else { setGastos(d.gastos||[]); }
      } catch(e){ setErrorGastos('Error de red gastos'); setGastos([]); }
      setLoadingGastos(false);
    };
    cargar();
  },[organizacionId, sectorId]);

  return (
    <section className="px-2 sm:px-4 py-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Crear Recibo (Borrador)</h1>
      <div className="grid md:grid-cols-4 gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Organización</label>
          <select className="w-full border rounded px-2 py-2" value={organizacionId} onChange={e=>setOrganizacionId(e.target.value)}>
            <option value="">-- Selecciona --</option>
            {orgs.map(o=> <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sector</label>
          <select className="w-full border rounded px-2 py-2" value={sectorId} onChange={e=>setSectorId(e.target.value)} disabled={!sectores.length}>
            {sectores.map(s=> <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Periodo</label>
          <PeriodoMesAnio value={periodo} onChange={setPeriodo} />
        </div>
        <div className="flex items-end">
          <button className="bg-Regalia text-white px-4 py-2 rounded disabled:opacity-40" disabled={!organizacionId || !sectorId || loading} onClick={iniciar}>Iniciar Construcción</button>
        </div>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="mb-6">
  <h2 className="text-lg font-semibold mb-2">Gastos del Sector (sin filtrar por periodo)</h2>
        {loadingGastos && <div className="text-gray-500 text-sm">Cargando gastos...</div>}
        {errorGastos && <div className="text-red-600 text-sm mb-2">{errorGastos}</div>}
        {!loadingGastos && !errorGastos && gastos.length===0 && organizacionId && (
          <div className="text-gray-400 text-sm">No hay gastos para este sector.</div>
        )}
        {gastos.length>0 && (
          <div className="overflow-x-auto border rounded bg-white shadow">
            <table className="min-w-[850px] w-full text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-left">Categoría</th>
                  <th className="p-2 text-left">Descripción</th>
                  <th className="p-2 text-left">Moneda</th>
                  <th className="p-2 text-left">Monto</th>
                  <th className="p-2 text-left">Monto USD</th>
                  {/* Columna Sector eliminada */}
                </tr>
              </thead>
              <tbody>
                {gastos.map(g=> (
                  <tr key={g.id} className="border-b last:border-b-0 hover:bg-blue-50">
                    <td className="p-2 text-xs whitespace-nowrap">{g.fecha}</td>
                    <td className="p-2 text-xs">{g.categoria}</td>
                    <td className="p-2 text-xs">{g.descripcion}</td>
                    <td className="p-2 text-xs">{g.moneda}</td>
                    <td className="p-2 text-xs">{parseFloat(g.monto).toFixed(2)}</td>
                    <td className="p-2 text-xs font-semibold">{parseFloat(g.monto_usd).toFixed(2)}</td>
                    {/* Celda sector eliminada */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 max-w-2xl">
        Esta pantalla permitirá seleccionar los gastos pendientes (no asociados aún) que formarán parte del recibo global del periodo elegido arriba. El listado muestra todos los gastos del sector; luego filtraremos/ marcaremos cuáles entran al recibo. (Placeholder inicial)
      </p>
      <p className="text-sm text-gray-600 max-w-2xl">
        Falta poder seleccionar los gastos que van en el recibo a construir
      </p>
      <p className="text-sm text-gray-600 max-w-2xl">
        Falta una seccion donde se vea el numero de unidades del sector seleccionado clasificados segun la prorrateo de  la alicuota
      </p>
    </section>
  );
}

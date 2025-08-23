// BACKUP_BEFORE_RESUMEN_VIEW - 2025-08-23
// Copia de seguridad del componente original RecibosAdmin antes de introducir la vista de resumen por periodo.
// Si deseas revertir, reemplaza el contenido de RecibosAdmin.jsx por este archivo.

import React, { useEffect, useState, useMemo, useContext } from 'react';
import { API_BASE_URL } from '../../config';
import ConfirmDialog from '../../components/ConfirmDialog';
import { AuthContext } from '../../context/AuthContext';
import { authFetch } from '../../services/apiClient';
import PeriodoMesAnio from '../components/Gastos/PeriodoMesAnio';

const metodosPago = [ 'transferencia','efectivo','pago_movil','tarjeta','otro' ];

export default function RecibosAdmin(){
  const { usuario } = useContext(AuthContext);
  const [organizacionId,setOrganizacionId] = useState('');
  const [periodo,setPeriodo] = useState(()=> new Date().toISOString().slice(0,7));
  const [recibos,setRecibos] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [resumen,setResumen] = useState({});
  const [expanded,setExpanded] = useState({});
  const [showPago,setShowPago] = useState(false);
  const [pagoRecibo,setPagoRecibo] = useState(null);
  const [pagoData,setPagoData] = useState({ monto_usd:'', metodo:'transferencia', referencia:'', observacion:'' });
  const [confirmAnular,setConfirmAnular] = useState(false);
  const [reciboAnular,setReciboAnular] = useState(null);
  const [orgs,setOrgs] = useState([]);
  const [sectores,setSectores] = useState([]);
  const [sectorId,setSectorId] = useState('');

  useEffect(()=>{ (async()=>{
    if(!usuario) return;
    try {
      const base = `${API_BASE_URL}/organizaciones.php`;
      const url = (usuario.rol==='superusuario' || usuario.rol==='root') ? base : `${base}?usuario_id=${usuario.id}`;
      const r= await authFetch(url);
      const d= await r.json();
      if(!r.ok || d.error){ setError(d.error||'Error cargando organizaciones'); setOrgs([]); return; }
      const list = d.organizaciones||[]; setOrgs(list);
      if(list.length===1) { setOrganizacionId(String(list[0].id)); }
    } catch(e){ setError('Fallo de red organizaciones'); setOrgs([]); }
  })(); },[usuario]);

  useEffect(()=>{ if(!organizacionId){ setSectores([]); setSectorId(''); return; } (async()=>{ try { const r= await authFetch(`${API_BASE_URL}/sectores.php?organizacion_id=${organizacionId}`); const d= await r.json(); if(r.ok) setSectores(d.sectores||[]); } catch(e){ /* ignore */ } })(); },[organizacionId]);

  const puedeCargar = organizacionId && periodo;

  const fetchRecibos = async ()=>{
    if(!puedeCargar) return;
    setLoading(true); setError('');
    try {
      const url = new URL(`${API_BASE_URL}/recibos.php`);
      url.searchParams.set('organizacion_id',organizacionId);
      url.searchParams.set('periodo',periodo);
      if(sectorId) url.searchParams.set('sector_id',sectorId);
      url.searchParams.set('with_detalles','1');
      const res = await authFetch(url.toString());
      const data = await res.json();
      if(!res.ok){ setError(data.error||'Error al cargar recibos'); setRecibos([]); setResumen({}); }
      else { setRecibos(data.recibos||[]); setResumen(data.resumen||{}); }
    } catch(e){ setError('Error de red'); }
    setLoading(false);
  };

  useEffect(()=>{ fetchRecibos(); /* eslint-disable-next-line */ },[organizacionId,periodo]);

  const toggleExpand = (id)=> setExpanded(prev=>({...prev,[id]:!prev[id]}));

  const resumenList = useMemo(()=>{
    return Object.entries(resumen).map(([estado,info])=>({estado, ...info}));
  },[resumen]);

  const abrirPago = (rec)=>{ setPagoRecibo(rec); setPagoData({ monto_usd:'', metodo:'transferencia', referencia:'', observacion:'' }); setShowPago(true); };
  const registrarPago = async ()=>{
    if(!pagoRecibo) return;
    const monto = parseFloat(pagoData.monto_usd);
    if(!monto||monto<=0){ alert('Monto inválido'); return; }
    try {
      const res = await authFetch(`${API_BASE_URL}/recibos_acciones.php`,{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ accion:'registrar_pago', recibo_id:pagoRecibo.id, monto_usd:monto, metodo:pagoData.metodo, referencia:pagoData.referencia, observacion:pagoData.observacion }) });
      const data= await res.json(); if(!res.ok||data.error){ alert(data.error||'Error'); }
      else { setShowPago(false); fetchRecibos(); }
    } catch(e){ alert('Error de red'); }
  };

  const solicitarAnular = (rec)=>{ setReciboAnular(rec); setConfirmAnular(true); };
  const anularRecibo = async ()=>{
    if(!reciboAnular) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/recibos_acciones.php`,{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ accion:'anular_recibo', recibo_id:reciboAnular.id, motivo:'Anulado desde UI' }) });
      const data= await res.json(); if(!res.ok||data.error){ alert(data.error||'Error'); }
      else { setConfirmAnular(false); fetchRecibos(); }
    } catch(e){ alert('Error de red'); }
  };

  const estadosBadge = {
    emitido:'bg-blue-100 text-blue-700',
    pagado_parcial:'bg-yellow-100 text-yellow-700',
    pagado_total:'bg-green-100 text-green-700',
    anulado:'bg-red-100 text-red-700'
  };

  return (
    <section className="px-2 sm:px-4 py-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Recibos</h1>
      <div className="grid gap-4 md:grid-cols-4 mb-4">
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
        <div className="flex items-end">
          <PeriodoMesAnio value={periodo} onChange={setPeriodo} />
        </div>
        <div className="flex items-end gap-2">
          <button className="bg-Regalia text-white px-3 py-2 rounded disabled:opacity-40" disabled={!puedeCargar||loading} onClick={fetchRecibos}>Cargar</button>
        </div>
      </div>

      {resumenList.length>0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {resumenList.map(r=> (
            <div key={r.estado} className="px-3 py-2 rounded bg-gray-100 text-sm shadow flex flex-col">
              <span className="font-semibold capitalize">{r.estado.replace('_',' ')}</span>
              <span className="text-xs">Recibos: {r.count}</span>
              <span className="text-xs">USD: {r.monto_usd?.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div className="text-gray-500">Cargando...</div>}

      {!loading && recibos.length===0 && puedeCargar && <div className="text-gray-400">No hay recibos.</div>}

      <div className="overflow-x-auto bg-white border rounded shadow">
        <table className="min-w-[900px] w-full">
          <thead>
            <tr className="bg-blue-100 text-sm">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Unidad</th>
              <th className="p-2 text-left">Periodo</th>
              <th className="p-2 text-left">Monto USD</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2 text-left">Emitido</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {recibos.map(r=>{
              const detalles = expanded[r.id] ? r.detalles||[] : [];
              return (
                <React.Fragment key={r.id}>
                  <tr className="border-b hover:bg-blue-50">
                    <td className="p-2 cursor-pointer underline" onClick={()=>toggleExpand(r.id)}>{r.numero}</td>
                    <td className="p-2">{r.unidad_id}</td>
                    <td className="p-2">{r.periodo}</td>
                    <td className="p-2 font-semibold">{parseFloat(r.monto_total_usd).toFixed(2)}</td>
                    <td className="p-2"><span className={`px-2 py-1 text-xs rounded ${estadosBadge[r.estado]||'bg-gray-100 text-gray-600'}`}>{r.estado.replace('_',' ')}</span></td>
                    <td className="p-2 text-xs">{r.creado_en?.slice(0,19).replace('T',' ')}</td>
                    <td className="p-2 flex gap-2 text-xs">
                      <button className="text-blue-600 hover:underline" onClick={()=>toggleExpand(r.id)}>{expanded[r.id]?'Ocultar':'Detalles'}</button>
                      {r.estado!=='anulado' && r.estado!=='pagado_total' && (
                        <button className="text-green-600 hover:underline" onClick={()=>abrirPago(r)}>Pago</button>
                      )}
                      {r.estado!=='anulado' && (
                        <button className="text-red-600 hover:underline" onClick={()=>solicitarAnular(r)}>Anular</button>
                      )}
                    </td>
                  </tr>
                  {detalles.length>0 && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="p-0">
                        <div className="p-3">
                          <h4 className="font-semibold mb-2 text-sm">Detalles</h4>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left bg-gray-100">
                                <th className="p-1">Subcat</th>
                                <th className="p-1">Descripción</th>
                                <th className="p-1">Monto USD</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detalles.map(d=> (
                                <tr key={d.id} className="border-b last:border-b-0">
                                  <td className="p-1">{d.subcategoria}</td>
                                  <td className="p-1">{d.descripcion}</td>
                                  <td className="p-1 text-right">{parseFloat(d.monto_usd).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {showPago && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-5 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Registrar Pago Recibo #{pagoRecibo?.numero}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Monto USD</label>
                <input type="number" step="0.01" className="w-full border rounded px-2 py-1" value={pagoData.monto_usd} onChange={e=>setPagoData({...pagoData,monto_usd:e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Método</label>
                <select className="w-full border rounded px-2 py-1" value={pagoData.metodo} onChange={e=>setPagoData({...pagoData,metodo:e.target.value})}>
                  {metodosPago.map(m=> <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Referencia</label>
                <input type="text" className="w-full border rounded px-2 py-1" value={pagoData.referencia} onChange={e=>setPagoData({...pagoData,referencia:e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Observación</label>
                <textarea className="w-full border rounded px-2 py-1" rows={2} value={pagoData.observacion} onChange={e=>setPagoData({...pagoData,observacion:e.target.value})}></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="px-3 py-1.5 text-sm rounded bg-gray-200 hover:bg-gray-300" onClick={()=>setShowPago(false)}>Cancelar</button>
              <button className="px-3 py-1.5 text-sm rounded bg-green-600 hover:bg-green-700 text-white" onClick={registrarPago}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmAnular}
        title="Anular recibo"
        message={reciboAnular?`¿Seguro que deseas anular el recibo #${reciboAnular.numero}?`:'¿Confirmar?'}
        onCancel={()=>{ setConfirmAnular(false); setReciboAnular(null); }}
        onConfirm={anularRecibo}
        confirmText="Sí, anular"
        cancelText="Cancelar"
      />

    </section>
  );
}

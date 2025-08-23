import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { authFetch } from '../../services/apiClient';
import PeriodoMesAnio from '../components/Gastos/PeriodoMesAnio';

export default function ReciboCrear(){
  const { usuario } = useContext(AuthContext);
  const [organizacionId,setOrganizacionId] = useState('');
  const [orgs,setOrgs] = useState([]);
  const [periodo,setPeriodo] = useState(()=> new Date().toISOString().slice(0,7));
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');

  useEffect(()=>{ if(!usuario) return; (async()=>{ try { const base=`${API_BASE_URL}/organizaciones.php`; const url=(usuario.rol==='superusuario'||usuario.rol==='root')?base:`${base}?usuario_id=${usuario.id}`; const r= await authFetch(url); const d= await r.json(); if(r.ok&&!d.error){ setOrgs(d.organizaciones||[]); if((d.organizaciones||[]).length===1) setOrganizacionId(String(d.organizaciones[0].id)); } } catch(e){/*ignore*/} })(); },[usuario]);

  const iniciar = ()=>{ alert('Aquí irá el flujo de selección de gastos → snapshot → prorrateo → emisión.'); };

  return (
    <section className="px-2 sm:px-4 py-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Crear Recibo (Borrador)</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Organización</label>
          <select className="w-full border rounded px-2 py-1" value={organizacionId} onChange={e=>setOrganizacionId(e.target.value)}>
            <option value="">-- Selecciona --</option>
            {orgs.map(o=> <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Periodo</label>
          <PeriodoMesAnio value={periodo} onChange={setPeriodo} />
        </div>
        <div className="flex items-end">
          <button className="bg-Regalia text-white px-4 py-2 rounded disabled:opacity-40" disabled={!organizacionId || loading} onClick={iniciar}>Iniciar Construcción</button>
        </div>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <p className="text-sm text-gray-600 max-w-2xl">
        Esta pantalla permitirá seleccionar los gastos del periodo que formarán parte del recibo global. Luego podrás prorratear y emitir los recibos por unidad. (Placeholder inicial)
      </p>
    </section>
  );
}

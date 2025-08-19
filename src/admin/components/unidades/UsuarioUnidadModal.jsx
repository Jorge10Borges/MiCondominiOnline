import React, { useEffect, useState } from 'react';

export default function UsuarioUnidadModal({ open, unidad, onClose, apiBaseUrl, token, onAssigned }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null); // {id, email, nombre, rol}
  const [msg, setMsg] = useState({ type: '', text: '' }); // type: 'ok' | 'error'
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoDni, setNuevoDni] = useState('');

  useEffect(() => {
    if (!open) return;
  setEmail('');
  setUsuarioEncontrado(null);
  setMsg({ type: '', text: '' });
  }, [open, unidad]);

  if (!open) return null;

  const verificar = async () => {
    const correo = email.trim().toLowerCase();
    if (!correo) { window.alert('Ingrese un email.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/usuarios.php?email=${encodeURIComponent(correo)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || 'Error al verificar usuario';
        if (msg.includes('Token inválido') || msg.includes('expirado')) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/';
          return;
        }
        window.alert(msg);
        return;
      }
      // Soporta respuesta especial {existe, usuario} o lista de usuarios
      if (typeof data === 'object' && data && 'existe' in data) {
        if (data.existe) {
          setUsuarioEncontrado(data.usuario);
          setMsg({ type: 'ok', text: `Usuario encontrado: ${data.usuario?.email || correo}` });
        } else {
          setUsuarioEncontrado(null);
          setMsg({ type: 'error', text: 'Usuario no encontrado' });
          setNuevoNombre('');
          setNuevoDni('');
        }
      } else if (Array.isArray(data)) {
        const usuario = data.find(u => (u.email || '').toLowerCase() === correo) || null;
        setUsuarioEncontrado(usuario);
        setMsg(usuario ? { type: 'ok', text: `Usuario encontrado: ${usuario.email}` } : { type: 'error', text: 'Usuario no encontrado' });
        if (!usuario) { setNuevoNombre(''); setNuevoDni(''); }
      } else {
        window.alert('Respuesta inesperada del servidor');
      }
    } catch (e) {
      window.alert('Error de red al verificar');
    } finally {
      setLoading(false);
    }
  };

  const asignar = async () => {
    if (!usuarioEncontrado || !unidad?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/usuario_unidad.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ usuario_id: usuarioEncontrado.id, unidad_id: unidad.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        const msg = data?.error || 'Error al asignar usuario';
        if (msg.includes('Token inválido') || msg.includes('expirado')) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/';
          return;
        }
        window.alert(msg);
        return;
      }
  if (onAssigned && usuarioEncontrado?.email) {
        onAssigned({ unidadId: unidad.id, usuarioEmail: usuarioEncontrado.email });
      }
      onClose();
    } catch (e) {
      window.alert('Error de red al asignar');
    } finally {
      setLoading(false);
    }
  };

  const registrarYAsignar = async () => {
    const correo = email.trim().toLowerCase();
    if (!correo) { setMsg({ type: 'error', text: 'Ingrese un email válido' }); return; }
    if (!nuevoNombre.trim()) { setMsg({ type: 'error', text: 'Ingrese el nombre' }); return; }
    setLoading(true);
    try {
      // Crear usuario
      const resCre = await fetch(`${apiBaseUrl}/usuarios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nombre: nuevoNombre.trim(), email: correo, dni: nuevoDni.trim(), rol: 'usuario' })
      });
      const dataCre = await resCre.json().catch(() => ({}));
      if (!resCre.ok || dataCre?.error || !dataCre?.usuario) {
        const m = dataCre?.error || 'No se pudo crear el usuario';
        setMsg({ type: 'error', text: m });
        return;
      }
      setUsuarioEncontrado(dataCre.usuario);
      // Asignar
      const resAsig = await fetch(`${apiBaseUrl}/usuario_unidad.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ usuario_id: dataCre.usuario.id, unidad_id: unidad.id }),
      });
      const dataAsig = await resAsig.json().catch(() => ({}));
      if (!resAsig.ok || dataAsig?.error) {
        const m = dataAsig?.error || 'No se pudo asignar el usuario';
        setMsg({ type: 'error', text: m });
        return;
      }
      if (onAssigned) onAssigned({ unidadId: unidad.id, usuarioEmail: correo });
      onClose();
    } catch (e) {
      setMsg({ type: 'error', text: 'Error de red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Usuario de la Unidad</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="correo@dominio.com"
            disabled={loading}
          />
          {msg.type === 'ok' && (
            <p className="text-sm text-green-600 mt-2">{msg.text}</p>
          )}
          {msg.type === 'error' && (
            <p className="text-sm text-red-600 mt-2">{msg.text}</p>
          )}
        </div>
        {!usuarioEncontrado && msg.type === 'error' && (
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value)}
                placeholder="Nombre y apellido"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">DNI</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                value={nuevoDni}
                onChange={e => setNuevoDni(e.target.value)}
                placeholder="Documento (opcional)"
                disabled={loading}
              />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose} disabled={loading}>Cerrar</button>
          {!usuarioEncontrado ? (
            <>
              <button type="button" disabled={loading} className="px-4 py-2 rounded bg-Regalia text-white hover:bg-purple-800 disabled:opacity-50" onClick={verificar}>
                {loading ? 'Verificando…' : 'Verificar'}
              </button>
              {msg.type === 'error' && (
                <button type="button" disabled={loading || !nuevoNombre.trim()} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" onClick={registrarYAsignar}>
                  {loading ? 'Procesando…' : 'Registrar y Asignar'}
                </button>
              )}
            </>
          ) : (
            <button type="button" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" onClick={asignar}>
              {loading ? 'Asignando…' : 'Asignar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

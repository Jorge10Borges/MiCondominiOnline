import React, { useEffect, useState } from 'react';

export default function UsuarioUnidadModal({ open, unidad, onClose, apiBaseUrl, token, onAssigned }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null); // {id, email, nombre, rol}

  useEffect(() => {
    if (!open) return;
    setEmail('');
    setUsuarioEncontrado(null);
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
          // No alert cuando el usuario existe
        } else {
          setUsuarioEncontrado(null);
          window.alert('Usuario NO existe.');
        }
      } else if (Array.isArray(data)) {
        const usuario = data.find(u => (u.email || '').toLowerCase() === correo) || null;
        setUsuarioEncontrado(usuario);
        if (!usuario) {
          window.alert('Usuario NO existe.');
        }
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
          {usuarioEncontrado && (
            <p className="text-sm text-green-600 mt-2">Usuario encontrado: {usuarioEncontrado.email}</p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose} disabled={loading}>Cerrar</button>
          {!usuarioEncontrado ? (
            <button type="button" disabled={loading} className="px-4 py-2 rounded bg-Regalia text-white hover:bg-purple-800 disabled:opacity-50" onClick={verificar}>
              {loading ? 'Verificando…' : 'Verificar'}
            </button>
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

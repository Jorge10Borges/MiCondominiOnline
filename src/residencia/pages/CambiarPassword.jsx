import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

export default function CambiarPasswordPropietario() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const e = params.get('email') || '';
    if (e) setEmail(e);
  }, [location.search]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, old_password: oldPassword, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'No se pudo cambiar la contraseña'); return; }
      setMsg('Contraseña actualizada. Ahora puedes iniciar sesión.');
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Cambiar contraseña</h2>
        {msg && <div className="mb-4 text-green-700 text-center">{msg}</div>}
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input className="w-full border px-3 py-2 rounded" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Contraseña actual (si aplica)</label>
          <input type="password" className="w-full border px-3 py-2 rounded" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Nueva contraseña</label>
          <input type="password" className="w-full border px-3 py-2 rounded" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
        </div>
        <button className="w-full bg-green-600 text-white py-2 rounded">Cambiar</button>
      </form>
    </div>
  );
}

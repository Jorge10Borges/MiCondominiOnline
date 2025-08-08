import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';


export default function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error de autenticación');
        return;
      }
      // Guardar token y datos de usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      // Redirigir según el rol
      if (['admin', 'superusuario', 'root'].includes(data.usuario.rol)) {
        navigate('/admin/dashboard');
      } else {
        setError('No tienes permisos para acceder al panel administrativo');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-100 mt-30">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        {error && <div className="mb-4 text-red-600 text-center font-semibold">{error}</div>}
        <h2 className="text-2xl font-bold mb-6 text-center">Acceso Administración</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
            value={email}
            onChange={e => setEmail(e.target.value)}
            /* required */
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Contraseña</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
            value={password}
            onChange={e => setPassword(e.target.value)}
            /* required */
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Ingresar</button>
      </form>
    </div>
  );
}

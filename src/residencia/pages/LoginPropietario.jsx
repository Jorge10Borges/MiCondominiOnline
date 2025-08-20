import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';

export default function LoginPropietario() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

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
      // Si debe cambiar contraseña, redirigir a la página de cambio sin mantener sesión
      if (data.usuario?.mustChange) {
        const q = new URLSearchParams({ email }).toString();
        navigate(`/propietario/cambiar-password?${q}`);
        return;
      }
      // Guardar sesión y redirigir al dashboard de propietario
      login(data.usuario, data.token);
      navigate('/propietario/dashboard');
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        {error && <div className="mb-4 text-red-600 text-center font-semibold">{error}</div>}
        <h2 className="text-2xl font-bold mb-6 text-center">Acceso Propietarios</h2>
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
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">Ingresar</button>
      </form>
    </div>
  );
}

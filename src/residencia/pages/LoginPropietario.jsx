import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPropietario() {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí irá la lógica de autenticación real
    // Simulación de login exitoso
    navigate('/propietario/dashboard');
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Acceso Propietarios</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Cédula</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
            value={cedula}
            onChange={e => setCedula(e.target.value)}
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

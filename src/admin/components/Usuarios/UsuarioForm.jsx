import React, { useState } from 'react';

// Consulta real al backend para verificar si el correo existe
async function verificarCorreoExiste(email) {
  try {
    const res = await fetch(`/api/verificar_usuario.php?email="${encodeURIComponent(email)}"`);
    const data = await res.json();
    return data.existe;
  } catch (e) {
    return false;
  }
}

const roles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'propietario', label: 'Propietario' }
];

export default function UsuarioForm({ organizaciones = [], unidades = [], onSubmit }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('admin');
  const [orgsSeleccionadas, setOrgsSeleccionadas] = useState([]);
  const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState([]);
  const [emailExiste, setEmailExiste] = useState(false);
  const [verificando, setVerificando] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setVerificando(true);
    const existe = await verificarCorreoExiste(email);
    setEmailExiste(existe);
    setVerificando(false);
    if (existe) return;
    onSubmit({ nombre, email, rol, organizaciones: orgsSeleccionadas, unidades: unidadesSeleccionadas });
  };

  // Quitar verificación automática al escribir

  return (
    <form className="max-w-lg mx-auto bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Crear usuario</h2>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Email</label>
        <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
        {verificando && <span className="text-xs text-gray-500 ml-2">Verificando...</span>}
        {emailExiste && !verificando && (
          <span className="text-xs text-red-600 ml-2">Este correo ya está registrado</span>
        )}
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Nombre</label>
        <input type="text" className="w-full border rounded px-3 py-2" value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div className="mb-3">
        <label className="block font-semibold mb-1">Rol</label>
        <select className="w-full border rounded px-3 py-2" value={rol} onChange={e => setRol(e.target.value)}>
          {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      {rol === 'admin' && (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Organizaciones a administrar</label>
          <select multiple className="w-full border rounded px-3 py-2 h-32" value={orgsSeleccionadas} onChange={e => setOrgsSeleccionadas(Array.from(e.target.selectedOptions, o => o.value))}>
            {organizaciones.map(org => <option key={org.id} value={org.id}>{org.nombre}</option>)}
          </select>
        </div>
      )}
      {rol === 'propietario' && (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Unidades a asignar</label>
          <select multiple className="w-full border rounded px-3 py-2 h-32" value={unidadesSeleccionadas} onChange={e => setUnidadesSeleccionadas(Array.from(e.target.selectedOptions, o => o.value))}>
            {unidades.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.organizacion_nombre})</option>)}
          </select>
        </div>
      )}
  <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded shadow hover:bg-blue-800" disabled={verificando}>Crear usuario</button>
    </form>
  );
}

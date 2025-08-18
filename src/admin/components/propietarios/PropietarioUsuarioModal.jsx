import React, { useState } from 'react';

export default function PropietarioUsuarioModal({ open, onClose, onSave, usuarios = [], propietario }) {
  const [modo, setModo] = useState('nuevo'); // 'nuevo' o 'existente'
  const [usuarioNuevo, setUsuarioNuevo] = useState({ nombre: '', email: '', password: '', dni: '' });
  const [usuarioExistente, setUsuarioExistente] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Asignar Usuario a Propietario</h2>
        <div className="mb-4 flex gap-4">
          <button
            className={`px-4 py-2 rounded ${modo === 'nuevo' ? 'bg-Regalia text-white' : 'bg-gray-200'}`}
            onClick={() => setModo('nuevo')}
          >Crear nuevo usuario</button>
          <button
            className={`px-4 py-2 rounded ${modo === 'existente' ? 'bg-Regalia text-white' : 'bg-gray-200'}`}
            onClick={() => setModo('existente')}
          >Asignar existente</button>
        </div>
        {modo === 'nuevo' ? (
          <form onSubmit={e => { e.preventDefault(); onSave({ ...usuarioNuevo, propietario_id: propietario.id }); }}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input type="text" className="w-full px-3 py-2 border rounded" value={usuarioNuevo.nombre} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, nombre: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full px-3 py-2 border rounded" value={usuarioNuevo.email} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, email: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">DNI</label>
              <input type="text" className="w-full px-3 py-2 border rounded" value={usuarioNuevo.dni} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, dni: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <input type="password" className="w-full px-3 py-2 border rounded" value={usuarioNuevo.password} onChange={e => setUsuarioNuevo({ ...usuarioNuevo, password: e.target.value })} required />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded bg-Regalia text-white hover:bg-purple-800">Guardar</button>
            </div>
          </form>
        ) : (
          <form onSubmit={e => { e.preventDefault(); onSave({ usuario_id: usuarioExistente, propietario_id: propietario.id }); }}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Seleccionar usuario existente</label>
              <select className="w-full px-3 py-2 border rounded" value={usuarioExistente} onChange={e => setUsuarioExistente(e.target.value)} required>
                <option value="">Seleccione usuario</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre} - {u.email}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded bg-Regalia text-white hover:bg-purple-800">Guardar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

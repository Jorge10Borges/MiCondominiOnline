import React, { useState } from 'react';
import PropietarioUsuarioModal from '../components/propietarios/PropietarioUsuarioModal';

// Simulación de datos
const propietariosDemo = [
  { id: 1, nombre: 'Juan Pérez', dni: '12345678', usuario_email: 'juan@email.com' },
  { id: 2, nombre: 'Ana Gómez', dni: '87654321', usuario_email: '' },
];
const usuariosDemo = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com' },
  { id: 2, nombre: 'Ana Gómez', email: 'ana@email.com' },
  { id: 3, nombre: 'Carlos Ruiz', email: 'carlos@email.com' },
];

export default function PropietariosPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [propietarioEdit, setPropietarioEdit] = useState(null);

  return (
    <section className="sm:px-4 md:px-4 py-4 mx-auto max-w-full w-full relative">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Gestión de Propietarios</h1>
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto w-full max-w-full">
        <table className="min-w-[600px] w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-blue-100">
              <th className="py-3 px-2 md:px-4 text-left font-semibold border-b border-gray-200">Nombre</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">DNI</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Usuario</th>
              <th className="py-3 px-2 md:px-4 text-center w-1 font-semibold border-b border-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {propietariosDemo.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                <td className="py-3 px-2 md:px-4 align-middle whitespace-nowrap font-medium text-gray-900">{p.nombre}</td>
                <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{p.dni}</td>
                <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{p.usuario_email || <span className="text-gray-400">Sin usuario</span>}</td>
                <td className="py-3 px-2 md:px-4 align-middle flex gap-2 justify-center">
                  <button
                    className="text-purple-600 hover:text-purple-700 cursor-pointer"
                    title="Asignar/Editar usuario"
                    onClick={() => { setPropietarioEdit(p); setModalOpen(true); }}
                  >
                    Asignar usuario
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PropietarioUsuarioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={data => { setModalOpen(false); /* lógica de guardado aquí */ }}
        usuarios={usuariosDemo}
        propietario={propietarioEdit}
      />
    </section>
  );
}

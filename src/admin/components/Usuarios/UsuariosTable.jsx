import React from 'react';
import PenIcon from '../../assets/images/pen.svg?react';
import TrashIcon from '../../assets/images/trash.svg?react';

export default function UsuariosTable({ usuarios = [] }) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto w-full max-w-full">
      <table className="min-w-[600px] w-full">
        <thead className="sticky top-0 z-10">
          <tr className="bg-blue-100">
            <th scope="col" className="py-3 px-2 md:px-4 text-left font-semibold border-b border-gray-200">Nombre</th>
            <th scope="col" className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Email</th>
            <th scope="col" className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Rol</th>
            <th scope="col" className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Organización</th>
            <th scope="col" className="py-3 px-2 md:px-4 text-center w-1 font-semibold border-b border-gray-200">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-400">Realice una busqueda para mostrar los usuarios.</td>
            </tr>
          ) : (
            usuarios.map((u, idx) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                <td className="py-3 px-2 md:px-4 align-middle whitespace-nowrap font-medium text-gray-900 text-left">{u.nombre}</td>
                <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{u.email}</td>
                <td className="py-3 px-2 md:px-4 align-middle capitalize text-center whitespace-nowrap">{u.rol}</td>
                <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{u.organizacion_nombre}</td>
                <td className="py-3 px-2 md:px-4 align-middle flex gap-2 justify-center">
                  <button className="text-yellow-500 hover:text-yellow-600 cursor-pointer" title="Editar">
                    <PenIcon className="w-5 h-5 inline" />
                  </button>
                  <button className="text-red-600 hover:text-red-700 cursor-pointer" title="Eliminar">
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

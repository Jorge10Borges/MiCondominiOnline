import React, { useState } from 'react';
import TrashIcon from '../assets/images/trash.svg?react';
import PenIcon from '../assets/images/pen.svg?react';


// Lista simulada de organizaciones
const organizacionesDemo = [
  {
    id: 1,
    nombre: 'Residencias Miranda',
    tipo: 'condominio',
    licencia_activa: true,
    fecha_expiracion: '2025-12-31',
  },
  {
    id: 2,
    nombre: 'Urbanización El Sol',
    tipo: 'urbanizacion',
    licencia_activa: false,
    fecha_expiracion: '2024-10-15',
  },
];


export default function Organizaciones() {
  // Aquí se validará el rol de superusuario para mostrar el contenido

  const [orgs] = useState(organizacionesDemo);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Gestión de Organizaciones</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow text-sm md:text-base">
          <thead>
            <tr className="bg-blue-100">
              <th className="py-2 px-2 md:px-4 text-left whitespace-nowrap">Nombre</th>
              <th className="py-2 px-2 md:px-4 text-left whitespace-nowrap">Tipo</th>
              <th className="py-2 px-2 md:px-4 text-left whitespace-nowrap">Licencia</th>
              <th className="py-2 px-2 md:px-4 text-left whitespace-nowrap">Expira</th>
              <th className="py-2 px-2 md:px-4 text-left whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map(org => (
              <tr key={org.id} className="border-b hover:bg-blue-50">
                <td className="py-2 px-2 md:px-4 break-words max-w-[120px] md:max-w-none">{org.nombre}</td>
                <td className="py-2 px-2 md:px-4 capitalize">{org.tipo}</td>
                <td className="py-2 px-2 md:px-4">
                  {org.licencia_activa ? (
                    <span className="text-green-600 font-semibold">Activa</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Vencida</span>
                  )}
                </td>
                <td className="py-2 px-2 md:px-4">{org.fecha_expiracion}</td>
                <td className="py-2 px-2 md:px-4 flex gap-2">
                  <button className="text-yellow-500 hover:text-yellow-600" title="Editar" onClick={() => {/* usar org.id aquí para editar */}}>
                    <PenIcon className="w-5 h-5 inline" />
                  </button>
                  <button className="text-red-600 hover:text-red-700" title="Eliminar" onClick={() => {/* usar org.id aquí para eliminar */}}>
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 text-xs text-gray-500 md:hidden text-center">Desliza la tabla para ver todas las columnas</div>
      </div>
    </div>
  );
}

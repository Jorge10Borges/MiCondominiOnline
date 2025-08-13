import React, { useState, useEffect } from 'react';
import PlusIcon from '../assets/images/plus.svg?react';

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    // Aquí iría la llamada al backend para obtener las unidades
    setTimeout(() => {
      setUnidades([]); // Simulación de datos
      setLoading(false);
    }, 500);
  }, []);

  return (
    <section className="sm:px-4 md:px-4 py-4 mx-auto max-w-full w-full relative">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Gestión de Unidades</h1>
        <button
          type="button"
          className="bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800 transition"
        >
          <PlusIcon className="w-5 h-5 me-1 inline" />
          Nueva Unidad
        </button>
      </div>
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto w-full max-w-full">
        {loading && <div className="py-8 text-center text-gray-400">Cargando unidades...</div>}
        {error && <div className="py-8 text-center text-red-500 font-semibold">{error}</div>}
        <table className="min-w-[600px] w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-blue-100">
              <th className="py-3 px-2 md:px-4 text-left font-semibold border-b border-gray-200">Organización</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Sector</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Unidad</th>
              <th className="py-3 px-2 md:px-4 text-center font-semibold border-b border-gray-200">Propietario</th>
              <th className="py-3 px-2 md:px-4 text-center w-1 font-semibold border-b border-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {unidades.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">No hay unidades registradas.</td>
              </tr>
            ) : (
              unidades.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-blue-50 transition">
                  <td className="py-3 px-2 md:px-4 align-middle whitespace-nowrap font-medium text-gray-900">{u.organizacion}</td>
                  <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{u.sector}</td>
                  <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{u.nombre}</td>
                  <td className="py-3 px-2 md:px-4 align-middle text-center whitespace-nowrap">{u.propietario}</td>
                  <td className="py-3 px-2 md:px-4 align-middle flex gap-2 justify-center">
                    <button className="text-yellow-500 hover:text-yellow-600 cursor-pointer" title="Editar">
                      {/* Icono de editar */}
                      <span className="material-icons">edit</span>
                    </button>
                    <button className="text-red-600 hover:text-red-700 cursor-pointer" title="Eliminar">
                      {/* Icono de eliminar */}
                      <span className="material-icons">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

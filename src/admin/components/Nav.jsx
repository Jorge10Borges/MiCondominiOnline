import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';


const Nav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hideMenu = (
    location.pathname === '/admin/login' ||
    location.pathname.startsWith('/admin/cambiar-password') ||
    location.pathname.startsWith('/propietario/')
  );
  // Obtener el rol real del usuario desde localStorage
  let userRole = '';
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    userRole = usuario?.rol || '';
  } catch {
    userRole = '';
  }
  return (
    <nav className="p-4 text-white bg-gradient-to-r from-Oxford-Blue to-Regalia">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/Logo.png" alt="Logo" className="h-8" />
          <div className="font-bold text-lg">MiCondominiOnline</div>
        </Link>
        {/* Botón hamburguesa */}
        {!hideMenu && (
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
            aria-label="Abrir menú"
            onClick={() => setOpen(!open)}
          >
            <span className={`block w-6 h-0.5 bg-white mb-1 transition-all duration-200 ${open ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white mb-1 transition-all duration-200 ${open ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-all duration-200 ${open ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        )}
        {/* Menú horizontal en desktop con submenús */}
        {!hideMenu && (
          <ul className="hidden md:flex gap-4 items-center">
            <li><Link to="/admin/dashboard" className="hover:underline">Dashboard</Link></li>
            {(userRole === 'superusuario' || userRole === 'root') && (
              <li><Link to="/admin/organizaciones" className="hover:underline">Organizaciones</Link></li>
            )}
            {/* Menú Gestión */}
            <li className="relative group">
              <button className="hover:underline flex items-center gap-1 focus:outline-none">
                Gestión
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <ul className="absolute left-0 top-full bg-white text-gray-800 rounded shadow-lg min-w-[180px] py-2 z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity">
                <li><Link to="/admin/sectores" className="block px-4 py-2 hover:bg-blue-50" tabIndex={0}>Sectores</Link></li>
                <li><Link to="/admin/unidades" className="block px-4 py-2 hover:bg-blue-50" tabIndex={0}>Unidades</Link></li>
                <li><Link to="/admin/propietarios" className="block px-4 py-2 hover:bg-blue-50" tabIndex={0}>Propietarios</Link></li>
                {(userRole === 'admin' || userRole === 'superusuario' || userRole === 'root') && (
                  <li><Link to="/admin/usuarios" className="block px-4 py-2 hover:bg-blue-50" tabIndex={0}>Usuarios</Link></li>
                )}
              </ul>
            </li>
            {/* Menú Finanzas */}
            <li className="relative group">
              <button className="hover:underline flex items-center gap-1 focus:outline-none">
                Finanzas
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <ul className="absolute left-0 top-full bg-white text-gray-800 rounded shadow-lg min-w-[150px] py-2 z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity">
                <li><Link to="/admin/cobros" className="block px-4 py-2 hover:bg-blue-50" tabIndex={0}>Cobros</Link></li>
                <li><Link to="/admin/recibos/crear" className="block px-4 py-2 hover:bg-blue-50" tabIndex={0}>Crear Recibo</Link></li>
                <li><Link to="/admin/recibos" className="block px-4 py-2 hover:bg-blue-50" tabIndex={0}>Recibos (Resumen)</Link></li>
                <li><Link to="/admin/recibos/detalle" className="block px-4 py-2 hover:bg-blue-50" tabIndex={0}>Recibos Detalle</Link></li>
                <li><Link to="/admin/gastos" className="block px-4 py-2 hover:bg-blue-50" tabIndex={0}>Gastos</Link></li>
              </ul>
            </li>
            {/* Menú Comunicaciones */}
            <li className="relative group">
              <button className="hover:underline flex items-center gap-1 focus:outline-none">
                Comunicaciones
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <ul className="absolute left-0 top-full bg-white text-gray-800 rounded shadow-lg min-w-[170px] py-2 z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity">
                <li><Link to="/admin/comunicados" className="block px-4 py-2 hover:bg-blue-50" tabIndex={0}>Comunicados</Link></li>
                <li><Link to="/admin/reportes" className="block px-4 py-2 hover:bg-blue-50" tabIndex={0}>Reportes</Link></li>
              </ul>
            </li>
            <li><Link to="/admin/configuracion" className="hover:underline">Configuración</Link></li>
            <li><a href="/" className="hover:underline">Logout</a></li>
          </ul>
        )}
      </div>
      {/* Menú móvil desplegable */}
      {!hideMenu && open && (
        <ul className="md:hidden flex flex-col gap-4 mt-4 bg-gradient-to-r from-Oxford-Blue to-Regalia rounded shadow p-4 animate-fade-in">
          <li><Link to="/admin/dashboard" className="hover:underline" onClick={() => setOpen(false)}>Dashboard</Link></li>
          {(userRole === 'superusuario' || userRole === 'root') && (
            <li><Link to="/admin/organizaciones" className="hover:underline" onClick={() => setOpen(false)}>Organizaciones</Link></li>
          )}
          <li className="font-semibold mt-2">Gestión</li>
          <li><Link to="/admin/sectores" className="hover:underline" onClick={() => setOpen(false)}>Sectores</Link></li>
          <li><Link to="/admin/unidades" className="hover:underline" onClick={() => setOpen(false)}>Unidades</Link></li>
          <li><Link to="/admin/propietarios" className="hover:underline" onClick={() => setOpen(false)}>Propietarios</Link></li>
          <li className="font-semibold mt-2">Finanzas</li>
          <li><Link to="/admin/cobros" className="hover:underline" onClick={() => setOpen(false)}>Cobros</Link></li>
          <li><Link to="/admin/recibos/crear" className="hover:underline" onClick={() => setOpen(false)}>Crear Recibo</Link></li>
          <li><Link to="/admin/recibos" className="hover:underline" onClick={() => setOpen(false)}>Recibos (Resumen)</Link></li>
          <li><Link to="/admin/recibos/detalle" className="hover:underline" onClick={() => setOpen(false)}>Recibos Detalle</Link></li>
          <li><Link to="/admin/gastos" className="hover:underline" onClick={() => setOpen(false)}>Gastos</Link></li>
          <li className="font-semibold mt-2">Comunicaciones</li>
          <li><Link to="/admin/comunicados" className="hover:underline" onClick={() => setOpen(false)}>Comunicados</Link></li>
          <li><Link to="/admin/reportes" className="hover:underline" onClick={() => setOpen(false)}>Reportes</Link></li>
          <li className="font-semibold mt-2">Otros</li>
          <li><Link to="/admin/configuracion" className="hover:underline" onClick={() => setOpen(false)}>Configuración</Link></li>
          <li><a href="/" className="hover:underline" onClick={() => setOpen(false)}>Logout</a></li>
        </ul>
      )}
    </nav>
  );
};

export default Nav;


import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';


const Nav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hideMenu = location.pathname === '/admin/login';
  // Simulación: cambiar a "admin" para probar el menú sin superusuario
  const userRole = 'superusuario';
  return (
    <nav className="p-4 text-white bg-gradient-to-r from-Oxford-Blue to-Regalia">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/Logo.png" alt="Logo" className="h-8" />
          <div className="font-bold text-lg">MiCondominioOnline</div>
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
        {/* Menú horizontal en desktop */}
        {!hideMenu && (
          <ul className="hidden md:flex gap-6 items-center">
            <li><Link to="/admin/dashboard" className="hover:underline">Dashboard</Link></li>
            {userRole === 'superusuario' && (
              <li><Link to="/admin/organizaciones" className="hover:underline">Organizaciones</Link></li>
            )}
            <li><Link to="/admin/sectores" className="hover:underline">Sectores</Link></li>
            <li><Link to="/admin/unidades" className="hover:underline">Unidades</Link></li>
            <li><Link to="/admin/propietarios" className="hover:underline">Propietarios</Link></li>
            <li><Link to="/admin/pagos" className="hover:underline">Pagos</Link></li>
            <li><Link to="/admin/gastos" className="hover:underline">Gastos</Link></li>
            <li><Link to="/admin/comunicados" className="hover:underline">Comunicados</Link></li>
            <li><Link to="/admin/reportes" className="hover:underline">Reportes</Link></li>
            <li><Link to="/admin/configuracion" className="hover:underline">Configuración</Link></li>
            <li><a href="/" className="hover:underline">Logout</a></li>
          </ul>
        )}
      </div>
      {/* Menú móvil desplegable */}
      {!hideMenu && open && (
        <ul className="md:hidden flex flex-col gap-4 mt-4 bg-gradient-to-r from-Oxford-Blue to-Regalia rounded shadow p-4 animate-fade-in">
          <li><Link to="/admin/dashboard" className="hover:underline" onClick={() => setOpen(false)}>Dashboard</Link></li>
          {userRole === 'superusuario' && (
            <li><Link to="/admin/organizaciones" className="hover:underline" onClick={() => setOpen(false)}>Organizaciones</Link></li>
          )}
          <li><Link to="/admin/sectores" className="hover:underline" onClick={() => setOpen(false)}>Sectores</Link></li>
          <li><Link to="/admin/unidades" className="hover:underline" onClick={() => setOpen(false)}>Unidades</Link></li>
          <li><Link to="/admin/propietarios" className="hover:underline" onClick={() => setOpen(false)}>Propietarios</Link></li>
          <li><Link to="/admin/pagos" className="hover:underline" onClick={() => setOpen(false)}>Pagos</Link></li>
          <li><Link to="/admin/gastos" className="hover:underline" onClick={() => setOpen(false)}>Gastos</Link></li>
          <li><Link to="/admin/comunicados" className="hover:underline" onClick={() => setOpen(false)}>Comunicados</Link></li>
          <li><Link to="/admin/reportes" className="hover:underline" onClick={() => setOpen(false)}>Reportes</Link></li>
          <li><Link to="/admin/configuracion" className="hover:underline" onClick={() => setOpen(false)}>Configuración</Link></li>
          <li><a href="/" className="hover:underline" onClick={() => setOpen(false)}>Logout</a></li>
        </ul>
      )}
    </nav>
  );
};

export default Nav;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';


const Nav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hideMenu = location.pathname === '/propietario/login';
  return (
    <nav className="p-4 text-white bg-gradient-to-r from-Forest-Green to-Teal-Blue">
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
            <li>
              <Link to="/admin/login" className="hover:underline">Administración</Link>
            </li>
            <li>
              <Link to="/propietario/login" className="hover:underline">Propietarios</Link>
            </li>
            <li>
              <a href="/" className="hover:underline">Logout</a>
            </li>
          </ul>
        )}
      </div>
      {/* Menú móvil desplegable */}
      {!hideMenu && open && (
        <ul className="md:hidden flex flex-col gap-4 mt-4 bg-gradient-to-r from-Forest-Green to-Teal-Blue rounded shadow p-4 animate-fade-in">
          <li>
            <Link to="/admin/login" className="hover:underline" onClick={() => setOpen(false)}>Administración</Link>
          </li>
          <li>
            <Link to="/propietario/login" className="hover:underline" onClick={() => setOpen(false)}>Propietarios</Link>
          </li>
          <li>
            <a href="/" className="hover:underline" onClick={() => setOpen(false)}>Logout</a>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Nav;
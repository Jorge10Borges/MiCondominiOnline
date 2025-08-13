import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado del usuario logueado
  const [usuario, setUsuario] = useState(() => {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  });

  // Persistir usuario en localStorage
  useEffect(() => {
    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
    }
  }, [usuario]);

  // Login: guardar usuario y token
  const login = (usuario, token) => {
    setUsuario(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('token', token);
  };

  // Logout
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

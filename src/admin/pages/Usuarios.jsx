import React, { useContext, useState } from 'react';
import UsuarioModal from '../components/Usuarios/UsuarioModal';
import UsuarioForm from '../components/Usuarios/UsuarioForm';
import UsuariosTable from '../components/Usuarios/UsuariosTable';
import UserHandUpIcon from '../assets/images/user-hand-up.svg?react';
import { API_BASE_URL } from '../../config';
// Importa el contexto de autenticación (ajusta la ruta según tu estructura)
import { AuthContext } from '../../context/AuthContext';

// Función para obtener los roles que puede crear el usuario logueado
function obtenerRolesDisponibles(rolUsuario) {
  if (rolUsuario === 'admin') {
    return [
      { value: '', label: 'Todos' },
      { value: 'propietario', label: 'Propietario' },
    ];
  }
    if (rolUsuario === 'superusuario') {
    return [
      { value: '', label: 'Todos' },
      { value: 'admin', label: 'Administrador' },
      { value: 'propietario', label: 'Propietario' },
    ];
  }
  if (rolUsuario === 'root') {
    return [
      { value: '', label: 'Todos' },
      { value: 'admin', label: 'Administrador' },
      { value: 'propietario', label: 'Propietario' },
      { value: 'superusuario', label: 'Superusuario' },
    ];
  }
  // Por defecto, solo propietario
  return [
    { value: '', label: 'Todos' },
    { value: 'propietario', label: 'Propietario' },
  ];
}

export default function Usuarios() {
  // Obtiene el usuario logueado y la función de logout desde el contexto
  const { usuario, logout } = useContext(AuthContext);

  // Obtiene los roles disponibles según el rol del usuario logueado
  const rolesDisponibles = obtenerRolesDisponibles(usuario?.rol);

  // Estado para mostrar/ocultar el modal
  const [modalOpen, setModalOpen] = useState(false);
  // Estado para filtros
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroOrg, setFiltroOrg] = useState('');

  // Limpiar la tabla de usuarios cuando cambian los filtros
  React.useEffect(() => {
    setUsuarios([]);
  }, [filtroRol, filtroOrg]);

    // Organizaciones asignadas al usuario logueado (debería venir de API)
    const [organizaciones, setOrganizaciones] = useState([]);

    React.useEffect(() => {
      // Si el usuario es root o superusuario, puede ver todas las organizaciones
      // Si es admin, solo las asignadas
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/organizaciones.php`;
      if (usuario?.rol === 'admin') {
        url += `?usuario_id=${usuario.id}`;
      }
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok || (data.error && (data.error.includes('Token inválido') || data.error.includes('expirado')))) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/';
            return;
          }
          // Si la respuesta es un array directo
          if (Array.isArray(data)) setOrganizaciones(data);
          // Si la respuesta tiene .organizaciones
          else if (Array.isArray(data.organizaciones)) setOrganizaciones(data.organizaciones);
          else setOrganizaciones([]);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/';
        });
    }, [usuario]);
    const unidades = [
      { id: '1', nombre: 'Apto 101', organizacion_nombre: 'Condominio 1' },
      { id: '2', nombre: 'Apto 102', organizacion_nombre: 'Condominio 1' },
      { id: '3', nombre: 'Apto 201', organizacion_nombre: 'Condominio 2' }
    ];

    // Estado para usuarios y carga
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(false);

    // Estado para controlar si se debe buscar
    const [buscar, setBuscar] = useState(false);

    // Obtener usuarios del backend solo al hacer clic en Buscar
    React.useEffect(() => {
      if (!buscar) return;
      setCargando(true);
      const token = localStorage.getItem('token');
      fetch(`${API_BASE_URL}/usuarios.php?rol=${encodeURIComponent(filtroRol)}&organizacion=${encodeURIComponent(filtroOrg)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
        .then(async res => {
          const data = await res.json();
          if (!res.ok) {
            if (data.error && (data.error.includes('Token inválido') || data.error.includes('expirado'))) {
              localStorage.removeItem('token');
              localStorage.removeItem('usuario');
              window.location.href = '/';
              setCargando(false);
              return;
            }
            setUsuarios([]);
            setCargando(false);
            return;
          }
          // Filtrar roles según el usuario logueado
          let rolesNoPermitidos = [];
          if (usuario?.rol === 'admin') rolesNoPermitidos = ['superusuario', 'root'];
          else if (usuario?.rol === 'superusuario') rolesNoPermitidos = ['root'];
          // Si es root, puede ver todos
          const filtrados = data.filter(u => !rolesNoPermitidos.includes(u.rol));
          setUsuarios(filtrados);
          setCargando(false);
        })
        .catch(() => {
          setCargando(false);
        });
      setBuscar(false);
    }, [buscar, filtroRol, filtroOrg, usuario]);

    // Maneja el submit del formulario de usuario
    const handleUsuarioSubmit = (data) => {
      // Aquí deberías llamar a tu API para guardar el usuario
      console.log('Usuario a guardar:', data);
      setModalOpen(false);
    };

  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Gestión de usuarios</h1>
      {/* Filtros visuales */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center">
        <div>
          <label htmlFor="rol" className="block text-sm font-medium mb-1">Rol</label>
          <select
            id="rol"
            className="border rounded px-3 py-2 w-48"
            value={filtroRol}
            onChange={e => setFiltroRol(e.target.value)}
          >
            {rolesDisponibles.map(rol => (
              <option key={rol.value} value={rol.value}>{rol.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label htmlFor="organizacion" className="block text-sm font-medium mb-1">Organización</label>
            <select
              id="organizacion"
              className="border rounded px-3 py-2 w-48"
              value={filtroOrg}
              onChange={e => setFiltroOrg(e.target.value)}
            >
              <option value="">Todas</option>
              {organizaciones.map(org => (
                <option key={org.id} value={org.nombre}>{org.nombre}</option>
              ))}
            </select>
          </div>
          <button
            className="bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800 transition flex items-center gap-2 font-medium"
            style={{marginBottom: '2px'}}
            title="Buscar usuarios"
            onClick={() => setBuscar(true)}
          >
            <UserHandUpIcon className="w-5 h-5 inline" />
            Buscar
          </button>
        </div>
      </div>
        <div className="flex justify-center mb-8">
          <button
            className="bg-green-700 text-white px-4 py-2 rounded shadow hover:bg-green-800"
            onClick={() => setModalOpen(true)}
          >
            Crear nuevo usuario
          </button>
        </div>

      {cargando ? (
        <div className="text-center text-gray-500 py-8">Cargando usuarios...</div>
      ) : (
        <UsuariosTable usuarios={usuarios} />
      )}

        <UsuarioModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <UsuarioForm
            organizaciones={organizaciones}
            unidades={unidades}
            onSubmit={handleUsuarioSubmit}
          />
        </UsuarioModal>
    </div>
  );
}

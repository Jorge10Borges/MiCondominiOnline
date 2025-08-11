import React, { useState } from 'react';
import ToastMessage from '../ToastMessage';
import { API_BASE_URL } from '../../../config';
import SectoresManager from '../Organizaciones/SectoresManager';
import AddIcon from '../../assets/images/plusLarge.svg?react'; // Icono para agregar organización
import UpLoadIcon from '../../assets/images/cloud-upload.svg?react'; // Icono para subir archivo

export default function OrganizacionInfo({ infoData = {}, onSave }) {
  // Recibe el objeto completo desde props
  const editMode = true;
  const [form, setForm] = useState(infoData || {});

  // Actualiza el form si cambia infoData
  React.useEffect(() => {
    setForm(infoData || {});
  }, [infoData]);

  const [estructura, setEstructura] = useState({
    sectores: '',
    unidades: '',
    propietarios: '',
    adminPrincipal: '',
    totalUnidades: '',
    estadoEstructura: '',
  });

  const [config, setConfig] = useState({
    cuentas: '',
    reglamento: '',
    documentos: '',
    facturacion: '',
    contactosEmergencia: '',
    notificaciones: '',
    permisos: '',
  });

  const [finanzas, setFinanzas] = useState({
    costoLicencia: '',
    unidadesLicencia: '',
    estadoLicencia: '',
    fechaInicioLicencia: '',
    fechaExpiracionLicencia: '',
    notas: '',
  });

  // Estado para sectores y unidades
  const [sectores, setSectores] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Eliminar lógica de edición/cancelación
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/organizaciones.php?id=${form.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && (data.error.includes('Token inválido') || data.error.includes('expirado'))) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/';
          return;
        }
        setError(data.error || 'Error al guardar organización');
        setToast({ show: true, message: data.error || 'Error al guardar organización', type: 'error' });
      } else {
        setError('');
        setToast({ show: true, message: 'Organización guardada correctamente', type: 'success' });
        if (onSave) onSave({ ...form });
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setToast({ show: true, message: 'Error de conexión con el servidor', type: 'error' });
    }
    setSaving(false);
  };
  const handleEstructura = (e) => {
    const { name, value } = e.target;
    setEstructura((prev) => ({ ...prev, [name]: value }));
  };
  const handleConfig = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };
  const handleFinanzas = (e) => {
    const { name, value } = e.target;
    setFinanzas((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-10">
      <ToastMessage show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <div className="p-8 mx-auto bg-white rounded shadow grid grid-cols-1 md:grid-cols-4 gap-6">
        <h2 className="text-2xl font-bold mb-6 text-center col-span-full">Información de la organización</h2>
        {/* Nombre */}
        <div className="md:col-span-3">
          <label className="block font-semibold mb-1">Nombre de la organización</label>
          {editMode ? (
            <input name="nombre" value={form.nombre || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          ) : (
            <div className="w-full border rounded px-3 py-2 bg-gray-50">{form.nombre}</div>
          )}
        </div>
        {/* Tipo */}
        <div className="col-span-full sm:col-span-1">
          <label className="block font-semibold mb-1">Tipo</label>
          {editMode ? (
            <select name="tipo" value={form.tipo || ''} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="condominio">Condominio</option>
              <option value="urbanizacion">Urbanización</option>
            </select>
          ) : (
            <div className="w-full border rounded px-3 py-2 bg-gray-50">{form.tipo}</div>
          )}
        </div>
        {/* Dirección */}
        <div className="col-span-full">
          <label className="block font-semibold mb-1">Dirección completa</label>
          {editMode ? (
            <input name="direccion" value={form.direccion || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          ) : (
            <div className="w-full border rounded px-3 py-2 bg-gray-50">{form.direccion}</div>
          )}
        </div>
        {/* RIF */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block font-semibold mb-1">RIF o identificación fiscal</label>
          {editMode ? (
            <input name="rif" value={form.rif || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          ) : (
            <div className="w-full border rounded px-3 py-2 bg-gray-50">{form.rif}</div>
          )}
        </div>
        {/* Teléfonos */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block font-semibold mb-1">Teléfonos de contacto</label>
          {editMode ? (
            <input name="telefonos" value={form.telefonos || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          ) : (
            <div className="w-full border rounded px-3 py-2 bg-gray-50">{form.telefonos}</div>
          )}
        </div>
        {/* Email */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block font-semibold mb-1">Email de contacto</label>
          {editMode ? (
            <input name="email" value={form.email || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          ) : (
            <div className="w-full border rounded px-3 py-2 bg-gray-50">{form.email}</div>
          )}
        </div>
        {/* Fecha de creación */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block font-semibold mb-1">Fecha de creación/registro</label>
          {editMode ? (
            <input name="created_at" type="date" value={form.created_at ? form.created_at.substring(0,10) : ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          ) : (
            <div className="w-full border rounded px-3 py-2 bg-gray-50">{form.created_at}</div>
          )}
        </div>
        {/* Estado de la licencia */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block font-semibold mb-1">Estado de la licencia</label>
          {editMode ? (
            <select name="estado_licencia" value={form.estado_licencia || ''} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="activa">Activa</option>
              <option value="suspendida">Suspendida</option>
              <option value="vencida">Vencida</option>
            </select>
          ) : (
            <div className="w-full border rounded px-3 py-2 bg-gray-50">{form.estado_licencia}</div>
          )}
        </div>
        {/* Fecha de expiración */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block font-semibold mb-1">Fecha de expiración licencia</label>
          {editMode ? (
            <input name="fecha_expiracion" type="date" value={form.fecha_expiracion || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          ) : (
            <div className="w-full border rounded px-3 py-2 bg-gray-50">{form.fecha_expiracion}</div>
          )}
        </div>
        {/* Tipo de licencia */}
        <div>
          <label className="block font-semibold mb-1">Tipo de Licencia</label>
          {editMode ? (
            <select name="tipo_licencia" value={form.tipo_licencia || ''} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          ) : (
            <div className="w-full border rounded px-3 py-2 bg-gray-50">{form.tipo_licencia}</div>
          )}
        </div>
        {/* Costo de la licencia */}
        <div>
          <label className="block font-semibold mb-1">Costo de la licencia (USD)</label>
          {editMode ? (
            <input name="costo_licencia" type="number" min="0" step="0.01" value={form.costo_licencia || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          ) : (
            <div className="w-full border rounded px-3 py-2 bg-gray-50">{form.costo_licencia}</div>
          )}
        </div>
        <div className="col-span-full flex gap-2 mt-6 justify-end">
          {error && <div className="text-red-500 font-semibold mb-2 w-full text-right">{error}</div>}
          <>
          {/* Botón Cancelar eliminado, el formulario siempre está en modo edición */}
            <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold" onClick={handleSave} disabled={saving}>
              <UpLoadIcon className="w-5 h-5 me-1 inline" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import SectoresManager from '../Organizaciones/SectoresManager';

export default function OrganizacionInfo({ nombre: initialNombre = '' }) {
  const [form, setForm] = useState({
    nombre: initialNombre,
    tipo: '',
    rif: '',
    direccion: '',
    telefonos: '',
    email: '',
    fechaCreacion: '',
    estadoLicencia: '',
    fechaExpiracion: '',
  });

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
      <form className="space-y-4">
        {/* Datos generales */}
        <div className="p-8 mx-auto bg-white rounded shadow grid grid-cols-1 md:grid-cols-4 gap-6">
          <h2 className="text-2xl font-bold mb-6 text-center col-span-full">Información de la organización</h2>
          <div className="md:col-span-3">
            <label className="block font-semibold mb-1">Nombre de la organización</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="col-span-full sm:col-span-1">
            <label className="block font-semibold mb-1">Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Seleccione</option>
              <option value="condominio">Condominio</option>
              <option value="urbanizacion">Urbanización</option>
            </select>
          </div>
          <div className="col-span-full">
            <label className="block font-semibold mb-1">Dirección completa</label>
            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block font-semibold mb-1">RIF o identificación fiscal</label>
            <input type="text" name="rif" value={form.rif} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block font-semibold mb-1">Teléfonos de contacto</label>
            <input type="text" name="telefonos" value={form.telefonos} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block font-semibold mb-1">Email de contacto</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block font-semibold mb-1">Fecha de creación/registro</label>
            <input type="date" name="fechaCreacion" value={form.fechaCreacion} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block font-semibold mb-1">Estado de la licencia</label>
            <select name="estadoLicencia" value={form.estadoLicencia} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Seleccione</option>
              <option value="activa">Activa</option>
              <option value="vencida">Vencida</option>
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block font-semibold mb-1">Fecha de expiración licencia</label>
            <input type="date" name="fechaExpiracion" value={form.fechaExpiracion} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        {/* Estructura y configuración */}
        <div className="p-8 mx-auto bg-white rounded shadow grid grid-cols-1 md:grid-cols-4 gap-6">
          <h2 className="text-2xl font-bold mb-6 text-center col-span-full">Estructura y configuración</h2>
          <SectoresManager sectores={sectores} setSectores={setSectores}/>

          {/* <h3 className="text-lg font-semibold mt-6 mb-2">Configuración</h3>
          <div>
            <label className="block font-semibold mb-1">Cuentas bancarias</label>
            <input type="text" name="cuentas" value={config.cuentas} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Reglamento interno</label>
            <input type="text" name="reglamento" value={config.reglamento} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Documentos oficiales</label>
            <input type="text" name="documentos" value={config.documentos} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Parámetros de facturación</label>
            <input type="text" name="facturacion" value={config.facturacion} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Contactos de emergencia</label>
            <input type="text" name="contactosEmergencia" value={config.contactosEmergencia} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Configuración de notificaciones</label>
            <input type="text" name="notificaciones" value={config.notificaciones} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Permisos y roles activos</label>
            <input type="text" name="permisos" value={config.permisos} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div> */}
        </div>
        <div className="p-8 mx-auto bg-white rounded shadow grid grid-cols-1 md:grid-cols-4 gap-6">
          <h2 className="text-2xl font-bold mb-6 text-center col-span-full">Estructura y configuración</h2>
          <div>
            <label className="block font-semibold mb-1">Cuentas bancarias</label>
            <input type="text" name="cuentas" value={config.cuentas} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Reglamento interno</label>
            <input type="text" name="reglamento" value={config.reglamento} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Documentos oficiales</label>
            <input type="text" name="documentos" value={config.documentos} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Parámetros de facturación</label>
            <input type="text" name="facturacion" value={config.facturacion} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Contactos de emergencia</label>
            <input type="text" name="contactosEmergencia" value={config.contactosEmergencia} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Configuración de notificaciones</label>
            <input type="text" name="notificaciones" value={config.notificaciones} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Permisos y roles activos</label>
            <input type="text" name="permisos" value={config.permisos} onChange={handleConfig} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        {/* Datos financieros y licencia */}
        <div className="p-8 w-full mx-auto bg-white rounded shadow">
          <h2 className="text-2xl font-bold mb-6 text-center">Datos financieros y licencia</h2>
          <div>
            <label className="block font-semibold mb-1">Costo de la licencia mensual (USD)</label>
            <input type="number" name="costoLicencia" value={finanzas.costoLicencia} onChange={handleFinanzas} className="w-full border rounded px-3 py-2" min="0" step="0.01" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Unidades habitacionales licenciadas</label>
            <input type="number" name="unidadesLicencia" value={finanzas.unidadesLicencia} onChange={handleFinanzas} className="w-full border rounded px-3 py-2" min="0" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Estado de la licencia</label>
            <select name="estadoLicencia" value={finanzas.estadoLicencia} onChange={handleFinanzas} className="w-full border rounded px-3 py-2">
              <option value="">Seleccione</option>
              <option value="activa">Activa</option>
              <option value="vencida">Vencida</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Fecha de inicio de la licencia</label>
            <input type="date" name="fechaInicioLicencia" value={finanzas.fechaInicioLicencia} onChange={handleFinanzas} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Fecha de expiración de la licencia</label>
            <input type="date" name="fechaExpiracionLicencia" value={finanzas.fechaExpiracionLicencia} onChange={handleFinanzas} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Notas o comentarios</label>
            <textarea name="notas" value={finanzas.notas} onChange={handleFinanzas} className="w-full border rounded px-3 py-2" rows={2} />
          </div>
        </div>
      </form>

    </div>
  );
}

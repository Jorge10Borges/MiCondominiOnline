import React from 'react';

export default function UnidadModal({ open, onClose, onSave, unidad, modo, tipoUnidad, placeholderUnidad }) {
  const [form, setForm] = React.useState(unidad || { identificador: '', propietario: '', estado: '', telefono: '', dni: '' });

  React.useEffect(() => {
    setForm(unidad || { identificador: '', propietario: '', estado: '', telefono: '', dni: '' });
  }, [unidad, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>
          ×
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">{modo === 'editar' ? `Editar ${tipoUnidad}` : `Agregar ${tipoUnidad}`}</h3>
        <form
          className="flex flex-col gap-4"
          onSubmit={e => {
            e.preventDefault();
            onSave(form);
          }}
        >
          <div>
            <label className="block font-semibold mb-1">{tipoUnidad} (Identificador)</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.identificador}
              onChange={e => setForm({ ...form, identificador: e.target.value })}
              placeholder={placeholderUnidad}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Propietario</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.propietario}
              onChange={e => setForm({ ...form, propietario: e.target.value })}
              placeholder="Nombre del propietario"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">DNI del propietario</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.dni}
              onChange={e => setForm({ ...form, dni: e.target.value })}
              placeholder="DNI único del propietario"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Estado</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.estado}
              onChange={e => setForm({ ...form, estado: e.target.value })}
              placeholder="Ocupado, Disponible, Alquilado..."
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Teléfono</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              placeholder="Teléfono de contacto"
            />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="bg-Regalia text-white px-4 py-2 rounded shadow hover:bg-purple-800">
              {modo === 'editar' ? 'Guardar cambios' : `Agregar ${tipoUnidad.toLowerCase()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

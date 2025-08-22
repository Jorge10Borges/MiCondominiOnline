import React, { useEffect, useState, useMemo } from "react";
import { API_BASE_URL } from "../../../config";

export default function GastoModal({ open, onClose, onSave, organizacionId, gasto, tasas }) {
  const [fecha, setFecha] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState("USD");
  // Clasificación (guardaremos el código de subcategoría en "categoria")
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState(""); // codigo_cat (2 letras)
  const [subcategoriaSel, setSubcategoriaSel] = useState(""); // codigo_subcat (CC-XXX)
  const [descripcion, setDescripcion] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [comprobante, setComprobante] = useState("");

  useEffect(() => {
    if (!open) return;
    // Precargar si es edición, o reset si es nuevo
    if (gasto) {
      setFecha(gasto.fecha || "");
      setMonto(gasto.monto != null ? String(gasto.monto) : "");
      setMoneda(gasto.moneda || "USD");
      // Si viene con código de subcategoría (p.ej. OP-SEG), prefijar selección
      const codigo = gasto.categoria || "";
      if (codigo && codigo.includes("-")) {
        const [cc] = codigo.split("-");
        setCategoriaSel(cc || "");
        setSubcategoriaSel(codigo);
      } else {
        setCategoriaSel("");
        setSubcategoriaSel("");
      }
      setDescripcion(gasto.descripcion || "");
      setProveedor(gasto.proveedor || "");
      setComprobante(gasto.comprobante || "");
    } else {
      setFecha("");
      setMonto("");
      setMoneda("USD");
      setCategoriaSel("");
      setSubcategoriaSel("");
      setDescripcion("");
      setProveedor("");
      setComprobante("");
    }
    // Cargar categorías al abrir
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/categorias.php`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.error) setCategorias(data.categorias || []);
      })
      .catch(() => {});
  }, [open, gasto]);

  // Cargar subcategorías cuando cambia la categoría seleccionada o al precargar
  useEffect(() => {
    if (!open) return;
    if (!categoriaSel) {
      setSubcategorias([]);
      setSubcategoriaSel("");
      return;
    }
    const token = localStorage.getItem("token");
    const url = new URL(`${API_BASE_URL}/subcategorias.php`);
    url.searchParams.set("codigo_cat", categoriaSel);
    fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.error) {
          const list = data.subcategorias || [];
          setSubcategorias(list);
          // Si la subcategoriaSel no pertenece a la nueva categoría, resetear
          if (subcategoriaSel && !list.find((s) => s.codigo_subcat === subcategoriaSel)) {
            setSubcategoriaSel("");
          }
        } else {
          setSubcategorias([]);
        }
      })
      .catch(() => setSubcategorias([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaSel, open]);

  // No retornar tempranamente para no alterar el orden de hooks; controlamos render más abajo

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: gasto?.id ?? null,
      organizacion_id: organizacionId ? parseInt(organizacionId) : null,
      fecha,
      monto: Number.isFinite(parseFloat(monto)) ? parseFloat(monto) : null,
      moneda,
      categoria: (subcategoriaSel || "").trim() || null,
      descripcion: descripcion?.trim() || null,
      proveedor: proveedor?.trim() || null,
      comprobante: comprobante?.trim() || null,
    });
  };

  // Equivalencia a VES (para mostrar al final del formulario)
  const equivalenciaVes = useMemo(() => {
    const val = parseFloat(monto);
    if (!Number.isFinite(val)) return null;
    // Si la moneda ya es VES devolvemos el mismo valor aunque no haya tasa
    if (moneda === 'VES') return val;
    const vesPorUsd = tasas?.vesPorUsd; // VES por 1 USD
    const vesPorEur = tasas?.vesPorEur; // VES por 1 EUR
    if (!vesPorUsd) return null; // sin tasa base no podemos convertir desde USD/EUR
    if (moneda === 'USD') return val * vesPorUsd;
    if (moneda === 'EUR' && vesPorEur) return val * vesPorEur;
    return null;
  }, [monto, moneda, tasas]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">{gasto ? "Editar Gasto" : "Registrar Gasto"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Monto ({moneda})</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
              />
            </div>
            <div className="gap-2">
              <label className="block text-sm font-medium mb-1">Moneda</label>
              <select
                className="px-3 py-2 border rounded focus:outline-none focus:ring w-full"
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="VES">VES</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                value={categoriaSel}
                onChange={(e) => setCategoriaSel(e.target.value)}
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.codigo_cat} value={c.codigo_cat}>
                    {c.codigo_cat} - {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Subcategoría</label>
              <select
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                value={subcategoriaSel}
                onChange={(e) => setSubcategoriaSel(e.target.value)}
                disabled={!categoriaSel || !subcategorias.length}
              >
                <option value="">Sin subcategoría</option>
                {subcategorias.map((s) => (
                  <option key={s.codigo_subcat} value={s.codigo_subcat}>
                    {s.codigo_subcat} - {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-6">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-medium mb-1">Proveedor</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Comprobante</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                value={comprobante}
                onChange={(e) => setComprobante(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <label className="block text-sm font-medium mb-1">
              {equivalenciaVes != null
                ? `Monto (VES): Bs ${equivalenciaVes.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}`
                : 'Monto (VES): —'}
            </label>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 rounded bg-Regalia text-white hover:bg-purple-800">
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

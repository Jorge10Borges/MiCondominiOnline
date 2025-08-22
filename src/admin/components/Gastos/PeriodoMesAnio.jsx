import React from 'react';

const MESES = [
  { v: '01', n: 'Enero' },
  { v: '02', n: 'Febrero' },
  { v: '03', n: 'Marzo' },
  { v: '04', n: 'Abril' },
  { v: '05', n: 'Mayo' },
  { v: '06', n: 'Junio' },
  { v: '07', n: 'Julio' },
  { v: '08', n: 'Agosto' },
  { v: '09', n: 'Septiembre' },
  { v: '10', n: 'Octubre' },
  { v: '11', n: 'Noviembre' },
  { v: '12', n: 'Diciembre' },
];

export default function PeriodoMesAnio({ value, onChange, minYear, maxYear }) {
  const now = new Date();
  const [yy, mm] = (value || '').split('-');
  const year = yy || String(now.getFullYear());
  const month = mm || String(now.getMonth() + 1).padStart(2, '0');

  const startYear = minYear ?? (now.getFullYear() - 5);
  const endYear = maxYear ?? (now.getFullYear() + 1);
  const years = [];
  for (let y = endYear; y >= startYear; y--) years.push(String(y));

  const handleYear = (e) => {
    const newYear = e.target.value;
    onChange?.(`${newYear}-${month}`);
  };
  const handleMonth = (e) => {
    const newMonth = e.target.value;
    onChange?.(`${year}-${newMonth}`);
  };

  return (
    <div className="flex gap-2 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
        <select className="w-40 px-3 py-2 border rounded focus:outline-none focus:ring" value={month} onChange={handleMonth}>
          {MESES.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
        <select className="w-28 px-3 py-2 border rounded focus:outline-none focus:ring" value={year} onChange={handleYear}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

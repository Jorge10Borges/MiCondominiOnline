import React from 'react';

export default function ConfirmDialog({ open, title = 'Confirmar acción', message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw]">
        <h3 className="text-lg font-bold mb-2 text-gray-800">{title}</h3>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

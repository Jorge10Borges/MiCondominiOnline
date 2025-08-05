import React from 'react';

/**
 * Componente de confirmación reutilizable.
 * Props:
 * - open: boolean (si el modal está visible)
 * - title: string (título del cuadro)
 * - message: string (mensaje de confirmación)
 * - onCancel: función para cancelar/cerrar
 * - onConfirm: función para confirmar
 * - confirmText: string (texto del botón confirmar, opcional)
 * - cancelText: string (texto del botón cancelar, opcional)
 */
export default function ConfirmDialog({
  open,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que deseas continuar?',
  onCancel,
  onConfirm,
  confirmText = 'Sí, eliminar',
  cancelText = 'Cancelar',
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-2 p-6 relative animate-fade-in overflow-x-auto">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onCancel}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-2 text-center">{title}</h2>
        <p className="mb-6 text-center text-gray-700 break-words whitespace-pre-line max-w-full mx-auto">{message}</p>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function UsuarioModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

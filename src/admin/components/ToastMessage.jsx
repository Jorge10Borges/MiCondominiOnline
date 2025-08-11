import React, { useEffect } from 'react';

/**
 * Componente ToastMessage
 * Props:
 * - message: string (mensaje a mostrar)
 * - type: 'success' | 'error' | 'info' (color y estilo)
 * - duration: número en ms (opcional, por defecto 3000)
 * - onClose: función para cerrar el toast
 */
export default function ToastMessage({ show = true, message, type = 'info', duration = 3000, onClose }) {
  useEffect(() => {
    if (show && message) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, message, duration, onClose]);

  if (!show || !message) return null;

  let bgColor = 'bg-blue-600';
  if (type === 'success') bgColor = 'bg-green-600';
  if (type === 'error') bgColor = 'bg-red-600';

  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold ${bgColor} animate-fade-in`}
      style={{ minWidth: 220 }}
    >
      {message}
      <button
        className="ml-4 text-white/80 hover:text-white text-lg font-bold focus:outline-none cursor-pointer"
        onClick={handleClose}
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}

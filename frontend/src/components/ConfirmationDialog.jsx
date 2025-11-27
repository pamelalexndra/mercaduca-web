import React from "react";

const ConfirmationDialog = ({ show, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-300 p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Confirmar acción
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Aceptar
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;

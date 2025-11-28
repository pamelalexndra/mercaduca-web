import React from "react";

const SuccessDialog = ({ show, message, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-300 p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-green-600">¡Éxito!</h3>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="bg-[#557051] text-white py-2 px-6 rounded-lg hover:bg-[#445a3f] transition-colors font-semibold"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessDialog;

import React from "react";

const RequestDialog = ({ show, onConfirm, solicitudData }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-300 p-6 max-w-lg w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-blue-600">
            Solicitud registrada con éxito
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 leading-relaxed mb-4">
            Su solicitud está en proceso de revisión. Nos pondremos en contacto
            con usted vía correo electrónico al finalizar este proceso.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">
              Por favor guarde su usuario y contraseña:
            </p>
            <div className="space-y-2">
              {solicitudData && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Usuario:
                    </span>
                    <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      {solicitudData.usuario}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Su correo registrado:{" "}
                    <span className="font-semibold">
                      {solicitudData.correo}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Importante:</span> En caso de que
              su solicitud sea aceptada, necesitará su usuario y contraseña para
              iniciar sesión.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="bg-[#557051] text-white py-2 px-6 rounded-lg hover:bg-[#445a3f] transition-colors font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDialog;

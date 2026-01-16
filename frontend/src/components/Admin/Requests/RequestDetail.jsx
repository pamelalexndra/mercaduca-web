import React, { useState } from "react";

const RequestDetail = ({ solicitud, onBack, onAccept, onReject }) => {
  const [razon, setRazon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Función para formatear fecha a día/mes/año
  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleAccept = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await onAccept();
    } catch (err) {
      setError(err.message || "Error al aceptar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setError("");

    if (!razon.trim()) {
      setError("Por favor, ingresa un motivo para el rechazo.");
      return;
    }

    if (razon.trim().length < 10) {
      setError("El motivo del rechazo debe tener al menos 10 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject(razon);
    } catch (err) {
      setError(err.message || "Error al rechazar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-montserrat">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2 disabled:opacity-50"
        disabled={isSubmitting}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Volver a solicitudes
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Solicitud de registro
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Nombres</h3>
            <p className="text-gray-900">{solicitud.nombres}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Apellidos
            </h3>
            <p className="text-gray-900">{solicitud.apellidos}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Usuario</h3>
            <p className="text-gray-900">{solicitud.usuario}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Correo electrónico
            </h3>
            <p className="text-gray-900">{solicitud.correo}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Teléfono</h3>
            <p className="text-gray-900">{solicitud.telefono}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Fecha de solicitud
            </h3>
            <p className="text-gray-900">
              {formatDate(
                solicitud.fecha_registro || solicitud.fecha_solicitud
              )}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Descripción de la solicitud
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap">
              {solicitud.descripcion_solicitud ||
                "No se proporcionó descripción."}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Comentario/motivo (solo para rechazo) *
          </h3>
          <textarea
            value={razon}
            onChange={(e) => {
              setRazon(e.target.value);
              if (error) setError(""); // Limpiar error cuando el usuario empieza a escribir
            }}
            placeholder="Escribe aquí el motivo del rechazo..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#557051] focus:border-transparent min-h-[100px] disabled:opacity-50"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Este campo es obligatorio para rechazar la solicitud (mínimo 10
            caracteres)
          </p>
        </div>

        {/* Mostrar errores aquí */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAccept}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-[#557051] to-[#6a8a62] text-white rounded-lg hover:from-[#445a3f] hover:to-[#557051] disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Procesando...
              </>
            ) : (
              "Aceptar solicitud"
            )}
          </button>
          <button
            onClick={handleReject}
            disabled={isSubmitting || !razon.trim()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex-1 transition-colors"
          >
            Rechazar solicitud
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;

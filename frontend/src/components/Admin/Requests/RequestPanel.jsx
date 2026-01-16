import React from "react";
import RequestDetail from "./RequestDetail";

const RequestPanel = ({
  solicitudes,
  selectedSolicitud,
  setSelectedSolicitud,
  showConfirmation,
  loading,
  handleAcceptSolicitud,
  handleRejectSolicitud,
}) => {
  // Función para formatear fecha a día/mes/año
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  if (selectedSolicitud) {
    return (
      <RequestDetail
        solicitud={selectedSolicitud}
        onBack={() => setSelectedSolicitud(null)}
        onAccept={() => {
          showConfirmation(
            "accept_solicitud",
            selectedSolicitud.id_solicitud || selectedSolicitud.id,
            "Aceptar Solicitud",
            `¿Estás seguro de que deseas aceptar la solicitud de ${selectedSolicitud.nombres} ${selectedSolicitud.apellidos}?`,
            () => handleAcceptSolicitud(selectedSolicitud.id_solicitud || selectedSolicitud.id)
          );
        }}
        onReject={(razon) => {
          showConfirmation(
            "reject_solicitud",
            selectedSolicitud.id_solicitud || selectedSolicitud.id,
            "Rechazar Solicitud",
            `¿Estás seguro de que deseas rechazar la solicitud de ${selectedSolicitud.nombres} ${selectedSolicitud.apellidos}?`,
            () => handleRejectSolicitud(selectedSolicitud.id_solicitud || selectedSolicitud.id, razon)
          );
        }}
      />
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <div
        className="h-full overflow-y-auto pr-2"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
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
              <p className="text-gray-500">Cargando solicitudes...</p>
            </div>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay solicitudes pendientes
          </div>
        ) : (
          <>
            {solicitudes.slice(0, 6).map((solicitud) => (
              <div
                key={solicitud.id_solicitud || solicitud.id}
                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer p-4 transition-colors"
                onClick={() => setSelectedSolicitud(solicitud)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Nueva solicitud de registro
                    </div>
                    <div className="text-sm text-gray-600">
                      {solicitud.nombres} {solicitud.apellidos}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {solicitud.correo}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(solicitud.fecha_registro || solicitud.fecha_solicitud)}
                  </div>
                </div>
              </div>
            ))}
            {solicitudes.length > 6 && (
              <div className="text-center py-4 text-sm text-gray-500 border-t">
                Mostrando 6 de {solicitudes.length} solicitudes - Usa la barra
                de desplazamiento para ver más
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RequestPanel;
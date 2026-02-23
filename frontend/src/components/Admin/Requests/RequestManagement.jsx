import React, { useState, useEffect } from "react";
import RequestPanel from "./RequestPanel";
import ConfirmationDialog from "../../ConfirmationDialog";
import SuccessDialog from "../../SuccessDialog";
import { API_BASE_URL } from "../../../utils/api";

export default function RequestManagement() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmation, setConfirmation] = useState({
    show: false,
    type: "",
    id: null,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [success, setSuccess] = useState({
    show: false,
    message: "",
  });

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Función para obtener las solicitudes
  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/request`);
      const data = await response.json();

      if (data.success) {
        setSolicitudes(data.data || []);
      } else {
        console.error("Error al obtener solicitudes:", data.message);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar solicitudes al montar el componente
  useEffect(() => {
    fetchSolicitudes();
  }, []);

  // Función para mostrar el diálogo de confirmación
  const showConfirmation = (type, id, title, message, onConfirm) => {
    setConfirmation({
      show: true,
      type,
      id,
      title,
      message,
      onConfirm: () => handleConfirmedAction(type, id, onConfirm),
    });
  };

  // Función para manejar la acción confirmada
  const handleConfirmedAction = async (type, id, onConfirm) => {
    setConfirmation((prev) => ({ ...prev, show: false }));

    try {
      // Ejecutar la acción (aceptar/rechazar)
      await onConfirm();

      // Mostrar mensaje de éxito
      const successMessage =
        type === "accept_solicitud"
          ? "Solicitud aceptada con éxito"
          : "Solicitud rechazada con éxito";

      setSuccess({
        show: true,
        message: successMessage,
      });

      // Actualizar la lista de solicitudes
      await fetchSolicitudes();

      // Si hay una solicitud seleccionada y fue procesada, volver al listado
      if (
        selectedSolicitud &&
        (selectedSolicitud.id_solicitud === id || selectedSolicitud.id === id)
      ) {
        setSelectedSolicitud(null);
      }
    } catch (error) {
      console.error("Error en la acción:", error);

      // Mostrar mensaje de error
      setSuccess({
        show: true,
        message: error.message || "Ocurrió un error al procesar la solicitud",
      });
    }
  };

  // Función para aceptar una solicitud
  const handleAcceptSolicitud = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No estás autenticado. Por favor, inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/request/accept/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al aceptar la solicitud");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Error al aceptar la solicitud");
      }

      return data;
    } catch (error) {
      console.error("Error aceptando solicitud:", error);
      throw error;
    }
  };

  // Función para rechazar una solicitud
  const handleRejectSolicitud = async (id, razon) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No estás autenticado. Por favor, inicia sesión.");
      }

      const response = await fetch(`${API_BASE_URL}/request/deny/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ razon }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al rechazar la solicitud");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Error al rechazar la solicitud");
      }

      return data;
    } catch (error) {
      console.error("Error rechazando solicitud:", error);
      throw error;
    }
  };

  // Función para cerrar el diálogo de confirmación
  const handleCancelConfirmation = () => {
    setConfirmation((prev) => ({ ...prev, show: false }));
  };

  // Función para cerrar el diálogo de éxito
  const handleCloseSuccess = () => {
    setSuccess({ show: false, message: "" });
  };

  return (
    <div className="bg-cream font-montserrat text-gray-800 min-h-screen p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="bg-white rounded-3xl shadow-xl p-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-poppins text-3xl text-[#557051] font-bold">
                Gestión de solicitudes
              </h1>
              <p className="font-montserrat text-gray-500 mt-1">
                Gestiona las solicitudes de registro entrantes al{" "}
                <strong>MercadUCA</strong>
              </p>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="font-loubag text-xl text-[#557051] mb-6">
            Solicitudes pendientes
          </h2>
          <RequestPanel
            solicitudes={solicitudes}
            selectedSolicitud={selectedSolicitud}
            setSelectedSolicitud={setSelectedSolicitud}
            showConfirmation={showConfirmation}
            loading={loading}
            handleAcceptSolicitud={handleAcceptSolicitud}
            handleRejectSolicitud={handleRejectSolicitud}
          />
        </section>
      </div>

      {/* Diálogo de Confirmación */}
      <ConfirmationDialog
        show={confirmation.show}
        message={confirmation.message}
        onConfirm={confirmation.onConfirm}
        onCancel={handleCancelConfirmation}
      />

      {/* Diálogo de Éxito */}
      <SuccessDialog
        show={success.show}
        message={success.message}
        onConfirm={handleCloseSuccess}
      />
    </div>
  );
}
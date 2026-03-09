import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { API_BASE_URL } from "../../../utils/api.js";
import AdminPanel from "./AdminPanel";
import AdminForm from "./AdminForm";
import ConfirmationDialog from "../../ConfirmationDialog";
import SuccessDialog from "../../SuccessDialog";
import { useNavigate } from "react-router-dom";

export default function AdministratorsManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.id || payload.userId || null;
      } catch (error) {
        console.error("Error decodificando token:", error);
        return null;
      }
    }
    return null;
  };

  // Cargar administradores
  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(`${API_BASE_URL}/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.data || []);
        setCurrentUserId(getCurrentUserId());
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al cargar administradores");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Mostrar formulario para agregar nuevo administrador
  const handleAddAdmin = () => {
    setAdminToEdit(null);
    setShowAdminForm(true);
  };

  // Editar administrador
  const handleEditAdmin = (admin) => {
    setAdminToEdit(admin);
    setShowAdminForm(true);
  };

  // Eliminar administrador
  const handleDeleteAdmin = async (adminId, adminName) => {
    // Validar que haya al menos 2 administradores
    if (admins.length < 2) {
      setError(
        "No se puede eliminar este administrador. Debe haber al menos un administrador en el sistema.",
      );
      return;
    }

    setAdminToDelete({ id: adminId, name: adminName });
    setShowConfirm(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!adminToDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(
        `${API_BASE_URL}/user/profile/${adminToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const isDeletingSelf = adminToDelete.id === currentUserId;

        setAdmins((prev) =>
          prev.filter((admin) => admin.id_usuario !== adminToDelete.id),
        );

        setSuccessMessage(
          `Administrador "${adminToDelete.name}" eliminado exitosamente`,
        );
        setShowSuccess(true);
        setShowConfirm(false);

        // Si el administrador se eliminó a sí mismo, cerrar sesión y redirigir
        if (isDeletingSelf) {
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/");
          }, 2000); // Dar tiempo para ver el mensaje de éxito
        }

        setAdminToDelete(null);
      } else {
        const data = await response.json();
        setError(data.error || "Error al eliminar administrador");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión con el servidor");
    }
  };

  // Manejar éxito de registro/actualización
  const handleAdminSuccess = (adminData) => {
    if (adminToEdit) {
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id_usuario === adminData.id_usuario ? adminData : admin,
        ),
      );
      setSuccessMessage("Administrador actualizado exitosamente");
    } else {
      // Agregar nuevo administrador a la lista
      setAdmins((prev) => [...prev, adminData]);
      setSuccessMessage("Administrador creado exitosamente");
    }
    setShowAdminForm(false);
    setShowSuccess(true);
    setAdminToEdit(null);
    fetchAdmins();
  };

  // Mostrar diálogo de confirmación para AdminPanel
  const showConfirmationDialog = (type, id, title, message, onConfirm) => {
    onConfirm();
  };

  // Cerrar diálogo de éxito
  const handleCloseSuccessDialog = () => {
    setShowSuccess(false);
    setSuccessMessage("");
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    setShowConfirm(false);
    setAdminToDelete(null);
  };

  // Cerrar formulario
  const handleCloseForm = () => {
    setShowAdminForm(false);
    setAdminToEdit(null);
  };

  return (
    <div className="bg-cream font-montserrat text-gray-800 min-h-screen p-4 md:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">
        {/* Header */}
        <header className="bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl p-6 md:p-8 lg:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <div>
              <h1 className="font-poppins text-2xl md:text-3xl text-[#557051] font-bold">
                Gestión de Administradores
              </h1>
              <p className="font-montserrat text-gray-500 mt-1 text-sm md:text-base">
                Gestiona los administradores del <strong>MercadUCA</strong>
              </p>
            </div>
            <div className="w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={handleAddAdmin}
                disabled={admins.length >= 3}
                className="bg-[#557051] text-white font-medium py-2.5 px-6 rounded-lg hover:bg-[#455a42] transition-colors flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                <PlusCircle size={18} />
                Agregar administrador
              </button>
            </div>
          </div>
        </header>

        {/* Panel de administradores */}
        <section className="bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-loubag text-lg md:text-xl text-[#557051]">
                Administradores registrados
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {admins.length} administrador{admins.length !== 1 ? "es" : ""}{" "}
                registrado{admins.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-xs md:text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
              Máximo 3 administradores
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {admins.length >= 3 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  Se ha alcanzado el límite máximo de 3 administradores.
                </span>
              </div>
            </div>
          )}

          <AdminPanel
            admins={admins}
            loading={loading}
            onEditAdmin={handleEditAdmin}
            onDeleteAdmin={handleDeleteAdmin}
            showConfirmation={showConfirmationDialog}
            currentUserId={currentUserId}
          />
        </section>
      </div>

      {showAdminForm && (
        <AdminForm
          adminToEdit={adminToEdit}
          onClose={handleCloseForm}
          onSuccess={handleAdminSuccess}
          loadingAdmins={loading}
        />
      )}

      <ConfirmationDialog
        show={showConfirm}
        message={`¿Estás seguro de que deseas eliminar al administrador ${adminToDelete?.name}? Esta acción no se puede deshacer.${
          adminToDelete?.id === currentUserId
            ? " Al eliminarte a ti mismo, se cerrará tu sesión."
            : ""
        }`}
        onConfirm={confirmDelete}
        onCancel={handleCancelDelete}
      />

      <SuccessDialog
        show={showSuccess}
        message={successMessage}
        onConfirm={handleCloseSuccessDialog}
      />
    </div>
  );
}

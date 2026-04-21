import React, { useState, useEffect } from "react";
import RegisterAdmin from "./RegisterAdmin";
import TwoFactorSetupModal from "./TwoFactorSetupModal";
import { API_BASE_URL } from "../../../utils/api";

const AdminForm = ({ adminToEdit, onClose, onSuccess, loadingAdmins }) => {
  const [error, setError] = useState("");
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loadingTwoFactorStatus, setLoadingTwoFactorStatus] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const userId = adminToEdit?.id_usuario || adminToEdit?.id;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id || payload.userId || null);
      } catch (error) {
        // Error decodificando token
      }
    }
  }, []);

  useEffect(() => {
    if (userId && adminToEdit) {
      fetchTwoFactorStatus();
    }
  }, [userId]);

  const fetchTwoFactorStatus = async () => {
    if (!userId) return;

    setLoadingTwoFactorStatus(true);
    try {
      const token = localStorage.getItem("token");
      // Pasar el userId como parámetro para obtener el estado del administrador específico
      const response = await fetch(
        `${API_BASE_URL}/2fa/status?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setTwoFactorEnabled(data.enabled);
      }
    } catch (error) {
      // Error obteniendo estado 2FA
    } finally {
      setLoadingTwoFactorStatus(false);
    }
  };

  const handleTwoFactorStatusChange = (newStatus) => {
    setTwoFactorEnabled(newStatus);
  };

  const handleTwoFactorCodeChange = (code) => {
    setTwoFactorCode(code);
  };

  const handleRegisterSuccess = (adminData) => {
    setError("");
    onSuccess(adminData);
  };

  const isOwner = currentUserId === userId;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {adminToEdit ? "Editar administrador" : "Agregar administrador"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mx-4 md:mx-6 mt-4">
              {error}
            </div>
          )}

          <RegisterAdmin
            initialData={adminToEdit || null}
            onRegisterSuccess={handleRegisterSuccess}
            switchToLogin={onClose}
            loading={loadingAdmins}
            twoFactorEnabled={twoFactorEnabled}
            twoFactorCode={twoFactorCode}
          />

          {adminToEdit && userId && isOwner && (
            <div className="border-t border-gray-200 px-4 md:px-6 py-4 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    Verificación en dos pasos
                  </p>
                  <p className="text-xs text-gray-500">
                    {loadingTwoFactorStatus
                      ? "Cargando estado..."
                      : twoFactorEnabled
                        ? "Protege tu cuenta con autenticación de dos factores"
                        : "Añade una capa extra de seguridad a tu cuenta"}
                  </p>
                  <p
                    className={`text-sm font-medium mt-1 ${
                      loadingTwoFactorStatus
                        ? "text-gray-400"
                        : twoFactorEnabled
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    Estado:{" "}
                    {loadingTwoFactorStatus
                      ? "Cargando..."
                      : twoFactorEnabled
                        ? "Activada"
                        : "Desactivada"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTwoFactorModal(true)}
                  disabled={loadingTwoFactorStatus}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    loadingTwoFactorStatus
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : twoFactorEnabled
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                  }`}
                >
                  {loadingTwoFactorStatus
                    ? "Cargando..."
                    : twoFactorEnabled
                      ? "Desactivar 2FA"
                      : "Activar 2FA"}
                </button>
              </div>
            </div>
          )}

          {adminToEdit && userId && !isOwner && (
            <div className="border-t border-gray-200 px-4 md:px-6 py-4 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Verificación en dos pasos
                  </p>
                  <p className="text-xs text-gray-500">
                    {twoFactorEnabled
                      ? "Este administrador tiene 2FA activado"
                      : "Este administrador no tiene 2FA activado"}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg ${
                    twoFactorEnabled
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {twoFactorEnabled ? "Activada" : "Desactivada"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTwoFactorModal && userId && (
        <TwoFactorSetupModal
          isOpen={showTwoFactorModal}
          onClose={() => setShowTwoFactorModal(false)}
          userId={userId}
          userEmail={adminToEdit?.correo}
          currentStatus={twoFactorEnabled}
          onStatusChange={handleTwoFactorStatusChange}
          onCodeChange={handleTwoFactorCodeChange}
        />
      )}
    </div>
  );
};

export default AdminForm;

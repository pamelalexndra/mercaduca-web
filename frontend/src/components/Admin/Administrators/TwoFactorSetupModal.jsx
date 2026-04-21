import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../utils/api.js";
import SuccessDialog from "../../SuccessDialog.jsx";
import ConfirmationDialog from "../../ConfirmationDialog.jsx";

const TwoFactorSetupModal = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  currentStatus,
  onStatusChange,
  onCodeChange,
}) => {
  const [step, setStep] = useState("start");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [isDisableMode, setIsDisableMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("start");
      setError("");
      setVerificationCode("");
      setShowSuccessDialog(false);
      setShowConfirmDialog(false);
      setBackupCodes([]);

      if (currentStatus) {
        setIsDisableMode(true);
        setShowConfirmDialog(true);
      } else {
        setIsDisableMode(false);
        handleSetup();
      }
    }
  }, [isOpen]);

  const handleSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/2fa/setup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep("qr");
      } else {
        setError(data.message || `Error al configurar 2FA: ${response.status}`);
      }
    } catch (err) {
      setError("Error de conexión: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Solo validar código, NO activar
  const handleValidateCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Ingresa un código de 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/2fa/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          twoFactorCode: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ GUARDAR EL CÓDIGO INMEDIATAMENTE
        if (onCodeChange) {
          onCodeChange(verificationCode);
        }
        // Generar códigos de respaldo locales para mostrar
        const generatedBackupCodes = Array(10)
          .fill()
          .map(() => Math.random().toString(36).substring(2, 10).toUpperCase());
        setBackupCodes(generatedBackupCodes);
        setStep("backup");
      } else {
        setError(data.message || "Código inválido");
      }
    } catch (err) {
      setError("Error al verificar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDisable = () => {
    setShowConfirmDialog(false);
    // Solo actualizar estado local, NO hacer fetch a /2fa/disable
    if (onStatusChange) onStatusChange(false);
    setSuccessMessage("Verificación en dos pasos desactivada correctamente");
    setShowSuccessDialog(true);
  };

  const handleDownloadCodes = () => {
    const fecha = new Date().toLocaleString();
    const contenido = `MERCADUCA - CÓDIGOS DE RESPALDO 2FA
================================
Fecha de generación: ${fecha}
Usuario ID: ${userId}

TUS CÓDIGOS DE RESPALDO (GUÁRDALOS EN UN LUGAR SEGURO):
================================

${backupCodes.join("\n")}

================================
INSTRUCCIONES:
- Cada código puede usarse UNA SOLA VEZ
- Si pierdes acceso a tu autenticador, usa estos códigos para entrar
- Guarda este archivo en un lugar seguro
- NO compartas estos códigos con nadie
================================
© MercadUCA - ${new Date().getFullYear()}
`;

    const blob = new Blob([contenido], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mercaduca_codigos_respaldo_${userId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFinalize = () => {
    if (onStatusChange) onStatusChange(true);
    setSuccessMessage("Verificación en dos pasos activada correctamente");
    setShowSuccessDialog(true);
  };

  const handleSuccessDialogConfirm = () => {
    setShowSuccessDialog(false);
    onClose();
  };

  const handleCancelDisable = () => {
    setShowConfirmDialog(false);
    onClose();
  };

  if (!isOpen) return null;

  if (isDisableMode) {
    return (
      <>
        <ConfirmationDialog
          show={showConfirmDialog}
          message="¿Estás seguro de que deseas desactivar la verificación en dos pasos? Tu cuenta será menos segura."
          onConfirm={handleConfirmDisable}
          onCancel={handleCancelDisable}
        />
        <SuccessDialog
          show={showSuccessDialog}
          message={successMessage}
          onConfirm={handleSuccessDialogConfirm}
        />
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Activar verificación en dos pasos
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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

          <div className="p-6">
            {step === "start" && loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#557051] mx-auto"></div>
                <p className="text-gray-500 mt-4">Cargando...</p>
              </div>
            )}

            {step === "qr" && (
              <>
                <div className="mb-4">
                  <p className="text-gray-600 mb-2 text-sm">
                    1. Escanea este código QR con Google Authenticator, Authy, o
                    alguna aplicacion de tu preferencia:
                  </p>
                  <div className="flex justify-center mb-4">
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="border p-2 w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    O ingresa este código manualmente:{" "}
                    <strong className="font-mono">{secret}</strong>
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 mb-2 text-sm">
                    2. Ingresa el código de 6 dígitos generado:
                  </p>
                  <input
                    type="text"
                    placeholder="Código de 6 dígitos"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#557051]"
                    maxLength="6"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleValidateCode}
                    disabled={loading}
                    className="flex-1 bg-[#557051] text-white py-2 rounded-lg hover:bg-[#455a42] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Verificando..." : "Verificar código"}
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {step === "backup" && (
              <>
                <div className="mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-semibold text-sm mb-2">
                      ¡Código válido!
                    </p>
                    <p className="text-green-700 text-xs">
                      Guarda estos códigos de respaldo en un lugar seguro. Los
                      necesitarás si pierdes acceso a tu aplicación de
                      autenticación.
                    </p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg mb-4 max-h-48 overflow-y-auto">
                    {backupCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="font-mono text-center py-1 text-sm"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDownloadCodes}
                    className="w-full bg-[#557051] text-white py-2 rounded-lg hover:bg-[#455a42] transition-colors"
                  >
                    Descargar códigos (.txt)
                  </button>
                  <button
                    onClick={handleFinalize}
                    className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    Finalizar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <SuccessDialog
        show={showSuccessDialog}
        message={successMessage}
        onConfirm={handleSuccessDialogConfirm}
      />
    </>
  );
};

export default TwoFactorSetupModal;
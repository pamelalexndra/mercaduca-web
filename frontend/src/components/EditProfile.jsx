// src/components/EditProfile.jsx
import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import ConfirmationDialog from "./ConfirmationDialog";
import { API_BASE_URL } from "../utils/api";
import CredentialsSection from "./Register/CredentialsSection";

export default function EditProfile({
  visible,
  onClose,
  profileData,
  emprendimientoData,
  onSave,
  errorMessage = "",
  loading = false,
  onDeleteSuccess,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    username: "",
    password: "",
    confirmPassword: "",
    boxful_email: "",
    boxful_password: "",
    boxful_address_id: "",
    boxful_allows_card_payment: true,
  });

  const [boxfulAddresses, setBoxfulAddresses] = useState([]);
  const [isValidatingBoxful, setIsValidatingBoxful] = useState(false);
  const [boxfulConnectionStatus, setBoxfulConnectionStatus] = useState("idle");

  const [localError, setLocalError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: { warning: "", suggestions: [] },
  });

  const initializedRef = useRef(false);
  const { removeProfile, loadingDelete, errorDelete } = useProfile();

  const inputClass =
    "w-full bg-gray-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border border-gray-200 transition-all";

  // Inicializar form cuando abre
  useEffect(() => {
    if (visible) {
      if (!initializedRef.current) {
        setLocalError("");
        setShowConfirm(false);
        setUsernameAvailable(null);
        setBoxfulConnectionStatus("idle");

        if (profileData || emprendimientoData) {
          setFormData({
            nombres: profileData?.nombres || "",
            apellidos: profileData?.apellidos || "",
            correo: profileData?.correo || "",
            telefono: profileData?.telefono || "",
            username:
              profileData?.username ||
              emprendimientoData?.username ||
              emprendimientoData?.Usuario ||
              emprendimientoData?.usuario ||
              "",
            password: "",
            confirmPassword: "",
            boxful_email: emprendimientoData?.boxful_email || "",
            boxful_password: "",
            boxful_address_id: emprendimientoData?.boxful_address_id || "",
            boxful_allows_card_payment:
              emprendimientoData?.boxful_allows_card_payment ?? true,
          });
        }
        initializedRef.current = true;
      }
    } else {
      initializedRef.current = false;
    }
  }, [visible, profileData, emprendimientoData]);

  const handleConnectBoxful = async () => {
    if (!formData.boxful_email || !formData.boxful_password) {
      setLocalError("Ingresa tu correo y contraseña de Boxful para conectar.");
      return;
    }

    setIsValidatingBoxful(true);
    setBoxfulConnectionStatus("idle");
    setLocalError("");

    try {
      const response = await fetch(`${API_BASE_URL}/boxful/validate-credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.boxful_email,
          password: formData.boxful_password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const addresses = data.addresses || [];
        setBoxfulAddresses(addresses);
        setBoxfulConnectionStatus("success");

        if (addresses.length === 0) {
          setLocalError("Conexión exitosa, pero no tienes ninguna dirección registrada en Boxful. Ve a la web de Boxful, crea una dirección, y vuelve a intentarlo.");
        }
      } else {
        setBoxfulConnectionStatus("error");
        setLocalError(data.message || "Credenciales de Boxful inválidas.");
      }
    } catch (error) {
      setBoxfulConnectionStatus("error");
      setLocalError("Error de conexión con Boxful. Intenta de nuevo.");
    } finally {
      setIsValidatingBoxful(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password" || name === "confirmPassword") {
      setLocalError("");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUsernameCheck = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return null;
    }

    if (profileData?.username === username) {
      setUsernameAvailable(true);
      return true;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/check-username/${encodeURIComponent(username)}`
      );
      const data = await response.json();
      setUsernameAvailable(data.available);
      return data.available;
    } catch (error) {
      console.error("Error verificando usuario:", error);
      setUsernameAvailable(null);
      return null;
    }
  };

  useEffect(() => {
    if (formData.password) {
      const password = formData.password;
      let score = 0;
      const feedback = { warning: "", suggestions: [] };

      if (password.length >= 8) score += 1;
      if (password.length >= 12) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password)) score += 1;

      if (score <= 2) {
        feedback.warning = "Contraseña débil";
        feedback.suggestions = [
          "Usa al menos 8 caracteres",
          "Incluye mayúsculas, números y símbolos",
        ];
      } else if (score <= 4) {
        feedback.warning = "Contraseña media";
        feedback.suggestions = [
          "Agrega más variedad de caracteres para mejorarla",
        ];
      } else {
        feedback.warning = "Contraseña fuerte";
      }

      setPasswordStrength({ score: Math.min(score, 5), feedback });
    } else {
      setPasswordStrength({
        score: 0,
        feedback: { warning: "", suggestions: [] },
      });
    }
  }, [formData.password]);

  const handleDeleteClick = () => setShowConfirm(true);

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    const userId = emprendimientoData?.id_usuario;
    if (!userId) {
      setLocalError("No se pudo identificar el usuario.");
      return;
    }
    const success = await removeProfile(userId);
    if (success) onDeleteSuccess?.();
  };

  const handleCancelDelete = () => setShowConfirm(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setLocalError("Las contraseñas no coinciden.");
        return;
      }

      if (formData.password && passwordStrength.score < 3) {
        setLocalError(
          "La contraseña es demasiado débil. Usa al menos 8 caracteres, mayúsculas, números y símbolos."
        );
        return;
      }
    }

    if (formData.boxful_email && !formData.boxful_address_id) {
      setLocalError("Por favor valida tus credenciales y selecciona una dirección de Boxful.");
      return;
    }

    const available = await handleUsernameCheck(formData.username);

    if (available === false) {
      setLocalError("El nombre de usuario no está disponible.");
      return;
    }

    if (
      formData.username !==
      (emprendimientoData?.username ||
        emprendimientoData?.Usuario ||
        emprendimientoData?.usuario)
    ) {
      if (usernameAvailable === false) {
        setLocalError("El nombre de usuario no está disponible.");
        return;
      }

      if (usernameAvailable === null) {
        await handleUsernameCheck(formData.username);
        if (usernameAvailable === false) {
          setLocalError("El nombre de usuario no está disponible.");
          return;
        }
      }
    }

    setLocalError("");

    const dataToSend = {
      ...formData,
      ...(formData.password ? { nuevaContraseña: formData.password } : {}),
    };

    if (!dataToSend.boxful_password) {
      delete dataToSend.boxful_password;
    }

    delete dataToSend.password;
    delete dataToSend.confirmPassword;

    console.log("Datos enviados:", formData);
    console.log("DATASEND COMPLETO:", JSON.stringify(dataToSend));

    const success = await onSave?.(dataToSend);
    if (success) {
      onSuccess?.("Perfil actualizado correctamente");
    }
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  if (!visible) return null;

  const currentError = localError || errorMessage || errorDelete;

  const credentialsErrors = {};
  if (currentError) {
    if (currentError.includes("contraseñas no coinciden")) {
      credentialsErrors.confirmPassword = currentError;
    } else if (currentError.includes("usuario no está disponible")) {
      credentialsErrors.username = currentError;
    } else if (currentError.includes("contraseña es demasiado débil")) {
      credentialsErrors.password = currentError;
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 animate-fade-in pt-16 sm:pt-20"
        onClick={handleBackgroundClick}
      >
        <div className="bg-white rounded-2xl w-[95%] sm:w-[500px] lg:w-[520px] max-h-[90vh] overflow-y-auto relative shadow-2xl animate-slide-up border border-zinc-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all rounded-full p-2 z-20"
          >
            <X size={20} />
          </button>

          <div className="p-6 font-montserrat">
            <h2 className="text-xl font-bold text-zinc-800 mb-6 text-center">
              Editar perfil
            </h2>

            {currentError &&
              !credentialsErrors.username &&
              !credentialsErrors.password &&
              !credentialsErrors.confirmPassword && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {currentError}
                </div>
              )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombres */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Apellidos */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Correo */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  maxLength="8"
                  className={inputClass}
                />
              </div>

              <CredentialsSection
                formData={{
                  username: formData.username,
                  password: formData.password,
                  confirmPassword: formData.confirmPassword,
                }}
                onChange={handleChange}
                inputClass={inputClass}
                usernameAvailable={usernameAvailable}
                passwordStrength={passwordStrength}
                onUsernameCheck={handleUsernameCheck}
                isEditMode={true}
                errors={credentialsErrors}
              />

              {/* ── Sección de envíos (Boxful) ── */}
              <div className="border-t border-zinc-100 pt-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-700">
                    Conexión con Boxful (Envíos)
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Vincula tu cuenta de Boxful para que los pedidos se generen automáticamente desde tu perfil.
                  </p>
                </div>

                {/* Credenciales de Boxful */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-500">
                      Correo de Boxful
                    </label>
                    <input
                      type="email"
                      name="boxful_email"
                      value={formData.boxful_email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-500">
                      Contraseña de Boxful
                    </label>
                    <input
                      type="password"
                      name="boxful_password"
                      value={formData.boxful_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConnectBoxful}
                  disabled={isValidatingBoxful} // <--- ¡Le quitamos la condición de los correos aquí!
                  className="w-full px-4 py-3 bg-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  {isValidatingBoxful ? "Validando..." : "Validar y obtener direcciones"}
                </button>

                {/* Selector de direcciones de Boxful */}
                {boxfulAddresses && boxfulAddresses.length > 0 && (
                  <div className="space-y-1 pt-2 animate-fade-in">
                    <label className="block text-xs font-semibold text-[#557051]">
                      Selecciona tu dirección de recolección *
                    </label>
                    <select
                      name="boxful_address_id"
                      value={formData.boxful_address_id}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Selecciona una dirección...</option>
                      {boxfulAddresses.map((addr) => {
                        // Hacemos que sea a prueba de balas buscando la propiedad correcta
                        const textoDireccion = addr.address || addr.addressLine1 || addr.address_line_1 || "Dirección principal";
                        const nombreCiudad = addr.city?.name || (typeof addr.city === 'string' ? addr.city : "");

                        return (
                          <option key={addr.id} value={addr.id}>
                            {textoDireccion} {nombreCiudad ? `- ${nombreCiudad}` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* ¿Acepta pago con tarjeta? */}
                <div className="flex items-center justify-between py-2 border-t border-zinc-50 mt-2">
                  <div>
                    <p className="text-xs font-medium text-zinc-500">Aceptar pago con tarjeta</p>
                    <p className="text-xs text-zinc-400">El comprador podrá pagar con tarjeta desde el link de Boxful</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        boxful_allows_card_payment: !prev.boxful_allows_card_payment,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.boxful_allows_card_payment ? "bg-[#557051]" : "bg-gray-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.boxful_allows_card_payment ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                {/* Indicador de estado */}
                {formData.boxful_address_id ? (
                  <p className="text-xs text-[#557051] flex items-center gap-1">
                    <span>✓</span> Dirección de recolección vinculada
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <span>⚠</span> Sin configurar — tus clientes no podrán
                    solicitar envíos
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={loadingDelete || loading}
                  className="flex-1 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition disabled:opacity-50"
                >
                  {loadingDelete ? "Eliminando..." : "Eliminar perfil"}
                </button>

                <button
                  type="submit"
                  disabled={loading || loadingDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#557051] text-white hover:bg-[#445a3f] text-sm font-medium transition disabled:opacity-60"
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        show={showConfirm}
        message="¿Estás seguro de que deseas eliminar tu perfil? Esta acción eliminará tus emprendimientos y productos permanentemente."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
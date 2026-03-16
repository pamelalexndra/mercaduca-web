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
    boxful_state_id: "",
    boxful_city_id: "",
    direccion_recoleccion: "",
    referencia_recoleccion: "",
  });

  const [localError, setLocalError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [states, setStates] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: { warning: "", suggestions: [] },
  });

  const initializedRef = useRef(false);
  const { removeProfile, loadingDelete, errorDelete } = useProfile();

  const inputClass =
    "w-full bg-gray-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border border-gray-200 transition-all";

  // Cargar departamentos de Boxful
  useEffect(() => {
    if (visible) {
      fetch(`${API_BASE_URL}/boxful/states`)
        .then((r) => r.json())
        .then((data) => setStates(data.states || []))
        .catch(() => { });
    }
  }, [visible]);

  // Inicializar form cuando abre
  useEffect(() => {
    if (visible) {
      setLocalError("");
      setShowConfirm(false);
      setUsernameAvailable(null);

      if (emprendimientoData) {
        setFormData({
          nombres: emprendimientoData.nombres || "",
          apellidos: emprendimientoData.apellidos || "",
          correo: emprendimientoData.correo || "",
          telefono: emprendimientoData.telefono || "",
          username:
            emprendimientoData.username ||
            emprendimientoData.Usuario ||
            emprendimientoData.usuario ||
            "",
          password: "",
          confirmPassword: "",
          boxful_city_id: emprendimientoData.boxful_city_id || "",
          direccion_recoleccion: emprendimientoData.direccion_recoleccion || "",
          referencia_recoleccion:
            emprendimientoData.referencia_recoleccion || "",
        });
      }

      initializedRef.current = true;
    } else {
      initializedRef.current = false;
    }
  }, [visible]);

  // Preseleccionar departamento si ya tiene ciudad guardada
  useEffect(() => {
    if (states.length > 0 && emprendimientoData?.boxful_city_id) {
      const estadoPrevio = states.find((s) =>
        s.Cities?.some((c) => c.id === emprendimientoData.boxful_city_id),
      );
      if (estadoPrevio) {
        setSelectedStateId(estadoPrevio.id);

        setFormData((prev) => ({
          ...prev,
          boxful_state_id: estadoPrevio.id,
        }));
      }
    }
  }, [states, emprendimientoData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password" || name === "confirmPassword") {
      setLocalError("");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value;

    setSelectedStateId(stateId);

    setFormData((prev) => ({
      ...prev,
      boxful_state_id: stateId,
      boxful_city_id: "",
    }));
  };

  const handleUsernameCheck = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    if (
      emprendimientoData?.username === username ||
      emprendimientoData?.Usuario === username ||
      emprendimientoData?.usuario === username
    ) {
      setUsernameAvailable(true);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/check-username/${encodeURIComponent(username)}`,
      );
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("Error verificando usuario:", error);
      setUsernameAvailable(null);
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
          "La contraseña es demasiado débil. Usa al menos 8 caracteres, mayúsculas, números y símbolos.",
        );
        return;
      }
    }

    // Validar dirección de recolección
    if (formData.boxful_city_id && !formData.direccion_recoleccion.trim()) {
      setLocalError(
        "Si seleccionas un municipio, debes ingresar la dirección de recolección.",
      );
      return;
    }

    if (!formData.username.trim()) {
      setLocalError("El nombre de usuario es obligatorio.");
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

    console.log("Datos enviados:", formData);
    setLocalError("");

    const dataToSend = {
      ...formData,
      boxful_state_id: selectedStateId,  
      ...(formData.password ? { nuevaContraseña: formData.password } : {}),
    };
    delete dataToSend.password;
    delete dataToSend.confirmPassword;

    console.log("DATASEND COMPLETO:", JSON.stringify(dataToSend));
    const success = await onSave?.(dataToSend);
    if (success) onSuccess?.("Perfil actualizado correctamente");
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  if (!visible) return null;

  const currentError = localError || errorMessage || errorDelete;
  const cities = states.find((s) => s.id === selectedStateId)?.Cities || [];

  // Determina si la dirección de envíos está completa
  const enviosConfigurados =
    formData.boxful_city_id && formData.direccion_recoleccion.trim();

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

              {/* ── Sección de envíos ── */}
              <div className="border-t border-zinc-100 pt-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-700">
                    Dirección de recolección (envíos)
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Configura desde dónde Boxful recogerá los pedidos de tus
                    clientes. Se usará tu teléfono de perfil como contacto.
                  </p>
                </div>

                {/* Departamento y Municipio */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-500">
                      Departamento
                    </label>
                    <select
                      value={selectedStateId}
                      onChange={handleStateChange}
                      className={inputClass}
                    >
                      <option value="">Selecciona...</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-zinc-500">
                      Municipio
                    </label>
                    <select
                      name="boxful_city_id"
                      value={formData.boxful_city_id}
                      onChange={handleChange}
                      disabled={!selectedStateId}
                      className={`${inputClass} disabled:opacity-50 disabled:bg-zinc-100`}
                    >
                      <option value="">Selecciona...</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dirección exacta */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-500">
                    Dirección exacta {formData.boxful_city_id && "*"}
                  </label>
                  <input
                    type="text"
                    name="direccion_recoleccion"
                    value={formData.direccion_recoleccion}
                    onChange={handleChange}
                    placeholder="Colonia, Calle, Número de casa o local..."
                    className={inputClass}
                  />
                </div>

                {/* Punto de referencia */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-zinc-500">
                    Punto de referencia (opcional)
                  </label>
                  <input
                    type="text"
                    name="referencia_recoleccion"
                    value={formData.referencia_recoleccion}
                    onChange={handleChange}
                    placeholder="Ej. Frente al parque central"
                    className={inputClass}
                  />
                </div>

                {/* Indicador de estado */}
                {enviosConfigurados ? (
                  <p className="text-xs text-[#557051] flex items-center gap-1">
                    <span>✓</span> Dirección de recolección configurada
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
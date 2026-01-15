import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../utils/api.js";
import CredentialsSection from "../../Register/CredentialsSection.jsx";
import PersonalInfoSection from "../../Register/PersonalInfoSection.jsx";

const evaluatePasswordStrength = (password) => {
  const feedback = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Mínimo 8 caracteres");
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Mayúsculas y minúsculas");
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Al menos un número");
  }

  if (/[@$!%*?&#]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Al menos un símbolo (@$!%*?&)");
  }

  if (password.length >= 12) {
    score += 1;
  }

  return { score, feedback };
};

const areAllFieldsFilled = (formData, isEditMode) => {
  const requiredFields = [
    formData.username.trim(),
    formData.nombres.trim(),
    formData.apellidos.trim(),
    formData.correo.trim(),
    formData.telefono.trim(),
  ];

  if (!isEditMode) {
    requiredFields.push(
      formData.password.trim(),
      formData.confirmPassword.trim()
    );
  }

  return requiredFields.every((field) => field !== "");
};

const doPasswordsMatch = (password, confirmPassword, isEditMode) => {
  if (isEditMode && (!password || password === "")) {
    return true; // En modo edición, si no se cambia la contraseña, es válido
  }
  return password === confirmPassword && password !== "";
};

const isPasswordValid = (password, isEditMode) => {
  if (isEditMode && (!password || password === "")) {
    return true; // En modo edición, contraseña vacía es válida (no se cambia)
  }
  return (
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/.test(
      password
    ) && password.length >= 8
  );
};

const RegisterAdmin = ({
  initialData = null,
  onRegisterSuccess,
  switchToLogin,
  loading: externalLoading = false,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
  });
  const [errors, setErrors] = useState({});
  const [internalLoading, setInternalLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });
  const loading = externalLoading || internalLoading;
  const navigate = useNavigate();

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.usuario || "",
        password: "",
        confirmPassword: "",
        nombres: initialData.nombres || "",
        apellidos: initialData.apellidos || "",
        correo: initialData.correo || "",
        telefono: initialData.telefono || "",
      });
      setUsernameAvailable(true);
    }
  }, [initialData]);

  const inputClass =
    "w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] border border-gray-200 transition-all placeholder:text-gray-400";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      setPasswordStrength(evaluatePasswordStrength(value));
    }

    if (name === "username") {
      if (value.length >= 3) {
        if (isEditMode && value === initialData?.usuario) {
          setUsernameAvailable(true);
        } else {
          setTimeout(() => checkUsernameAvailability(value), 300);
        }
      } else {
        setUsernameAvailable(null);
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (!/^[a-zA-Z0-9]{3,30}$/.test(formData.username)) {
      newErrors.username = "Solo letras y números (3-30 caracteres)";
    }

    if (!formData.nombres.trim()) {
      newErrors.nombres = "Los nombres son requeridos";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombres)) {
      newErrors.nombres = "Solo letras y espacios";
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son requeridos";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidos)) {
      newErrors.apellidos = "Solo letras y espacios";
    }

    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "Correo electrónico inválido";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.telefono)) {
      newErrors.telefono = "Teléfono inválido";
    }

    if (!isEditMode) {
      if (!formData.password.trim()) {
        newErrors.password = "La contraseña es requerida";
      } else if (formData.password.length < 8) {
        newErrors.password = "Mínimo 8 caracteres";
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/.test(
          formData.password
        )
      ) {
        newErrors.password = "Mayúsculas, minúsculas, números y símbolos";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }

    if (
      isEditMode &&
      formData.password &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!isEditMode && usernameAvailable === false) {
      newErrors.username = "Este usuario no está disponible";
    }

    if (
      isEditMode &&
      formData.username !== initialData?.usuario &&
      usernameAvailable === false
    ) {
      newErrors.username = "Este usuario no está disponible";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/check-username/${encodeURIComponent(username)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar usuario");
      }

      setUsernameAvailable(data.available);
    } catch (error) {
      console.error("Error verificando username:", error);
      setUsernameAvailable(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setInternalLoading(true);

    try {
      const profileData = {
        username: formData.username,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo.toLowerCase(),
        telefono: formData.telefono,
      };

      if (formData.password.trim()) {
        profileData.password = formData.password;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado");
      }

      let endpoint, method;
      if (isEditMode) {
        endpoint = `${API_BASE_URL}/api/user/profile/${initialData.id_usuario}`;
        method = "PUT";
      } else {
        endpoint = `${API_BASE_URL}/api/admin`;
        method = "POST";
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Error al procesar la solicitud";

        if (data.errors && Array.isArray(data.errors)) {
          const fieldErrors = {};
          data.errors.forEach((err) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
          return;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }

        throw new Error(errorMessage);
      }

      // Éxito
      if (onRegisterSuccess) {
        onRegisterSuccess(data.data || data);
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setInternalLoading(false);
    }
  };

  const handleUsernameCheck = (username) => {
    if (username.length >= 3) {
      if (isEditMode && username === initialData?.usuario) {
        setUsernameAvailable(true);
      } else {
        checkUsernameAvailability(username);
      }
    }
  };

  // Función para verificar si el formulario está completo y válido
  const isFormCompleteAndValid = () => {
    if (!areAllFieldsFilled(formData, isEditMode)) {
      return false;
    }

    if (
      !doPasswordsMatch(formData.password, formData.confirmPassword, isEditMode)
    ) {
      return false;
    }

    if (!isEditMode && usernameAvailable === false) {
      return false;
    }

    if (
      isEditMode &&
      formData.username !== initialData?.usuario &&
      usernameAvailable === false
    ) {
      return false;
    }

    if (!isEditMode && !isPasswordValid(formData.password, isEditMode)) {
      return false;
    }

    return true;
  };

  return (
    <div className="p-4 md:p-6">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <PersonalInfoSection
          formData={formData}
          onChange={handleChange}
          inputClass={inputClass}
          errors={errors}
          isEditMode={isEditMode}
        />

        <CredentialsSection
          formData={formData}
          onChange={handleChange}
          inputClass={inputClass}
          usernameAvailable={usernameAvailable}
          passwordStrength={passwordStrength}
          onUsernameCheck={handleUsernameCheck}
          isEditMode={isEditMode}
          errors={errors}
        />

        {/* Error general - se muestra aquí, entre el último campo y los botones */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {errors.general}
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={switchToLogin}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full sm:w-auto border border-gray-300"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !isFormCompleteAndValid()}
            className="px-4 py-2.5 text-sm font-medium text-white bg-[#557051] hover:bg-[#455a42] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                {isEditMode ? "Actualizando..." : "Registrando..."}
              </>
            ) : isEditMode ? (
              "Guardar cambios"
            ) : (
              "Registrar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterAdmin;

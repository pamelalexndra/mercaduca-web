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

const areAllFieldsFilled = (formData, isEditMode) =>
  formData.username.trim() !== "" &&
  formData.nombres.trim() !== "" &&
  formData.apellidos.trim() !== "" &&
  formData.correo.trim() !== "" &&
  formData.telefono.trim() !== "" &&
  (isEditMode
    ? true
    : formData.password.trim() !== "" &&
      formData.confirmPassword.trim() !== "");

const doPasswordsMatch = (password, confirmPassword, isEditMode) =>
  isEditMode
    ? (password === "" && confirmPassword === "") ||
      password === confirmPassword
    : password === confirmPassword && password !== "";

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isPhoneValid = (phone) =>
  /^\+?[\d\s\-()]+$/.test(phone) &&
  phone.replace(/[\s\-()]/g, "").length >= 8 &&
  phone.replace(/[\s\-()]/g, "").length <= 20;

const isNameValid = (name) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);

const isPasswordValid = (password, isEditMode) => {
  if (isEditMode && password === "") return true; // En modo edición, contraseña vacía es válida
  return (
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/.test(
      password
    ) && password.length >= 8
  );
};

const isUsernameValid = (username) => /^[a-zA-Z0-9]{3,30}$/.test(username);

const isRegisterFormValid = (
  formData,
  usernameAvailable,
  passwordStrength,
  isEditMode
) =>
  areAllFieldsFilled(formData, isEditMode) &&
  doPasswordsMatch(formData.password, formData.confirmPassword, isEditMode) &&
  (isEditMode
    ? formData.username === initialData?.usuario || usernameAvailable !== false
    : usernameAvailable !== false) &&
  isPasswordValid(formData.password, isEditMode);

// Inicializar initialData fuera del componente para usar en la validación
let initialData = null;

const RegisterAdmin = ({
  initialData: propInitialData = null,
  onRegisterSuccess,
  switchToLogin,
}) => {
  initialData = propInitialData;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const isEditMode = Boolean(propInitialData);
  const adminId = propInitialData?.id_usuario || propInitialData?.id;

  useEffect(() => {
    if (propInitialData) {
      setFormData({
        username: propInitialData.usuario || "",
        password: "", // Dejar vacío por seguridad
        confirmPassword: "",
        nombres: propInitialData.nombres || "",
        apellidos: propInitialData.apellidos || "",
        correo: propInitialData.correo || "",
        telefono: propInitialData.telefono || "",
      });
      // En modo edición, marcar username como disponible si es el mismo
      setUsernameAvailable(true);
    }
  }, [propInitialData]);

  const inputClass =
    "w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] border border-gray-200 transition-all placeholder:text-gray-400";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      setPasswordStrength(evaluatePasswordStrength(value));
    }

    // Verificar disponibilidad de username cuando cambie
    if (name === "username") {
      if (value.length >= 3) {
        // En modo edición, si es el mismo username actual, marcarlo como disponible
        if (isEditMode && value === propInitialData?.usuario) {
          setUsernameAvailable(true);
        } else {
          setTimeout(() => checkUsernameAvailability(value), 300);
        }
      } else {
        setUsernameAvailable(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!areAllFieldsFilled(formData, isEditMode)) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!isUsernameValid(formData.username)) {
      setError(
        "El usuario debe contener solo letras y números (3-30 caracteres)"
      );
      return;
    }

    if (!isPasswordValid(formData.password, isEditMode)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas, números y símbolos (@$!%*?&#)"
      );
      return;
    }

    if (
      !doPasswordsMatch(formData.password, formData.confirmPassword, isEditMode)
    ) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!isNameValid(formData.nombres)) {
      setError("El nombre solo puede contener letras");
      return;
    }

    if (!isNameValid(formData.apellidos)) {
      setError("Los apellidos solo pueden contener letras");
      return;
    }

    if (!isEmailValid(formData.correo)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    if (!isPhoneValid(formData.telefono)) {
      setError(
        "Ingresa un teléfono válido (8-20 caracteres, puede incluir +, -, (), o espacios)"
      );
      return;
    }

    // Verificar disponibilidad de username
    if (!isEditMode && usernameAvailable === false) {
      setError("Este nombre de usuario no está disponible");
      return;
    }

    // En modo edición, verificar si el username cambió y está disponible
    if (
      isEditMode &&
      formData.username !== propInitialData?.usuario &&
      usernameAvailable === false
    ) {
      setError("Este nombre de usuario no está disponible");
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        username: formData.username,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo.toLowerCase(),
        telefono: formData.telefono,
      };

      // Solo incluir contraseña si se proporcionó
      if (formData.password.trim()) {
        profileData.password = formData.password;
      }

      // Obtener token del localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(
          "No estás autenticado. Por favor inicia sesión primero."
        );
      }

      let response;
      let endpoint;
      let method;

      if (isEditMode) {
        // Modo edición: PUT request al endpoint de updateProfile
        endpoint = `${API_BASE_URL}/api/user/profile/${adminId}`;
        method = "PUT";
      } else {
        // Modo creación: POST request al endpoint de admin
        endpoint = `${API_BASE_URL}/api/admin`;
        method = "POST";
      }

      response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = isEditMode
          ? "Error al actualizar administrador"
          : "Error al crear administrador";

        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join(", ");
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      // Éxito
      setSuccessMessage(
        isEditMode
          ? "¡Administrador actualizado exitosamente!"
          : "¡Administrador creado exitosamente!"
      );

      // Resetear formulario solo si no es modo edición
      if (!isEditMode) {
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          nombres: "",
          apellidos: "",
          correo: "",
          telefono: "",
        });
        setUsernameAvailable(null);
        setPasswordStrength({ score: 0, feedback: [] });
      }

      if (onRegisterSuccess) {
        onRegisterSuccess(data.data || data);
      }
    } catch (error) {
      setError(
        error.message ||
          (isEditMode
            ? "Error al actualizar administrador"
            : "Error al crear administrador")
      );
    } finally {
      setLoading(false);
    }
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

  const handleUsernameCheck = (username) => {
    // En modo edición, si es el mismo username actual, marcarlo como disponible
    if (isEditMode && username === propInitialData?.usuario) {
      setUsernameAvailable(true);
    } else {
      checkUsernameAvailability(username);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl mx-auto font-montserrat">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PersonalInfoSection
          formData={formData}
          onChange={handleChange}
          inputClass={inputClass}
        />

        <CredentialsSection
          formData={formData}
          onChange={handleChange}
          inputClass={inputClass}
          usernameAvailable={usernameAvailable}
          passwordStrength={passwordStrength}
          onUsernameCheck={handleUsernameCheck}
          isEditMode={isEditMode}
        />

        {/* Error message moved here - between last section and buttons */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
            {successMessage}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors shadow-md ${
              !isRegisterFormValid(
                formData,
                usernameAvailable,
                passwordStrength,
                isEditMode
              ) || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#557051] to-[#6a8a62] text-white hover:from-[#445a3f] hover:to-[#557051]"
            }`}
            disabled={
              !isRegisterFormValid(
                formData,
                usernameAvailable,
                passwordStrength,
                isEditMode
              ) || loading
            }
          >
            {loading
              ? isEditMode
                ? "Actualizando..."
                : "Creando administrador..."
              : isEditMode
                ? "Actualizar datos"
                : "Agregar administrador"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterAdmin;

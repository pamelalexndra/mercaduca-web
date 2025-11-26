import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";
import CredentialsSection from "./register/CredentialsSection";
import PersonalInfoSection from "./register/PersonalInfoSection";

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

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Al menos un carácter especial (!@#$% etc.)");
  }

  if (password.length >= 12) {
    score += 1;
  }

  return { score, feedback };
};

const areAllFieldsFilled = (formData) =>
  formData.username.trim() !== "" &&
  formData.password.trim() !== "" &&
  formData.confirmPassword.trim() !== "" &&
  formData.nombres.trim() !== "" &&
  formData.apellidos.trim() !== "" &&
  formData.correo.trim() !== "" &&
  formData.telefono.trim() !== "";

const doPasswordsMatch = (password, confirmPassword) =>
  password === confirmPassword && password !== "";

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isPhoneValid = (phone) => /^\d{8}$/.test(phone);

const isRegisterFormValid = (formData, usernameAvailable, passwordStrength) =>
  areAllFieldsFilled(formData) &&
  doPasswordsMatch(formData.password, formData.confirmPassword) &&
  // Comentado temporalmente para no limitar los registros por la fuerza de la contraseña
  // passwordStrength.score >= 3 &&
  usernameAvailable !== false;

const Register = ({ onRegisterSuccess, switchToLogin }) => {
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
  const navigate = useNavigate();
  const inputClass =
    "w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] border border-gray-200 transition-all placeholder:text-gray-400";

  // URL base del backend
  const AUTH_BASE_URL = `${API_BASE_URL}/api/auth`;

  const handleRegisterSuccess = () => {

    // Limpiar el formulario
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      nombres: "",
      apellidos: "",
      correo: "",
      telefono: "",
    });

    // Ejecutar el callback proporcionado por el padre (si existe)
    if (onRegisterSuccess) {
      onRegisterSuccess();
    }

    // Redirigir al login
    navigate("/perfil");
  };

  // Función para registrar usuario con fetch
  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/signUp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el registro");
      }

      return { data };
    } catch (error) {
      throw new Error(error.message || "Error de conexión");
    }
  };

  // Función para verificar username con fetch
  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    try {
      const response = await fetch(
        `${AUTH_BASE_URL}/check-username/${username}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar usuario");
      }

      setUsernameAvailable(data.available);
    } catch (error) {
      setUsernameAvailable(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      setPasswordStrength(evaluatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isRegisterFormValid(formData, usernameAvailable, passwordStrength)) {
      setError("Por favor completa todos los campos correctamente");
      return;
    }

    if (!doPasswordsMatch(formData.password, formData.confirmPassword)) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    // Comentado temporalmente para no limitar los registros por la fuerza de la contraseña
    // if (passwordStrength.score < 3) {
    //   setError(
    //     "La contraseña no cumple con los requisitos de seguridad mínimos"
    //   );
    //   return;
    // }

    if (
      !formData.nombres ||
      !formData.apellidos ||
      !formData.correo ||
      !formData.telefono
    ) {
      setError("Todos los campos de información personal son requeridos");
      return;
    }

    if (!isEmailValid(formData.correo)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    if (!isPhoneValid(formData.telefono)) {
      setError("El teléfono debe tener 8 dígitos");
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(formData);
      if (response.data.success) {
        // Extraemos user y token de la respuesta del backend
        const { user, token } = response.data;
        // Guardar token y usuario en localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAuthenticated", "true");
        handleRegisterSuccess();
      }
    } catch (error) {
      setError(error.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameCheck = (username) => {
    checkUsernameAvailability(username);
  };

  // Función para manejar el inicio de sesión
  const handleLoginClick = () => {
    navigate("/vender");
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl mx-auto font-montserrat">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Registro
      </h2>

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
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors shadow-md ${
            !isRegisterFormValid(formData, usernameAvailable, passwordStrength) ||
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#557051] to-[#6a8a62] text-white hover:from-[#445a3f] hover:to-[#557051]"
          }`}
          disabled={
            !isRegisterFormValid(formData, usernameAvailable, passwordStrength) ||
            loading
          }
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>

      <p className="text-center text-gray-950 mt-6">
        ¿Ya tienes cuenta?{" "}
        <span
          className="text-blue-600 cursor-pointer hover:underline font-semibold"
          onClick={handleLoginClick}
        >
          Inicia sesión aquí
        </span>
      </p>
    </div>
  );
};

export default Register;

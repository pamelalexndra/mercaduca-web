import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";
import CredentialsSection from "./Register/CredentialsSection";
import PersonalInfoSection from "./Register/PersonalInfoSection";

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

const isPhoneValid = (phone) =>
  /^\+?[\d\s\-()]+$/.test(phone) &&
  phone.replace(/[\s\-()]/g, "").length >= 8 &&
  phone.replace(/[\s\-()]/g, "").length <= 20;

const isNameValid = (name) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);

const isPasswordValid = (password) => {
  return (
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/.test(
      password
    ) && password.length >= 8
  );
};

const isUsernameValid = (username) => /^[a-zA-Z0-9]{3,30}$/.test(username);

const isRegisterFormValid = (formData, usernameAvailable, passwordStrength) =>
  areAllFieldsFilled(formData) &&
  doPasswordsMatch(formData.password, formData.confirmPassword) &&
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

  const AUTH_BASE_URL = `${API_BASE_URL}/api/auth`;

  const handleRegisterSuccess = () => {
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      nombres: "",
      apellidos: "",
      correo: "",
      telefono: "",
    });

    if (onRegisterSuccess) {
      onRegisterSuccess();
    }

    navigate("/perfil");
  };

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
        let errorMessage = "Error en el registro";

        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join(", ");
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      return { data };
    } catch (error) {
      console.error("Error en registerUser:", error);
      throw new Error(error.message || "Error de conexión con el servidor");
    }
  };

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    try {
      const response = await fetch(
        `${AUTH_BASE_URL}/check-username/${encodeURIComponent(username)}`
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

    if (!areAllFieldsFilled(formData)) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (!isUsernameValid(formData.username)) {
      setError(
        "El usuario debe contener solo letras y números (3-30 caracteres)"
      );
      return;
    }

    if (!isPasswordValid(formData.password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas, números y símbolos (@$!%*?&#)"
      );
      return;
    }

    if (!doPasswordsMatch(formData.password, formData.confirmPassword)) {
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

    if (usernameAvailable === false) {
      setError("El nombre de usuario no está disponible");
      return;
    }

    setLoading(true);
    try {
      const userDataForBackend = {
        username: formData.username,
        password: formData.password,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
        telefono: formData.telefono,
      };

      const response = await registerUser(userDataForBackend);

      if (response.data.success) {
        const { user, token } = response.data;

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

  const handleLoginClick = () => {
    navigate("/login");
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
            !isRegisterFormValid(
              formData,
              usernameAvailable,
              passwordStrength
            ) || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#557051] to-[#6a8a62] text-white hover:from-[#445a3f] hover:to-[#557051]"
          }`}
          disabled={
            !isRegisterFormValid(
              formData,
              usernameAvailable,
              passwordStrength
            ) || loading
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

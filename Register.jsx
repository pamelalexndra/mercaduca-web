import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// URL base del backend
const AUTH_BASE_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

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
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });
  const navigate = useNavigate();

  const handleRegisterSuccess = (user, token) => {

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isAuthenticated", "true");

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
      onRegisterSuccess(user);
    }

    navigate("/perfil");
  };

  // Función para registrar usuario con fetch
  const registerUser = async (userData) => {

    const response = await fetch(`${AUTH_BASE_URL}/signUp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        const errorObj = {};
        data.errors.forEach((err) => {
          errorObj[err.field] = err.message;
        });
        setValidationErrors(errorObj);
      }
      throw new Error(data.message || "Error en el registro");
    }

    return data; // { success: true, user: {...}, token: "..." }
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

  // Función para evaluar la fortaleza de la contraseña
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

  // Función para verificar si todos los campos están llenos
  const areAllFieldsFilled = () => {
    return (
      formData.username.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.confirmPassword.trim() !== "" &&
      formData.nombres.trim() !== "" &&
      formData.apellidos.trim() !== "" &&
      formData.correo.trim() !== "" &&
      formData.telefono.trim() !== ""
    );
  };

  // Función para verificar si las contraseñas coinciden
  const doPasswordsMatch = () => {
    return (
      formData.password === formData.confirmPassword && formData.password !== ""
    );
  };

  // Función para verificar si el formulario es válido
  const isFormValid = () => {
    return (
      areAllFieldsFilled() &&
      doPasswordsMatch() &&
      passwordStrength.score >= 3 &&
      usernameAvailable !== false
    );
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

  const getPasswordStrengthColor = (score) => {
    if (score === 0) return "bg-transparent";
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (score) => {
    if (score === 0) return "";
    if (score <= 2) return "Débil";
    if (score <= 3) return "Media";
    return "Fuerte";
  };

  const getPasswordStrengthTextColor = (score) => {
    if (score === 0) return "text-gray-500";
    if (score <= 2) return "text-red-600";
    if (score <= 3) return "text-yellow-600";
    return "text-green-600";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isFormValid()) {
      setError("Por favor completa todos los campos correctamente");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (passwordStrength.score < 3) {
      setError(
        "La contraseña no cumple con los requisitos de seguridad mínimos"
      );
      return;
    }

    if (
      !formData.nombres ||
      !formData.apellidos ||
      !formData.correo ||
      !formData.telefono
    ) {
      setError("Todos los campos de información personal son requeridos");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(formData.telefono)) {
      setError("El teléfono debe tener 8 dígitos");
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(formData);
      if (response.success) {
        // Extraemos user y token de la respuesta del backend
        const { user, token } = response;

        handleRegisterSuccess(user, token);
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
    <div className="bg-gray-300 p-8 rounded-lg shadow-md w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Registro
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN DE INFORMACIÓN PERSONAL */}
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Información Personal
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombres:
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa tus nombres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos:
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa tus apellidos"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico:
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono:
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12345678"
                maxLength="8"
                pattern="[0-9]{8}"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN DE CREDENCIALES */}
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Credenciales de Acceso
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario:
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={(e) => {
                  handleChange(e);
                  handleUsernameCheck(e.target.value);
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa tu usuario"
              />
              {usernameAvailable === true && (
                <div className="text-green-600 text-sm font-semibold mt-2">
                  ✓ Usuario disponible
                </div>
              )}
              {usernameAvailable === false && (
                <div className="text-red-600 text-sm font-semibold mt-2">
                  ✗ Usuario no disponible
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña:
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos"
              />

              {/* Indicador de fortaleza de contraseña */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(
                        passwordStrength.score
                      )}`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fortaleza: </span>
                    <span
                      className={`font-semibold ${getPasswordStrengthTextColor(
                        passwordStrength.score
                      )}`}
                    >
                      {getPasswordStrengthText(passwordStrength.score)}
                    </span>
                  </div>

                  {/* Lista de requisitos */}
                  <div className="bg-white p-3 rounded-md border border-gray-200 mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      La contraseña debe contener:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li
                        className={
                          formData.password.length >= 8
                            ? "text-green-600 font-semibold"
                            : ""
                        }
                      >
                        ✓ Mínimo 8 caracteres
                      </li>
                      <li
                        className={
                          /[a-z]/.test(formData.password) &&
                            /[A-Z]/.test(formData.password)
                            ? "text-green-600 font-semibold"
                            : ""
                        }
                      >
                        ✓ Mayúsculas y minúsculas
                      </li>
                      <li
                        className={
                          /\d/.test(formData.password)
                            ? "text-green-600 font-semibold"
                            : ""
                        }
                      >
                        ✓ Al menos un número
                      </li>
                      <li
                        className={
                          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                            formData.password
                          )
                            ? "text-green-600 font-semibold"
                            : ""
                        }
                      >
                        ✓ Al menos un carácter especial
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña:
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirma tu contraseña"
              />
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <div className="text-red-600 text-sm font-semibold mt-2">
                    ✗ Las contraseñas no coinciden
                  </div>
                )}
              {formData.confirmPassword &&
                formData.password === formData.confirmPassword && (
                  <div className="text-green-600 text-sm font-semibold mt-2">
                    ✓ Las contraseñas coinciden
                  </div>
                )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${!isFormValid() || loading
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"
            }`}
          disabled={!isFormValid() || loading}
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

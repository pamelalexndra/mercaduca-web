import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = ({ onRegisterSuccess }) => {
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
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });
  const navigate = useNavigate();

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Debounce para verificación de username
  const debounceTimeout = React.useRef(null);

  const handleRegisterSuccess = (user, token) => {

    // ⚠️ IMPORTANTE: Nunca guardar tokens en localStorage en producción
    // Es vulnerable a XSS. El backend debería enviar httpOnly cookies
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

  const registerUser = async (userData) => {
    
    const response = await fetch(`${API_BASE_URL}/api/auth/signUp`, {
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

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/check-username/${username}`
      );
      const data = await response.json();

      if (response.ok) {
        setUsernameAvailable(data.available);
      }
    } catch (error) {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

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

    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Al menos un símbolo (@$!%*?&)");
    }

    if (password.length >= 12) {
      score += 1;
    }

    return { score, feedback };
  };

  const isFormValid = () => {
    return (
      formData.username.trim().length >= 3 &&
      formData.password === formData.confirmPassword &&
      passwordStrength.score >= 3 &&
      formData.nombres.trim() !== "" &&
      formData.apellidos.trim() !== "" &&
      isValidEmail(formData.correo) &&
      /^\d{8}$/.test(formData.telefono) &&
      usernameAvailable !== false
    );
  };

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "correo") {
      if (value && !isValidEmail(value)) {
        setValidationErrors(prev => ({
          ...prev,
          correo: "Ingresa un correo válido",
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.correo;
          return newErrors;
        });
      }
    }

    if (name === "password") {
      setPasswordStrength(evaluatePasswordStrength(value));
    }

    if (name === "username") {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        if (value.length >= 3) {
          checkUsernameAvailability(value);
        } else {
          setUsernameAvailable(null);
        }
      }, 500);
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
    setValidationErrors({});

    if (!isFormValid()) {
      setError("Por favor completa todos los campos correctamente");
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(formData);
      if (response.success) {
        const { user, token } = response;

        handleRegisterSuccess(user, token);
      }
    } catch (error) {
      setError(error.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-300 p-8 rounded-lg shadow-md w-full max-w-4xl mx-auto my-8">
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.nombres ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Ingresa tus nombres"
              />
              {validationErrors.nombres && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.nombres}</p>
              )}
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.apellidos ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Ingresa tus apellidos"
              />
              {validationErrors.apellidos && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.apellidos}</p>
              )}
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.correo ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="ejemplo@correo.com"
              />
              {validationErrors.correo && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.correo}</p>
              )}
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="72355678"
                maxLength="8"
              />
              {validationErrors.telefono && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.telefono}</p>
              )}
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
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Mínimo 3 caracteres"
              />
              {checkingUsername && (
                <div className="text-gray-600 text-sm mt-2">
                  Verificando disponibilidad...
                </div>
              )}
              {!checkingUsername && usernameAvailable === true && (
                <div className="text-green-600 text-sm font-semibold mt-2">
                  ✓ Usuario disponible
                </div>
              )}
              {!checkingUsername && usernameAvailable === false && (
                <div className="text-red-600 text-sm font-semibold mt-2">
                  ✗ Usuario no disponible
                </div>
              )}
              {validationErrors.username && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.username}</p>
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Contraseña segura"
              />
              {validationErrors.password && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>
              )}

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
                          /[@$!%*?&]/.test(formData.password)
                            ? "text-green-600 font-semibold"
                            : ""
                        }
                      >
                        ✓ Al menos un símbolo especial
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
          className="text-green-800 cursor-pointer hover:underline font-semibold"
          onClick={() => navigate("/vender")}
        >
          Inicia sesión aquí
        </span>
      </p>
    </div>
  );
};

export default Register;
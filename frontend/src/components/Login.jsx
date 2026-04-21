import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import chicaFondoLogin from "../images/chicaFondoLogin.png";
import { API_BASE_URL } from "../utils/api";

const EMPRENDIMIENTO_CACHE_KEY = "emprendimientoCache";

const getUserId = (data) =>
  data?.id || data?.id_usuario || data?.userId || data?.idUser || null;

const normalizeProducto = (producto) => ({
  id: producto?.id ?? producto?.id_producto,
  nombre: producto?.nombre ?? producto?.Nombre ?? "",
  descripcion: producto?.descripcion ?? producto?.Descripcion ?? "",
  precio:
    producto?.precio ??
    producto?.precio_dolares ??
    producto?.Precio_dolares ??
    0,
  imagen:
    producto?.imagen ||
    producto?.imagen_url ||
    producto?.Imagen_URL ||
    producto?.Imagen_url ||
    "",
  id_categoria: producto?.id_categoria ?? null,
  stock: producto?.stock ?? producto?.existencias ?? producto?.Existencias ?? 0,
  disponible: producto?.disponible ?? producto?.Disponible ?? true,
  id_emprendimiento:
    producto?.emprendimiento_id ?? producto?.id_emprendimiento ?? null,
  categoria: producto?.categoria ?? producto?.Categoria,
});

const saveCachedEmprendimiento = (userId, emprendimiento) => {
  if (!userId || !emprendimiento) return;

  try {
    const raw = localStorage.getItem(EMPRENDIMIENTO_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[userId] = emprendimiento;
    localStorage.setItem(EMPRENDIMIENTO_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error("No se pudo guardar el cache de emprendimientos", e);
  }
};

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [showBackupOption, setShowBackupOption] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [usingBackup, setUsingBackup] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSuccess = async (user, token) => {
    const userRole = user.role || user.Rol || user.rol;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isAuthenticated", "true");

    if (onLoginSuccess) {
      onLoginSuccess(user);
    }

    if (userRole === "Administrador" || userRole === "administrador") {
      navigate("/Admin/entrepreneurship-applications");
      return;
    }

    const initialUserId = getUserId(user);
    let enrichedUser = { ...user, id: initialUserId, token };

    try {
      const profileResponse = await fetch(
        `${API_BASE_URL}/user/profile/${initialUserId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        },
      );

      if (!profileResponse.ok) {
        throw new Error("No se pudo obtener el perfil del usuario");
      }

      const profilePayload = await profileResponse.json();
      const profileData = profilePayload.profile || profilePayload;
      const emprendimiento = profileData.emprendimiento;
      const emprendimientoId =
        emprendimiento?.id_emprendimiento || emprendimiento?.id;
      const profileUserId = initialUserId || getUserId(profileData);

      let productos = [];

      if (emprendimientoId) {
        try {
          const productosResponse = await fetch(
            `${API_BASE_URL}/products?emprendimiento_id=${emprendimientoId}`,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
              },
            },
          );

          if (productosResponse.ok) {
            const productosPayload = await productosResponse.json();
            productos = (productosPayload.productos || []).map(
              normalizeProducto,
            );
          }
        } catch (productosError) {
          console.error(
            "No se pudieron obtener los productos al iniciar sesión",
            productosError,
          );
        }
      }

      enrichedUser = {
        ...user,
        id: profileUserId,
        token,
        profile: { ...profileData, productos },
      };

      if (emprendimiento && profileUserId) {
        saveCachedEmprendimiento(profileUserId, emprendimiento);
      }

      localStorage.setItem("user", JSON.stringify(enrichedUser));
      if (onLoginSuccess) {
        onLoginSuccess(enrichedUser);
      }
    } catch (profileError) {
      console.error("Error al obtener el perfil del usuario:", profileError);
    }

    navigate("/perfil");

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleBackupCodeSubmit = async () => {
    if (!backupCode.trim()) {
      setError("Ingresa un código de respaldo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/logIn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || "Error en el login");
      }

      const token = loginData.token;

      const backupResponse = await fetch(`${API_BASE_URL}/auth/2fa/backup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          backupCode: backupCode.toUpperCase(),
        }),
      });

      const backupData = await backupResponse.json();

      if (!backupResponse.ok) {
        throw new Error(backupData.message || "Código de respaldo inválido");
      }

      if (backupData.success) {
        await handleLoginSuccess(loginData.user, token);
      } else {
        throw new Error("Código de respaldo inválido");
      }
    } catch (err) {
      console.error("Error en backup code:", err);
      setError(err.message || "Error al verificar código de respaldo");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (usingBackup) {
      await handleBackupCodeSubmit();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/logIn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          twoFactorCode: twoFactorRequired ? twoFactorCode : undefined,
          rememberDevice: rememberDevice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.requiresTwoFactor) {
          setTwoFactorRequired(true);
          setPendingUserId(data.userId);
          setLoading(false);
          return;
        }
        throw new Error(data.message || "Error en el login");
      }

      if (data.success) {
        const { user, token } = data;
        const userId = getUserId(user);

        if (!user || !userId) {
          throw new Error("El usuario no tiene ID en la respuesta");
        }

        await handleLoginSuccess({ ...user, id: userId }, token);
      } else {
        throw new Error(data.message || "Error en el login");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError(error.message || "Error al iniciar sesión");
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate("/registrar");
  };

  const handleBackToLogin = () => {
    setTwoFactorRequired(false);
    setTwoFactorCode("");
    setShowBackupOption(false);
    setBackupCode("");
    setUsingBackup(false);
    setError("");
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      <div className="flex flex-1 items-center justify-center px-8 py-10 lg:px-16 order-2 lg:order-1">
        <div className="w-full max-w-sm text-center -translate-y-6 lg:-translate-y-8 pt-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 font-loubag">
            {twoFactorRequired
              ? "Verificación en dos pasos"
              : usingBackup
                ? "Código de respaldo"
                : "Iniciar sesión"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!twoFactorRequired && !usingBackup ? (
              <>
                <div className="mb-4 text-left font-montserrat">
                  <label
                    htmlFor="usuario"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Usuario
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Ingrese su usuario"
                    className="w-full p-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#557051]"
                  />
                </div>
                <div className="mb-4 text-left font-montserrat">
                  <label
                    htmlFor="contrasena"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Ingrese su contraseña"
                      className="w-full p-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#557051] pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="mb-4 flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 text-[#557051] border-gray-300 rounded focus:ring-[#557051] cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Recordar este dispositivo
                    </span>
                  </label>
                </div>
              </>
            ) : twoFactorRequired && !usingBackup ? (
              <>
                <div className="mb-4 text-left font-montserrat">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa el código de 6 dígitos"
                    value={twoFactorCode}
                    onChange={(e) =>
                      setTwoFactorCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    className="w-full p-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#557051] text-center text-2xl tracking-widest"
                    maxLength="6"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Abre Google Authenticator o Authy y ingresa el código de 6
                    dígitos
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUsingBackup(true);
                    setShowBackupOption(false);
                  }}
                  className="text-sm text-blue-600 hover:underline mb-4 w-full text-center"
                >
                  Perdiste acceso a tu autenticador? Usar código de respaldo
                </button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-sm text-gray-500 hover:underline mb-4 w-full text-center"
                >
                  Volver al inicio de sesión
                </button>
              </>
            ) : (
              <>
                <div className="mb-4 text-left font-montserrat">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Código de respaldo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: A3F8 K9D2 5E1C 7B4A"
                    value={backupCode}
                    onChange={(e) =>
                      setBackupCode(e.target.value.toUpperCase())
                    }
                    className="w-full p-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#557051] text-center font-mono tracking-wider"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Ingresa uno de los códigos de respaldo que guardaste al
                    activar 2FA
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUsingBackup(false);
                    setBackupCode("");
                  }}
                  className="text-sm text-blue-600 hover:underline mb-4 w-full text-center"
                >
                  Usar código de autenticador
                </button>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 rounded-full bg-[#557051]/90 text-white font-semibold font-montserrat hover:bg-[#557051] transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading
                ? "Verificando..."
                : twoFactorRequired
                  ? "Verificar código"
                  : usingBackup
                    ? "Verificar código de respaldo"
                    : "Iniciar sesión"}
            </button>
          </form>

          {!twoFactorRequired && !usingBackup && (
            <p className="text-sm text-gray-700 mt-4 font-montserrat">
              Quieres vender?{" "}
              <button
                type="button"
                className="text-[#2563EB] font-semibold hover:underline bg-transparent border-none cursor-pointer"
                onClick={handleRegisterClick}
              >
                Regístrate
              </button>
            </p>
          )}
        </div>
      </div>
      <div
        className="
          relative 
          order-1 lg:order-2 
          w-full h-[35vh] lg:h-auto lg:w-1/2 
          bg-cover bg-center bg-no-repeat
          lg:[clip-path:ellipse(90%_100%_at_100%_50%)]
        "
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.45), rgba(255,255,255,0.45)), url(${chicaFondoLogin})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
    </section>
  );
};

export default Login;
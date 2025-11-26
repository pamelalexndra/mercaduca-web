import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import chicaFondoLogin from "../images/chicaFondoLogin.png";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const EMPRENDIMIENTO_CACHE_KEY = "emprendimientoCache";

const getUserId = (data) =>
  data?.id || data?.id_usuario || data?.userId || data?.idUser || null;

const normalizeProducto = (producto) => ({
  id: producto?.id ?? producto?.id_producto,
  nombre: producto?.nombre ?? producto?.Nombre ?? "",
  descripcion: producto?.descripcion ?? producto?.Descripcion ?? "",
  precio: producto?.precio ?? producto?.precio_dolares ?? producto?.Precio_dolares ?? 0,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSuccess = async (user, token) => {

    let enrichedUser = { ...user, token };
    const userId = getUserId(user);

    try {
      const profileResponse = await fetch(
        `${API_BASE_URL}/api/user/profile/${userId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      if (!profileResponse.ok) {
        throw new Error("No se pudo obtener el perfil del usuario");
      }

      const profilePayload = await profileResponse.json();
      const profileData = profilePayload.profile || profilePayload;

      const emprendimiento = profileData.emprendimiento;
      const emprendimientoId =
        emprendimiento?.id_emprendimiento || emprendimiento?.id;

      let productos = [];

      if (emprendimientoId) {
        try {
          const productosResponse = await fetch(
            `${API_BASE_URL}/api/products?emprendimiento_id=${emprendimientoId}`,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
              },
            }
          );

          if (productosResponse.ok) {
            const productosPayload = await productosResponse.json();
            productos = (productosPayload.productos || []).map(normalizeProducto);
          }
        } catch (productosError) {
          console.error("No se pudieron obtener los productos al iniciar sesión", productosError);
        }
      }

      enrichedUser = {
        ...enrichedUser,
        profile: { ...profileData, productos },
      };

      if (emprendimiento && userId) {
        saveCachedEmprendimiento(profileUserId, emprendimiento);
      }
    } catch (profileError) {
      console.error("Error al obtener el perfil del usuario:", profileError);
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(enrichedUser));
    localStorage.setItem("isAuthenticated", "true");

    // Ejecutar el callback proporcionado por el padre (si existe)
    if (onLoginSuccess) {
      onLoginSuccess(enrichedUser);
    }

    // Redirigir al perfil
    navigate("/perfil");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logIn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el login");
      }

      if (data.success) {
        const { user, token } = data; // Recibimos user y token

        if (!user || !getUserId(user)) {
          throw new Error("El usuario no tiene ID en la respuesta");
        }

        await handleLoginSuccess(user, token);
      } else {
        throw new Error(data.message || "Error en el login");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el registro
  const handleRegisterClick = () => {
    navigate("/registrar");
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      <div className="flex flex-1 items-center justify-center px-8 py-10 lg:px-16 order-2 lg:order-1">
        <div className="w-full max-w-sm text-center -translate-y-6 lg:-translate-y-8 pt-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 font-loubag">
            Iniciar sesión
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="mb-6 text-left font-montserrat">
              <label
                htmlFor="contrasena"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Ingrese su contraseña"
                className="w-full p-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#557051]"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="
              w-full py-2 rounded-full bg-[#557051]/90 text-white 
              font-semibold font-montserrat 
              hover:bg-[#557051] transition"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-sm text-gray-700 mt-4 font-montserrat">
            ¿Quieres vender?{" "}
            <button
              type="button"
              className="text-[#2563EB] font-semibold hover:underline bg-transparent border-none cursor-pointer"
              onClick={handleRegisterClick}
            >
              Regístrate
            </button>
          </p>
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

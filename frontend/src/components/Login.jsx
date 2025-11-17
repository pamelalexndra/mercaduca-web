import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chicaFondoLogin from "../images/chicaFondoLogin.png";

const Login = ({ onLoginSuccess, switchToRegister }) => {
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

  const handleLoginSuccess = (user) => {
    // Guardar información del usuario en localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isAuthenticated", "true");

    // Guardar token si viene en la respuesta
    if (user.token) {
      localStorage.setItem("token", user.token);
    }

    // Ejecutar el callback proporcionado por el padre (si existe)
    if (onLoginSuccess) {
      onLoginSuccess(user);
    }

    // Redirigir al perfil
    navigate("/perfil");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/logIn", {
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

        // GUARDAR EL TOKEN
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        if (!user || !user.id) {
          throw new Error("El usuario no tiene ID en la respuesta");
        }

        handleLoginSuccess(user);
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

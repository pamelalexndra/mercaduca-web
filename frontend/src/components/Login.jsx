import React from "react";
import chicaFondoLogin from "../images/chicaFondoLogin.png";

export default function Login() {
  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      <div className="flex flex-1 items-center justify-center px-8 py-10 lg:px-16 order-2 lg:order-1">
        <div className="w-full max-w-sm text-center -translate-y-6 lg:-translate-y-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 font-loubag">
            Iniciar sesión
          </h2>
          <div className="mb-4 text-left font-montserrat">
            <label
              htmlFor="usuario"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Usuario
            </label>
            <input
              type="text"
              id="usuario"
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
              id="contrasena"
              placeholder="Ingrese su contraseña"
              className="w-full p-2 rounded-md border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#557051]"
            />
          </div>
          <button
            className="
              w-full py-2 rounded-full bg-[#557051]/90 text-white 
              font-semibold font-montserrat 
              hover:bg-[#557051] transition
            "
          >
            Iniciar sesión
          </button>
          <p className="text-sm text-gray-700 mt-4 font-montserrat">
            ¿Quieres vender?{" "}
            <a
              href="#"
              className="text-[#2563EB] font-semibold hover:underline"
            >
              Regístrate
            </a>
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
}

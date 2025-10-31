import React from "react";
import chicaFondoLogin from "../images/chicaFondoLogin.png";

export default function Login() {
  const myStyle = {
    backgroundImage: `linear-gradient(rgba(255,255,255,0.45), rgba(255,255,255,0.45)), url(${chicaFondoLogin})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "top center",
  };

  return (
    <section className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 lg:grid-flow-col-dense">
      <div
        style={myStyle}
        className="
          order-1 lg:order-2
          w-full 
          h-[35vh]
          bg-cover bg-no-repeat bg-top 
          lg:h-full 
          lg:[clip-path:circle(90%_at_100%_50%)]
          lg:[-webkit-clip-path:circle(90%_at_100%_50%)]
        "
      ></div>

      <div
        className="
          order-2 lg:order-1
          flex flex-col justify-center items-center 
          bg-white 
          rounded-t-[3rem] 
          shadow-lg 
          px-10 py-14 
          lg:rounded-none 
          lg:px-24 lg:py-0
          -mt-8
        "
      >
        <div className="w-full max-w-sm">
          <h1
            className="
    text-3xl font-loubag text-gray-800 mb-8 
    text-center 
    lg:text-left 
    lg:ml-8
  "
          >
            Iniciar sesión
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-base font-montserrat text-gray-700 mb-2 font-bold">
                Usuario
              </label>
              <input
                type="text"
                placeholder="Ingrese su usuario"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-[#e2e1e1] placeholder-[#8e9196] text-gray-800 font-montserrat focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="block text-base font-montserrat text-gray-700 mb-2 font-bold">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Ingrese su contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-[#e2e1e1] placeholder-[#8e9196] text-gray-800 font-montserrat focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="flex justify-center lg:justify-start pt-4">
              <button
                type="button"
                className="bg-[#557051] hover:bg-[#40583d] text-white font-montserrat font-semibold py-2 px-10 rounded-full shadow-md transition duration-300"
              >
                Iniciar sesión
              </button>
            </div>
          </div>

          <p className="mt-10 text-sm font-montserrat text-gray-700 mb-4 text-center lg:text-left">
            ¿Quieres vender?
            <a
              href="/register"
              className="ml-3 text-blue-600 font-montserrat font-semibold underline hover:text-blue-800 transition duration-200"
            >
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

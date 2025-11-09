import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, AlertCircle } from "lucide-react";
import badRequestImage from "../../images/búho_400.png";

export default function BadRequest() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-2">
          <AlertCircle className="w-12 h-12 text-blue-500 mx-auto" />
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          400 Bad Request
        </h1>
        <h2 className="text-xl font-semibold text-blue-600 mb-8">
          Solicitud Incorrecta
        </h2>

        <div className="mb-8">
          <img
            src={badRequestImage}
            alt="Solicitud incorrecta"
            className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-gray-600">
            La solicitud contiene datos incorrectos o incompletos.
          </p>
          <p className="text-sm text-gray-500">
            Por favor, verifica que toda la información esté completa y en el
            formato correcto.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="
              inline-flex items-center justify-center gap-2
              bg-[#557051] text-white px-6 py-3 
              rounded-lg hover:bg-[#456041] transition-colors
              font-medium
            "
          >
            <ArrowLeft size={18} />
            Regresar
          </button>

          <Link
            to="/"
            className="
              inline-flex items-center justify-center gap-2
              border border-gray-400 text-gray-700 px-6 py-3 
              rounded-lg hover:bg-gray-100 transition-colors
              font-medium
            "
          >
            <Home size={18} />
            Volver al Inicio
          </Link>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg border border-blue-200">
          <p className="text-xs text-gray-500">
            Posibles causas: datos faltantes, formato incorrecto, caracteres
            inválidos.
          </p>
        </div>
      </div>
    </div>
  );
}

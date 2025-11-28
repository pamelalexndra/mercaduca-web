import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, AlertCircle } from "lucide-react";
import forbiddenImage from "../../images/búho_403.png";

export default function Forbidden() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-2">
          <AlertCircle className="w-12 h-12 text-blue-500 mx-auto" />
        </div>

        {/* Código de error y título arriba de la imagen */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">403 Forbidden</h1>
        <h2 className="text-xl font-semibold text-blue-600 mb-8">
          Acceso Denegado
        </h2>

        {/* Imagen */}
        <div className="mb-8">
          <img
            src={forbiddenImage}
            alt="Acceso denegado"
            className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
        </div>

        {/* Información adicional debajo de la imagen */}
        <div className="space-y-4 mb-8">
          <p className="text-gray-600">
            No tienes permisos para acceder a este recurso.
          </p>
          <p className="text-sm text-gray-500">
            Contacta al administrador si crees que esto es un error.
          </p>
        </div>

        {/* Botones */}
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
            Posibles causas: permisos insuficientes, restricciones de acceso.
          </p>
        </div>
      </div>
    </div>
  );
}

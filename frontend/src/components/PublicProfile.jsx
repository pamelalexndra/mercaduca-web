import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "./Card";

export default function PublicProfile() {
  const { id } = useParams();
  const [productos, setProductos] = useState([]);
  const [emprendimiento, setEmprendimiento] = useState({
    nombre: "",
    imagen_url: "",
    descripcion: "",
    instagram: "",
    mercado_presencial: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Traer emprendimiento desde el backend
    fetch(`http://localhost:5000/api/entrepreneurship/${id}`)
      .then((res) => res.json())
      .then((data) => setEmprendimiento(data))
      .catch((err) => console.error("Error cargando emprendimiento:", err))
      .finally(() => setIsLoading(false));

    // Traer productos del emprendimiento
    fetch(`http://localhost:5000/api/products?emprendimiento_id=${id}`)
      .then((res) => res.json())
      .then((data) => setProductos(data.productos))
      .catch((err) => console.error("Error cargando productos:", err));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#557051]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-montserrat">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Desktop Layout */}
        <div className="hidden md:flex md:items-start md:gap-20 mb-11">
          {/* Foto de perfil */}
          <div className="flex-shrink-0">
            <img
              src={
                emprendimiento.imagen_url || "https://via.placeholder.com/160"
              }
              alt={emprendimiento.nombre}
              className="w-40 h-40 rounded-full object-cover border"
            />
          </div>

          {/* Info del perfil */}
          <div className="flex-1">
            {/* Username */}
            <div className="mb-5">
              <h1 className="text-2xl font-normal text-gray-900 mb-4">
                {emprendimiento.nombre}
              </h1>
            </div>

            {/* Estadísticas */}
            <div className="flex gap-10 mb-5">
              <div className="flex gap-1">
                <span className="font-semibold text-gray-900">
                  {productos.length}
                </span>
                <span className="text-gray-900">productos</span>
              </div>
            </div>

            {/* información */}
            <div className="text-sm space-y-2">
              {emprendimiento.descripcion && (
                <p className="text-gray-900 whitespace-pre-wrap">
                  {emprendimiento.descripcion}
                </p>
              )}

              {emprendimiento.instagram && (
                <a
                  href={`https://instagram.com/${emprendimiento.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-pink-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  @{emprendimiento.instagram.replace("@", "")}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center gap-4 mb-4 px-4">
            {/* Foto de perfil */}
            <img
              src={
                emprendimiento.imagen_url || "https://via.placeholder.com/80"
              }
              alt={emprendimiento.nombre}
              className="w-20 h-20 rounded-full object-cover border"
            />

            <div className="flex-1 flex items-center justify-start text-left ml-4">
              <div>
                <div className="font-semibold text-gray-900">
                  {productos.length}
                </div>
                <div className="text-xs text-gray-500">productos</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="px-4 mb-4 text-sm space-y-2">
            <p className="font-semibold text-gray-900">
              {emprendimiento.nombre}
            </p>

            {emprendimiento.descripcion && (
              <p className="text-gray-900 whitespace-pre-wrap">
                {emprendimiento.descripcion}
              </p>
            )}

            {emprendimiento.mercado_presencial && (
              <div className="flex items-center gap-2 text-gray-700 text-xs">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Disponible en Mercaduca presencial</span>
              </div>
            )}

            {emprendimiento.instagram && (
              <a
                href={`https://instagram.com/${emprendimiento.instagram.replace(
                  "@",
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-pink-600 font-semibold text-xs transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                @{emprendimiento.instagram.replace("@", "")}
              </a>
            )}
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-300 mt-11"></div>

        <div className="flex justify-center">
          <p className="text-sm font-semibold mt-8 pb-4">Productos</p>
        </div>

        {/* Grid de productos */}
        {productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-500 text-sm">
              Aún no hay productos publicados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-7 mt-4">
            {productos.map((p) => (
              <div
                key={p.id}
                className="aspect-square cursor-pointer hover:opacity-90 transition-opacity"
              >
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

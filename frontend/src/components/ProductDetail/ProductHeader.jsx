import React from "react";

export default function ProductHeader({ nombre, numero, imagen, instagram }) {
  const getInstagramHandle = (instagramUrl) => {
    if (!instagramUrl) return "";
    if (instagramUrl.startsWith("@")) return instagramUrl;
    const handle = instagramUrl
      .replace(/https?:\/\/(www\.)?instagram\.com\//, "")
      .replace(/\//g, "");
    return handle.startsWith("@") ? handle : `@${handle}`;
  };

  const instagramHandle = getInstagramHandle(instagram);

  // Imagen por defecto si no hay imagen
  const imageSrc = imagen
    ? `http://localhost:5000/api/proxy-image?url=${encodeURIComponent(imagen)}`
    : "https://via.placeholder.com/150?text=Sin+Imagen";

  return (
    <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-4 w-full shadow-sm">
      {/* Imagen del emprendimiento */}
      <div className="flex-shrink-0">
        <img
          src={imageSrc}
          alt={nombre || "Emprendimiento"}
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-full border-3 border-white shadow-md"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150?text=Sin+Imagen";
          }}
        />
      </div>

      {/* Información del emprendimiento */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate mb-1">
          {nombre || "Sin nombre"}
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm sm:text-base">
          {numero && (
            <div className="flex items-center gap-1.5 text-gray-600">
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="font-medium">{numero}</span>
            </div>
          )}

          {instagram && (
            <a
              href={
                instagram.startsWith("http")
                  ? instagram
                  : `https://instagram.com/${instagramHandle.replace("@", "")}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span className="font-medium">{instagramHandle}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import useCategories from "../hooks/useCategories";

export default function EntrepreneurshipForm({
  visible,
  onClose,
  initialData = {},
  onSubmit,
  loading = false,
  errorMessage = "",
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    imagen_url: "",
    instagram: "",
    id_categoria: "",
  });
  const { categories } = useCategories();

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || initialData.Nombre || "",
        descripcion: initialData.descripcion || initialData.Descripcion || "",
        imagen_url: initialData.imagen_url || initialData.Imagen_URL || "",
        instagram: initialData.instagram || initialData.Instagram || "",
        id_categoria:
          initialData.id_categoria || initialData.emprendimiento_id_categoria || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!visible) return null;

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white transition-all placeholder:text-gray-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pt-12"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-2xl w-[95%] sm:w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 relative animate-slide-up font-montserrat">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all rounded-full p-2"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1 text-center">
            {initialData?.id_emprendimiento ? "Editar emprendimiento" : "Crear emprendimiento"}
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Completa la información de tu emprendimiento para comenzar a compartir tus productos.
          </p>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Nombre del emprendimiento"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="¿Qué ofreces?"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">
                Categoría
              </label>
              <select
                name="id_categoria"
                value={formData.id_categoria}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((categoria) => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.categoria}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">Imagen de perfil (URL)</label>
              <input
                type="url"
                name="imagen_url"
                value={formData.imagen_url}
                onChange={handleChange}
                className={inputClass}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-800">Instagram</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className={inputClass}
                placeholder="@usuario o enlace"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#557051] to-[#6a8a62] hover:from-[#445a3f] hover:to-[#557051] transition-colors disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
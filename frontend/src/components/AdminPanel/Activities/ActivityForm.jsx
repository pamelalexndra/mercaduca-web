import React, { useState } from "react";
import { API_BASE_URL } from "../../../utils/api.js";

const ActivityForm = ({ activity, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: activity?.nombre || activity?.Nombre || "",
    descripcion: activity?.descripcion || activity?.Descripcion || "",
    imagen_url: activity?.imagen_url || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError("El nombre de la actividad es obligatorio");
      return false;
    }

    if (!formData.descripcion.trim()) {
      setError("La descripción es obligatoria");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado");
      }

      const method = activity ? "PUT" : "POST";
      const url = activity
        ? `${API_BASE_URL}/api/activities/${activity.id_actividad || activity.id}`
        : `${API_BASE_URL}/api/activities`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Error al guardar la actividad"
        );
      }

      onSuccess(
        activity
          ? "Actividad actualizada correctamente"
          : "Actividad creada correctamente"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {activity ? "Editar Actividad" : "Nueva Actividad"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la actividad *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#557051] focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#557051] focus:border-transparent min-h-[100px]"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de la imagen
            </label>
            <input
              type="url"
              value={formData.imagen_url}
              onChange={(e) =>
                setFormData({ ...formData, imagen_url: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#557051] focus:border-transparent"
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={loading}
            />
          </div>

          {/* Error message moved here - between last field and buttons */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !formData.nombre.trim() ||
                !formData.descripcion.trim()
              }
              className="px-4 py-2 bg-gradient-to-r from-[#557051] to-[#6a8a62] text-white rounded-lg hover:from-[#445a3f] hover:to-[#557051] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Guardando..." : activity ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;

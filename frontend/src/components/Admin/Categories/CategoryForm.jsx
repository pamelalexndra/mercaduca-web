import React, { useState } from "react";
import { API_BASE_URL } from "../../../utils/api.js";

const CategoryForm = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    categoria:
      category?.Categoria || category?.categoria || category?.nombre || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!formData.categoria.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return false;
    }

    if (formData.categoria.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
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

      const method = category ? "PUT" : "POST";
      const url = category
        ? `${API_BASE_URL}/categories/${category.id_categoria || category.id}`
        : `${API_BASE_URL}/categories`;

      // Preparar datos para enviar - usar minúscula 'categoria'
      const dataToSend = {
        categoria: formData.categoria.trim(),
      };

      // Si es edición, agregar el ID si es necesario
      if (category && category.id_categoria) {
        dataToSend.id_categoria = category.id_categoria;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        // Intentar obtener mensaje de error más específico
        let errorMessage = "Error al guardar la categoría";
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.details) {
          errorMessage = data.details;
        }
        throw new Error(errorMessage);
      }

      onSuccess(
        category
          ? "Categoría actualizada correctamente"
          : "Categoría creada correctamente"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {category ? "Editar categoría" : "Nueva categoría"}
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la categoría *
            </label>
            <input
              type="text"
              value={formData.categoria}
              onChange={(e) => setFormData({ categoria: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#557051] focus:border-transparent"
              required
              disabled={loading}
              minLength="2"
              placeholder="Ej: Electrónica, Ropa, Hogar"
            />
          </div>

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
                !formData.categoria.trim() ||
                formData.categoria.trim().length < 2
              }
              className="px-4 py-2 bg-gradient-to-r from-[#557051] to-[#6a8a62] text-white rounded-lg hover:from-[#445a3f] hover:to-[#557051] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Guardando..." : category ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
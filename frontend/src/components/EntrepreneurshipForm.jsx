import React, { useEffect, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import useCategories from "../hooks/useCategories";
import { useEmprendimiento } from "../hooks/useEmprendimiento";
import ConfirmationDialog from "./ConfirmationDialog";
import { API_BASE_URL } from "../utils/api";
import {
  createEntrepreneurshipService,
  updateEntrepreneurshipService,
} from "../services/entrepreneurship.service";

export default function EntrepreneurshipForm({
  visible,
  onClose,
  initialData = {},
  onSubmit,
  loading = false,
  errorMessage = "",
  onDeleteSuccess,
  isAdminMode = false,
  userId: propUserId,
  authToken,
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    instagram: "",
    id_categoria: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { categories } = useCategories();
  const { removeEntrepreneurship, loadingDelete, errorDelete } =
    useEmprendimiento();

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        instagram: initialData.instagram || initialData.Instagram || "",
        id_categoria:
          initialData.id_categoria ||
          initialData.emprendimiento_id_categoria ||
          "",
      });
      if (initialData.imagen_url || initialData.Imagen_URL) {
        setImagePreview(initialData.imagen_url || initialData.Imagen_URL);
      }
    }
    setError("");
  }, [initialData]);

  useEffect(() => {
    if (!visible) {
      setShowConfirm(false);
      setError("");
      setSelectedImage(null);
      if (!initialData?.imagen_url && !initialData?.Imagen_URL) {
        setImagePreview(null);
      }
    }
  }, [visible, initialData]);

  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (errorDelete) {
      setError(errorDelete);
    }
  }, [errorDelete]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona un archivo de imagen válido");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen no puede superar los 10MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setSelectedImage(file);
    setError("");
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setSelectedImage(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error && name === "nombre" && value.trim()) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError("El nombre del emprendimiento es requerido");
      return false;
    }

    if (!formData.id_categoria) {
      setError("Debes seleccionar una categoría");
      return false;
    }

    if (
      !selectedImage &&
      !imagePreview &&
      !initialData?.imagen_url &&
      !initialData?.Imagen_URL
    ) {
      setError("La imagen es obligatoria");
      return false;
    }

    setError("");
    return true;
  };

  const getUserId = () => {
    if (propUserId) return propUserId;
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) return storedUserId;
    if (initialData?.id_usuario) return initialData.id_usuario;
    if (initialData?.userId) return initialData.userId;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Crear un objeto con los datos del formulario incluyendo la imagen
      const submissionData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        instagram: formData.instagram,
        id_categoria: formData.id_categoria,
        imagen: selectedImage, // Incluir la imagen si existe
      };

      // Llamar al onSubmit con los datos y el authToken
      const success = await onSubmit?.(submissionData, authToken);
      if (success) {
        onClose?.();
      }
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);

    const idToDelete =
      initialData.id_emprendimiento || initialData.Id_Emprendimiento;
    if (!idToDelete) return;

    // Usar el token que viene por prop
    const token =
      authToken ||
      localStorage.getItem(isAdminMode ? "adminOriginalToken" : "token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/entrepreneurship/${idToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar el emprendimiento");
      }

      // Limpiar caché SOLO si no estamos en modo admin
      const EMPRENDIMIENTO_CACHE_KEY = "emprendimientoCache";
      const userId =
        propUserId || localStorage.getItem("userId") || initialData.id_usuario;

      if (userId && !isAdminMode) {
        try {
          const cache = JSON.parse(
            localStorage.getItem(EMPRENDIMIENTO_CACHE_KEY) || "{}",
          );
          delete cache[userId];
          localStorage.setItem(EMPRENDIMIENTO_CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
          console.error("Error limpiando caché:", e);
        }
      }

      onDeleteSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("Error eliminando emprendimiento:", err);
      setError(err.message || "Error al eliminar el emprendimiento");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const isFormValid = () => {
    return formData.nombre.trim() && formData.id_categoria;
  };

  if (!visible) return null;

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white transition-all placeholder:text-gray-400";

  const isEditing = !!(
    initialData?.id_emprendimiento || initialData?.Id_Emprendimiento
  );
  const isLoadingState = loading || isLoading;

  return (
    <>
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
              {isEditing ? "Editar emprendimiento" : "Crear emprendimiento"}
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Completa la información de tu emprendimiento para comenzar a
              compartir tus productos.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-800">
                  Nombre *
                </label>
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
                <label className="block text-sm font-semibold text-gray-800">
                  Descripción
                </label>
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
                  Categoría *
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
                    <option
                      key={categoria.id_categoria}
                      value={categoria.id_categoria}
                    >
                      {categoria.categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-800">
                  Imagen de perfil *
                </label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#557051] transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-12 h-12 text-gray-400" />
                      <span className="text-gray-600">
                        Haz clic para seleccionar una imagen
                      </span>
                      <span className="text-gray-400 text-sm">
                        Formatos permitidos: JPG, PNG, GIF, WebP (Máx. 10MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                      className="mt-3 w-full px-4 py-2 border border-[#557051] text-[#557051] rounded-lg hover:bg-[#557051] hover:text-white transition"
                    >
                      Cambiar imagen
                    </button>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-800">
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="@usuario o enlace"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={isLoadingState || loadingDelete}
                    className="flex-1 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition disabled:opacity-50"
                  >
                    {loadingDelete
                      ? "Eliminando..."
                      : "Eliminar emprendimiento"}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoadingState || loadingDelete || !isFormValid()}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#557051] text-white hover:bg-[#445a3f] text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoadingState ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        show={showConfirm}
        message="¿Estás seguro de eliminar este emprendimiento? Se eliminarán todos sus productos e información asociados."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}

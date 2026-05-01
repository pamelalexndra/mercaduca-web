import React, { useState, useEffect, useRef } from "react";
import { X, Trash2, Upload, Loader2 } from "lucide-react";
import ConfirmationDialog from "./ConfirmationDialog";
import SuccessDialog from "./SuccessDialog";
import useCategories from "../hooks/useCategories";

export default function ProductForm({
  visible,
  onClose,
  onSubmit,
  producto,
  onDelete,
  errorMessage,
  categories: propCategories,
  isAdminMode = false,
  emprendimientoId,
  authToken,
}) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [precioDolares, setPrecioDolares] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const modalRef = useRef();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { categories: hookCategories } = useCategories();
  const categories =
    propCategories && propCategories.length > 0
      ? propCategories
      : hookCategories;

  const inputClass =
    "w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border border-gray-200 transition-all placeholder:text-gray-400";

  // Resetear estados cuando se cierra el modal
  useEffect(() => {
    if (!visible) {
      setShowConfirm(false);
      setShowSuccess(false);
      setSuccessMessage("");
      setError("");
      setIsLoading(false);
    }
  }, [visible]);

  // Resetear success cuando se abre el modal
  useEffect(() => {
    if (visible) {
      setShowSuccess(false);
      setSuccessMessage("");
    }
  }, [visible]);

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || "");
      setDescripcion(producto.descripcion || producto.Descripcion || "");
      if (producto.imagen || producto.imagen_url || producto.Imagen_URL) {
        setImagePreview(
          producto.imagen || producto.imagen_url || producto.Imagen_URL,
        );
      }
      const normalizedPrecio =
        producto.precio || producto.precio_dolares || producto.Precio_dolares;
      setPrecioDolares(
        normalizedPrecio !== undefined &&
          normalizedPrecio !== null &&
          normalizedPrecio !== 0
          ? normalizedPrecio.toString()
          : "",
      );
      setIdCategoria(producto.id_categoria || "");
    } else {
      setNombre("");
      setDescripcion("");
      setSelectedImage(null);
      setImagePreview(null);
      setPrecioDolares("");
      setIdCategoria("");
    }
    setError("");
  }, [producto]);

  useEffect(() => {
    if (visible && !producto) {
      setNombre("");
      setDescripcion("");
      setSelectedImage(null);
      setImagePreview(null);
      setPrecioDolares("");
      setIdCategoria("");
      setError("");
    }
  }, [visible, producto]);

  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);

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

  const validateForm = () => {
    if (!nombre.trim()) {
      setError("El nombre del producto es requerido");
      return false;
    }

    if (!precioDolares.trim()) {
      setError("El precio es requerido");
      return false;
    }

    const precioNum = parseFloat(precioDolares);
    if (isNaN(precioNum) || precioNum <= 0) {
      setError("El precio debe ser un número mayor a 0");
      return false;
    }

    if (!idCategoria) {
      setError("Debes seleccionar una categoría");
      return false;
    }

    if (!producto && !selectedImage) {
      setError("La imagen es obligatoria");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = authToken || localStorage.getItem("token");
      const isEditing = !!producto?.id;

      const formDataToSend = new FormData();
      formDataToSend.append("nombre", nombre.trim());
      formDataToSend.append("descripcion", descripcion.trim() || "");
      formDataToSend.append("precio_dolares", precioDolares.toString());
      formDataToSend.append("id_categoria", idCategoria);

      if (!isEditing && emprendimientoId) {
        formDataToSend.append("id_emprendimiento", emprendimientoId);
      }

      if (selectedImage) {
        formDataToSend.append("imagen", selectedImage);
      }

      const endpoint = isEditing
        ? `${import.meta.env.VITE_API_URL}/products/${producto.id}`
        : `${import.meta.env.VITE_API_URL}/products`;

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo guardar el producto");
      }

      setSuccessMessage(
        isEditing
          ? "Producto actualizado correctamente"
          : "Producto creado correctamente",
      );
      setShowSuccess(true);

      if (onSubmit) {
        await onSubmit(result, isEditing);
      }
    } catch (err) {
      console.error("Error en handleSubmit:", err);
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
    if (onDelete) {
      const success = await onDelete(producto, authToken);
      if (success) {
        setSuccessMessage("Producto eliminado correctamente");
        setShowSuccess(true);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  const handleBackgroundClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setSuccessMessage("");
    onClose();
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPrecioDolares(value);
    }
  };

  const isFormValid = () => {
    if (!nombre.trim()) return false;
    if (!precioDolares.trim()) return false;
    const precioNum = parseFloat(precioDolares);
    if (isNaN(precioNum) || precioNum <= 0) return false;
    if (!idCategoria) return false;
    if (!producto && !selectedImage) return false;
    return true;
  };

  if (!visible) return null;

  const isLoadingState = isLoading;

  return (
    <>
      <div
        className="fixed inset-0 flex items-start justify-center bg-black/70 backdrop-blur-sm z-[50] animate-fade-in pt-16 sm:pt-20"
        onClick={handleBackgroundClick}
      >
        <div
          ref={modalRef}
          className="bg-white rounded-2xl w-[95%] sm:w-[520px] max-h-[85vh] overflow-y-auto relative shadow-2xl animate-slide-up border border-zinc-200 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent"
          onClick={(e) => e.stopPropagation()}
          style={{ overflowX: "hidden" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all rounded-full p-2 z-20"
          >
            <X size={20} />
          </button>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5 font-montserrat"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-1 text-center">
              {producto ? "Editar producto" : "Crear producto"}
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              {producto
                ? "Modifica la información de tu producto"
                : "Completa la información para publicar tu producto"}
            </p>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Jabón artesanal de lavanda"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Categoría *
              </label>
              <select
                value={idCategoria}
                onChange={(e) => setIdCategoria(e.target.value)}
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
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe las características, beneficios y usos de tu producto..."
                className={`${inputClass} resize-none min-h-[100px] leading-relaxed`}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Imagen del producto *
              </label>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#557051] transition-colors">
                  <input
                    type="file"
                    id="product-image-upload"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="product-image-upload"
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
                      document.getElementById("product-image-upload")?.click()
                    }
                    className="mt-3 w-full px-4 py-2 border border-[#557051] text-[#557051] rounded-lg hover:bg-[#557051] hover:text-white transition"
                  >
                    Cambiar imagen
                  </button>
                  <input
                    type="file"
                    id="product-image-upload"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Precio ($) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={precioDolares}
                  onChange={handlePriceChange}
                  placeholder="0.00"
                  className={`${inputClass} pl-9`}
                  required
                />
              </div>
            </div>

            {(error || errorMessage) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error || errorMessage}
              </div>
            )}

            <div className={`space-y-3 ${producto ? "pt-2" : ""}`}>
              <button
                type="submit"
                disabled={!isFormValid() || isLoadingState}
                className="w-full bg-gradient-to-r from-[#557051] to-[#6B8E5E] text-white rounded-xl py-3.5 text-sm font-semibold hover:from-[#496345] hover:to-[#5A7750] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoadingState ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    {producto ? "Actualizando..." : "Publicando..."}
                  </>
                ) : producto ? (
                  "Guardar cambios"
                ) : (
                  "Publicar Producto"
                )}
              </button>

              {producto && onDelete && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isLoadingState}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl py-3.5 text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <ConfirmationDialog
        show={showConfirm}
        message={`¿Estás seguro de que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <SuccessDialog
        show={showSuccess}
        message={successMessage}
        onConfirm={handleSuccessClose}
      />
    </>
  );
}
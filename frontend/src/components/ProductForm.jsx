import React, { useState, useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import ConfirmationDialog from "./ConfirmationDialog";
import SuccessDialog from "./SuccessDialog";

export default function ProductForm({
  visible,
  onClose,
  onSubmit,
  producto,
  onDelete,
  errorMessage,
}) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [precioDolares, setPrecioDolares] = useState("");
  const [existencias, setExistencias] = useState("0");
  const modalRef = useRef();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const inputClass =
    "w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border border-gray-200 transition-all placeholder:text-gray-400";

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || "");
      setDescripcion(producto.descripcion || producto.Descripcion || "");
      setImagenUrl(
        producto.imagen || producto.imagen_url || producto.Imagen_URL || ""
      );
      const normalizedPrecio =
        producto.precio || producto.precio_dolares || producto.Precio_dolares;
      setPrecioDolares(
        normalizedPrecio !== undefined && normalizedPrecio !== null
          ? normalizedPrecio.toString()
          : ""
      );
      const stockValue =
        producto.existencias || producto.Existencias || producto.stock || "0";
      setExistencias(stockValue.toString());
    } else {
      setNombre("");
      setDescripcion("");
      setImagenUrl("");
      setPrecioDolares("");
      setExistencias("0");
    }
  }, [producto]);

  useEffect(() => {
    if (visible && !producto) {
      setNombre("");
      setDescripcion("");
      setImagenUrl("");
      setPrecioDolares("");
      setExistencias("0");
    }
  }, [visible, producto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit({
      nombre,
      descripcion,
      imagen_url: imagenUrl,
      precio_dolares: precioDolares,
      existencias,
    });

    if (success) {
      setSuccessMessage(
        producto
          ? "Producto actualizado correctamente"
          : "Producto creado correctamente"
      );
      setShowSuccess(true);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    if (onDelete) {
      const success = await onDelete(producto);
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
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 animate-fade-in pt-16 sm:pt-20"
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
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Jabón artesanal de lavanda"
                className={inputClass}
              />
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
                Imagen_URL
              </label>
              <input
                type="text"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Precio_dolares
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={precioDolares}
                  onChange={(e) => setPrecioDolares(e.target.value)}
                  placeholder="0.00"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Existencias
              </label>
              <input
                type="number"
                min="0"
                value={existencias}
                onChange={(e) => setExistencias(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className={`space-y-3 ${producto ? "pt-2" : ""}`}>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#557051] to-[#6B8E5E] text-white rounded-xl py-3.5 text-sm font-semibold hover:from-[#496345] hover:to-[#5A7750] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {producto ? "Guardar cambios" : "Publicar Producto"}
              </button>

              {producto && onDelete && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
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

// src/components/EditProfile.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useProfile } from "../hooks/useProfile";

export default function EditProfile({
  visible,
  onClose,
  emprendimientoData,
  onSave,
  errorMessage = "",
  loading = false, 
}) {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    username: "",
    nuevaContraseña: "",
    confirmarContraseña: "",
  });
  const [localError, setLocalError] = useState("");

  // --- HOOK DE ELIMINACIÓN ---
  const { removeProfile, loadingDelete, errorDelete } = useProfile();

  const inputClass =
    "w-full bg-gray-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border border-gray-200 transition-all";

  useEffect(() => {
    if (emprendimientoData) {
      setFormData({
        nombres: emprendimientoData.nombres || "",
        apellidos: emprendimientoData.apellidos || "",
        correo: emprendimientoData.correo || "",
        telefono: emprendimientoData.telefono || "",
        username:
          emprendimientoData.username ||
          emprendimientoData.Usuario ||
          emprendimientoData.usuario ||
          "",
        nuevaContraseña: "",
        confirmarContraseña: "",
      });
    }
  }, [emprendimientoData]);

  useEffect(() => {
    if (visible) {
      setLocalError("");
    }
  }, [visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nuevaContraseña" || name === "confirmarContraseña") {
      setLocalError("");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteClick = async () => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que deseas eliminar tu perfil? Esta acción desactivará tus emprendimientos y productos permanentemente."
    );

    if (!confirmacion) return;

    const userId = emprendimientoData?.id_usuario;
    if (!userId) {
      setLocalError("No se pudo identificar el usuario.");
      return;
    }

    const success = await removeProfile(userId);

    if (success) {
      alert("Perfil eliminado correctamente.");
      onClose();
      localStorage.removeItem("token"); 
      window.location.href = "/login"; 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      (formData.nuevaContraseña || formData.confirmarContraseña) &&
      formData.nuevaContraseña !== formData.confirmarContraseña
    ) {
      setLocalError("Las contraseñas no coinciden.");
      return;
    }

    setLocalError("");
    const success = await onSave?.(formData);
    if (success !== false) {
      onClose?.();
    }
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!visible) return null;

  const currentError = localError || errorMessage || errorDelete;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 animate-fade-in pt-16 sm:pt-20"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-2xl w-[95%] sm:w-[500px] lg:w-[520px] max-h-[90vh] overflow-y-auto relative shadow-2xl animate-slide-up border border-zinc-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all rounded-full p-2 z-20"
        >
          <X size={20} />
        </button>

        <div className="p-6 font-montserrat">
          <h2 className="text-xl font-bold text-zinc-800 mb-6 text-center">
            Editar Perfil
          </h2>

          {currentError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {currentError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CAMPOS DEL FORMULARIO */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Nombres *</label>
              <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Apellidos *</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Correo Electrónico *</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} required className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} maxLength="8" className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Usuario de acceso</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} className={inputClass} placeholder="Nombre de usuario" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Nueva contraseña</label>
                <input type="password" name="nuevaContraseña" value={formData.nuevaContraseña} onChange={handleChange} className={inputClass} placeholder="Actualizar contraseña" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Confirmar contraseña</label>
                <input type="password" name="confirmarContraseña" value={formData.confirmarContraseña} onChange={handleChange} className={inputClass} placeholder="Repite la nueva contraseña" />
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={loadingDelete || loading}
                className="flex-1 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition disabled:opacity-50"
              >
                {loadingDelete ? "Eliminando..." : "Eliminar perfil"}
              </button>

              <button
                type="submit"
                disabled={loading || loadingDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-[#557051] text-white hover:bg-[#445a3f] text-sm font-medium transition disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
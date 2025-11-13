import React, { useState, useEffect } from "react";
import { X, Camera, Upload } from "lucide-react";

export default function EditProfile({
  visible,
  onClose,
  emprendimientoData,
  onSave,
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    imagen_url: "",
    instagram: "",
    categoria: "",
    disponible: true,
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [imagenPrevia, setImagenPrevia] = useState("");
  const fileInputRef = React.useRef();

  useEffect(() => {
    if (emprendimientoData) {
      setFormData({
        nombre: emprendimientoData.nombre || "",
        descripcion: emprendimientoData.descripcion || "",
        imagen_url: emprendimientoData.imagen_url || "",
        instagram: emprendimientoData.instagram || "",
        categoria: emprendimientoData.id_categoria || "",
        disponible: emprendimientoData.disponible ?? true,
        nombres: emprendimientoData.nombres || "",
        apellidos: emprendimientoData.apellidos || "",
        correo: emprendimientoData.correo || "",
        telefono: emprendimientoData.telefono || "",
      });
      setImagenPrevia(emprendimientoData.imagen_url || "");
    }
  }, [emprendimientoData]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        const data = await res.json();
        setCategorias(data || []);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagenPrevia(previewUrl);
      setFormData((prev) => ({ ...prev, imagen_url: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 animate-fade-in pt-16 sm:pt-20"
      onClick={handleBackgroundClick}
    >
      <div
        className="bg-white rounded-2xl w-[95%] sm:w-[500px] lg:w-[600px] max-h-[90vh] overflow-y-auto relative shadow-2xl animate-slide-up border border-zinc-200 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent"
        style={{ overflowX: "hidden" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all rounded-full p-2 z-20"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-zinc-800 mb-6 text-center font-montserrat">
            Editar Perfil
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5 font-montserrat">
            <div className="flex flex-col items-center mb-6">
              <div
                className="relative w-32 h-32 rounded-full border-2 border-[#557051] bg-zinc-100 cursor-pointer group"
                onClick={() => fileInputRef.current.click()}
              >
                {imagenPrevia ? (
                  <img
                    src={imagenPrevia}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center text-zinc-400">
                    <Camera size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-sm text-zinc-500 mt-2">
                Haz clic para cambiar la foto
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Nombre del Emprendimiento *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
                className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  maxLength="8"
                  className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@usuario"
                  className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="disponible"
                checked={formData.disponible}
                onChange={handleChange}
                className="w-4 h-4 text-[#557051] bg-zinc-100 border-zinc-300 rounded focus:ring-[#557051]"
              />
              <label className="text-sm text-zinc-700">
                Emprendimiento disponible
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-sm font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl bg-[#557051] text-white hover:bg-[#445a3f] text-sm font-medium transition"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

export default function ProductForm({
  visible,
  onClose,
  onSubmit,
  producto,
  onDelete,
}) {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef();
  const modalRef = useRef();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        const data = await res.json();
        setCategorias(data || []);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || "");
      setCategoria(
        producto.id_categoria !== undefined && producto.id_categoria !== null
          ? String(producto.id_categoria)
          : ""
      );
      const normalizedPrecio =
        producto.precio ?? producto.precio_dolares ?? producto.Precio_dolares;
      setPrecio(
        normalizedPrecio !== undefined && normalizedPrecio !== null
          ? normalizedPrecio.toString()
          : ""
      );
      setDescripcion(producto.descripcion || producto.Descripcion || "");
      setImagenes(producto.imagen ? [producto.imagen] : []);
      setPreviewIndex(0);
    } else {
      setNombre("");
      setCategoria("");
      setPrecio("");
      setDescripcion("");
      setImagenes([]);
      setPreviewIndex(0);
    }
  }, [producto]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagenes(previews);
    setPreviewIndex(0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagenes(previews);
    setPreviewIndex(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      nombre,
      id_categoria: categoria ? Number(categoria) : null,
      precio,
      descripcion,
      imagenes,
    };
    onSubmit(data);
  };

  const handleDelete = () => {
    if (producto && onDelete) {
      onDelete(producto);
    }
  };

  const nextImage = () => {
    if (imagenes.length > 1) {
      setPreviewIndex((prev) => (prev + 1) % imagenes.length);
    }
  };

  const prevImage = () => {
    if (imagenes.length > 1) {
      setPreviewIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);
    }
  };

  const handleBackgroundClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleTextareaChange = (e) => {
    setDescripcion(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 animate-fade-in pt-16 sm:pt-20"
      onClick={handleBackgroundClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-[95%] sm:w-[480px] lg:w-[520px] max-h-[85vh] overflow-y-auto relative shadow-2xl animate-slide-up border border-zinc-200 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent"
        onClick={(e) => e.stopPropagation()}
        style={{ overflowX: "hidden" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-all rounded-full p-2 z-20"
        >
          <X size={20} />
        </button>

        <div
          className={`relative h-72 transition-all duration-300 ${
            isDragging
              ? "bg-blue-50 border-2 border-blue-300 border-dashed"
              : "bg-gradient-to-br from-zinc-50 to-zinc-100"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          {imagenes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 cursor-pointer p-6">
              <div className="bg-white rounded-full p-4 mb-4 shadow-sm border border-zinc-200">
                {isDragging ? (
                  <Upload size={28} className="text-blue-400" />
                ) : (
                  <ImageIcon size={28} />
                )}
              </div>
              <p className="text-base font-medium text-zinc-600 mb-2 text-center">
                {isDragging ? "Suelta las imágenes aquí" : "Agregar imágenes"}
              </p>
              <p className="text-sm text-zinc-500 text-center">
                Haz clic o arrastra tus fotos aquí
                <br />
                <span className="text-xs">Formatos: JPG, PNG, WEBP</span>
              </p>
            </div>
          ) : (
            <>
              <img
                src={imagenes[previewIndex]}
                alt="preview"
                className="h-full w-full object-cover"
              />

              {imagenes.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {imagenes.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === previewIndex
                          ? "bg-white scale-125"
                          : "bg-white/60 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}

              {imagenes.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-zinc-800 rounded-full p-2 shadow-lg transition-all hover:scale-105"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-zinc-800 rounded-full p-2 shadow-lg transition-all hover:scale-105"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 font-montserrat">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Nombre del producto
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Jabón artesanal de lavanda"
              className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all placeholder:text-zinc-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all appearance-none"
            >
              <option value="" className="text-zinc-400">
                Selecciona una categoría
              </option>
              {categorias.map((cat) => (
                <option
                  key={cat.id_categoria}
                  value={cat.nombre_categoria}
                  className="text-zinc-800"
                >
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Precio
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-50 text-zinc-800 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={handleTextareaChange}
              placeholder="Describe las características, beneficios y usos de tu producto..."
              className="w-full bg-zinc-50 text-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#557051] focus:bg-white border-0 transition-all placeholder:text-zinc-400 resize-none min-h-[100px] leading-relaxed"
            />
          </div>

          <div className={`space-y-3 ${producto ? "pt-2" : ""}`}>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#557051] to-[#6B8E5E] text-white rounded-xl py-3.5 text-sm font-semibold hover:from-[#496345] hover:to-[#5A7750] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {producto ? "Actualizar Producto" : "Publicar Producto"}
            </button>

            {producto && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl py-3.5 text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Eliminar Producto
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

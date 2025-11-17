import React, { useState } from "react";
import ProductCard from "./Card";
import ProductForm from "./ProductForm";
import EditProfile from "./EditProfile";

export default function Profile() {
  const [showModal, setShowModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);

  // Datos reales de JoChips de la base de datos
  const [emprendimiento, setEmprendimiento] = useState({
    id_emprendimiento: 1,
    nombre: "Jochips",
    descripcion:
      "Deliciosas galletas artesanales horneadas con ingredientes de calidad, perfectas para acompañar tu café o antojo dulce.",
    imagen_url: "https://i.ibb.co/MDj4kqrt/jochips.jpg",
    instagram: "https://www.instagram.com/jochipsco/",
    mercado_presencial: true,
  });

  const [productos, setProductos] = useState([
    {
      id: 1,
      nombre: "Galletas edición clásicas",
      descripcion: "",
      precio: "0.75",
      imagen_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlNNhU3GusCR5R8Fs8QPLWkkGDghEsLxSrNA&s",
      disponible: true,
      existencias: 15,
    },
    {
      id: 2,
      nombre: "Galletas edición premium",
      descripcion: "",
      precio: "1.00",
      imagen_url: "https://i.ibb.co/3mzHFpKs/Galletas-premium.png",
      disponible: true,
      existencias: 20,
    },
  ]);

  const handleAgregar = () => {
    setProductoEdit(null);
    setShowModal(true);
  };

  const handleEditar = (producto) => {
    setProductoEdit(producto);
    setShowModal(true);
  };

  const handleSubmit = (data) => {
    if (productoEdit) {
      // Actualizar producto existente
      const productosActualizados = productos.map((p) =>
        p.id === productoEdit.id
          ? { ...p, ...data, precio: `$${data.precio}` }
          : p
      );
      setProductos(productosActualizados);
      console.log("Producto actualizado:", data);
    } else {
      // Agregar nuevo producto
      const nuevoProducto = {
        id: Date.now(),
        ...data,
        precio: `$${data.precio}`,
        disponible: true,
      };
      setProductos([...productos, nuevoProducto]);
      console.log("Producto agregado:", nuevoProducto);
    }
    setShowModal(false);
  };

  const handleEliminarProducto = (producto) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar "${producto.nombre}"?`
      )
    ) {
      const productosFiltrados = productos.filter((p) => p.id !== producto.id);
      setProductos(productosFiltrados);
      setShowModal(false);
      console.log("Producto eliminado:", producto.nombre);
    }
  };

  const handleSaveProfile = (datos) => {
    setEmprendimiento((prev) => ({
      ...prev,
      ...datos,
    }));
    console.log("Perfil actualizado:", datos);
  };

  return (
    <>
      <div className="min-h-screen bg-white font-montserrat">
        {/* Header del perfil*/}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:gap-20 mb-11">
            {/* Foto de perfil */}
            <div className="flex-shrink-0">
              <img
                src={emprendimiento.imagen_url}
                alt={emprendimiento.nombre}
                className="w-40 h-40 rounded-full object-cover border"
              />
            </div>

            {/* Info del perfil */}
            <div className="flex-1">
              {/* Username y botones */}
              <div className="flex items-center gap-5 mb-5">
                <h1 className="text-xl font-normal text-gray-900">
                  {emprendimiento.nombre}
                </h1>
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="px-6 py-2 bg-white border-1 border-gray-300 hover:border-gray-400 text-gray-900 rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                  Editar perfil
                </button>
                <button
                  onClick={handleAgregar}
                  className="px-6 py-2 bg-gradient-to-r from-[#557051] to-[#6a8a62] hover:from-[#445a3f] hover:to-[#557051] text-white rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  Agregar producto
                </button>
              </div>

              {/* Estadísticas */}
              <div className="flex gap-10 mb-5">
                <div className="flex gap-1">
                  <span className="font-semibold text-gray-900">
                    {productos.length}
                  </span>
                  <span className="text-gray-900">productos</span>
                </div>
              </div>

              {/* Bio */}
              <div className="text-sm space-y-2">
                {emprendimiento.descripcion && (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {emprendimiento.descripcion}
                  </p>
                )}

                {emprendimiento.instagram && (
                  <a
                    href={`https://instagram.com/${emprendimiento.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    {emprendimiento.instagram}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Top section */}
            <div className="flex items-center gap-4 mb-4 px-4">
              {/* Foto de perfil */}
              <img
                src={emprendimiento.imagen_url}
                alt={emprendimiento.nombre}
                className="w-20 h-20 rounded-full object-cover border"
              />

              {/* Estadísticas */}
              <div className="flex-1 flex items-center justify-start text-left ml-4">
                <div>
                  <div className="font-semibold text-gray-900">
                    {productos.length}
                  </div>
                  <div className="text-xs text-gray-500">productos</div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="px-4 mb-4 text-sm space-y-2">
              <p className="font-semibold text-gray-900">
                {emprendimiento.nombre}
              </p>

              {emprendimiento.descripcion && (
                <p className="text-gray-900 whitespace-pre-wrap">
                  {emprendimiento.descripcion}
                </p>
              )}

              {emprendimiento.mercado_presencial && (
                <div className="flex items-center gap-2 text-gray-700 text-xs">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Disponible en Mercaduca presencial</span>
                </div>
              )}

              {emprendimiento.instagram && (
                <a
                  href={`https://instagram.com/${emprendimiento.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 hover:text-pink-600 font-semibold text-xs transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  {emprendimiento.instagram}
                </a>
              )}
            </div>

            {/* Botones */}
            <div className="px-4 flex gap-3">
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                Editar perfil
              </button>
              <button
                onClick={handleAgregar}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#557051] to-[#6a8a62] hover:from-[#445a3f] hover:to-[#557051] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-300 mt-11"></div>

          <div className="flex justify-center">
            <p className="text-sm font-semibold mt-8 pb-4">Productos</p>
          </div>

          {/* Grid de productos */}
          {productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <h2 className="text-3xl font-light mb-2">
                Comparte tus productos
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Cuando compartas productos, aparecerán en tu perfil.
              </p>
              <button
                onClick={handleAgregar}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                Comparte tu primer producto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-7 mt-4">
              {productos.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleEditar(p)}
                  className="aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductForm
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        producto={productoEdit}
        onDelete={handleEliminarProducto}
      />

      <EditProfile
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        emprendimientoData={emprendimiento}
        onSave={handleSaveProfile}
      />
    </>
  );
}

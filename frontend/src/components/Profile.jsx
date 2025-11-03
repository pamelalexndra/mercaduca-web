import React, { useState } from "react";
import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";
import EditProfile from "./EditProfile";

export default function Profile() {
  const [showModal, setShowModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [productos, setProductos] = useState([
    { id: 1, nombre: "Crema hidratante de lavanda", precio: "$8.00", category: "Cuidado personal" },
    { id: 2, nombre: "Aceite facial de rosa mosqueta", precio: "$10.50", category: "Cosmética natural" },
  ]);

  const [emprendimiento, setEmprendimiento] = useState({
    nombre: "Luna Botanicals",
    imagen_url: "https://i.ibb.co/FK2J4vs/luna-botanicals.jpg",
    descripcion: "",
    instagram: "",
    disponible: true,
    nombres: "Ana",
    apellidos: "García",
    correo: "ana@lunabotanicals.com",
    telefono: "12345678"
  });

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
      const productosActualizados = productos.map(p =>
        p.id === productoEdit.id 
          ? { ...p, ...data, precio: `$${data.precio}` }
          : p
      );
      setProductos(productosActualizados);
    } else {
      const nuevoProducto = {
        id: Date.now(),
        ...data,
        precio: `$${data.precio}`
      };
      setProductos([...productos, nuevoProducto]);
    }
    setShowModal(false);
  };

  const handleEliminarProducto = (producto) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${producto.nombre}"?`)) {
      const productosFiltrados = productos.filter(p => p.id !== producto.id);
      setProductos(productosFiltrados);
      setShowModal(false);
    }
  };

  const handleSaveProfile = (datos) => {
    setEmprendimiento(prev => ({
      ...prev,
      ...datos
    }));
    console.log("Perfil guardado:", datos);
  };

  return (
    <>
      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-8 sm:py-12 font-montserrat text-zinc-700">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 mb-8 sm:mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <img
                src={emprendimiento.imagen_url}
                alt="Foto de perfil"
                className="w-20 sm:w-32 h-20 sm:h-32 rounded-full border-2 border-[#557051] object-cover shadow-md"
              />
              <div className="flex-1 md:hidden">
                <h2 className="text-base font-loubag font-bold text-[#557051] tracking-wide mb-1">
                  {emprendimiento.nombre}
                </h2>
                <div className="text-xs text-zinc-600">
                  <span className="font-bold text-[#557051]">{productos.length}</span> productos
                </div>
              </div>
            </div>

            <div className="flex-1 text-left space-y-3 sm:space-y-4 w-full">
              <div className="hidden md:block">
                <h2 className="text-xl font-loubag font-bold text-[#557051] tracking-wide mb-2">
                  {emprendimiento.nombre}
                </h2>
                <div className="text-sm text-zinc-600 mb-3">
                  <span className="font-bold text-[#557051] text-base">{productos.length}</span> productos
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-3 w-full">
                <button 
                  onClick={() => setShowEditProfileModal(true)}
                  className="w-full sm:w-auto sm:min-w-[160px] px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-xs sm:text-[13px] font-medium transition"
                >
                  Editar perfil
                </button>
                <button
                  onClick={handleAgregar}
                  className="w-full sm:w-auto sm:min-w-[160px] px-4 py-2 rounded-xl bg-[#557051] text-white hover:bg-[#445a3f] text-xs sm:text-[13px] font-medium transition"
                >
                  Agregar producto
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex flex-col items-center mb-8 sm:mb-10">
            <h3 className="text-base sm:text-lg font-loubag font-bold text-[#557051] tracking-wide">
              Mis productos
            </h3>
          </div>

          {productos.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-zinc-500 text-sm mb-4">Aún no tienes productos publicados.</p>
              <button
                onClick={handleAgregar}
                className="px-6 py-2 rounded-xl bg-[#557051] text-white hover:bg-[#445a3f] text-sm font-medium transition"
              >
                Agregar primer producto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {productos.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleEditar(p)}
                  className="cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
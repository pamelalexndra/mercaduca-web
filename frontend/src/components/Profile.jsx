import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./Card";
import ProductForm from "./ProductForm";
import EditProfile from "./EditProfile";
import logoVerde from "../images/logoVerde.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const PROFILE_PLACEHOLDER = logoVerde;

export default function Profile({ user, onProfileLoaded }) {
  const [showModal, setShowModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);

  const [emprendimiento, setEmprendimiento] = useState({});
  const [productos, setProductos] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    if (user) return user;
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

    const normalizeProducto = (producto) => ({
    id: producto?.id ?? producto?.id_producto,
    nombre: producto?.nombre ?? producto?.Nombre ?? "",
    descripcion: producto?.descripcion ?? producto?.Descripcion ?? "",
    precio:
      producto?.precio ??
      producto?.precio_dolares ??
      producto?.Precio_dolares ??
      0,
    imagen:
      producto?.imagen ??
      producto?.imagen_url ??
      producto?.Imagen_URL ??
      producto?.Imagen_url ??
      "",
    id_categoria: producto?.id_categoria ?? null,
    stock: producto?.stock ?? producto?.existencias ?? producto?.Existencias ?? 0,
    disponible: producto?.disponible ?? producto?.Disponible ?? true,
    id_emprendimiento:
      producto?.emprendimiento_id ?? producto?.id_emprendimiento ?? null,
    categoria: producto?.categoria ?? producto?.Categoria,
  });

  const fetchProductos = useCallback(async (emprendimientoId) => {
    setLoadingProductos(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/productos?emprendimiento_id=${emprendimientoId}`
      );
      if (!response.ok) {
        throw new Error("No se pudieron obtener los productos");
      }
      const data = await response.json();
      const productosNormalizados = (data.productos || []).map((p) =>
        normalizeProducto(p)
      );
      setProductos(productosNormalizados);
    } catch (fetchError) {
      console.error("Error cargando productos:", fetchError);
      setError(fetchError.message || "Error al cargar los productos");
    } finally {
      setLoadingProductos(false);
    }
  }, []);

  const loadProfile = useCallback(
    async (userId, baseUserData = null) => {
      setLoadingProfile(true);
      setError("");
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/user/profile/${userId}`
        );
        if (!response.ok) {
          throw new Error("No se pudo obtener la información del perfil");
        }

        const payload = await response.json();
        const profileData = payload.profile || payload;

        const normalizedEmprendimiento = profileData?.emprendimiento
          ? {
              ...profileData.emprendimiento,
              nombres: profileData.nombres,
              apellidos: profileData.apellidos,
              correo: profileData.correo,
              telefono: profileData.telefono,
            }
          : {};

        setEmprendimiento(normalizedEmprendimiento);

        const storedFallback = localStorage.getItem("user");
        const fallbackUser = storedFallback ? JSON.parse(storedFallback) : null;

        const baseUser =
          baseUserData ||
          fallbackUser || {
            id: profileData.id_usuario,
            username: profileData.username,
          };

        const updatedUser = { ...baseUser, profile: profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        onProfileLoaded?.(updatedUser);

        if (profileData?.emprendimiento?.id_emprendimiento) {
          await fetchProductos(profileData.emprendimiento.id_emprendimiento);
        } else {
          setProductos([]);
        }
      } catch (profileError) {
        console.error("Error obteniendo perfil:", profileError);
        setError(profileError.message || "Error al cargar el perfil");
      } finally {
        setLoadingProfile(false);
      }
    },
    [fetchProductos, onProfileLoaded]
  );

  useEffect(() => {
    const storedRaw = localStorage.getItem("user");
    const storedUser = user || (storedRaw ? JSON.parse(storedRaw) : null);
    if (!storedUser?.id) {
      navigate("/vender");
      return;
    }

    setCurrentUser(storedUser);
    loadProfile(storedUser.id, storedUser);
  }, []);

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-montserrat">
        <p className="text-gray-500 text-sm font-semibold">
          Cargando tu perfil...
        </p>
      </div>
    );
  }

  const profileImage = emprendimiento?.imagen_url || PROFILE_PLACEHOLDER;
  const emprendimientoNombre =
    emprendimiento?.nombre || currentUser?.profile?.username || "Tu emprendimiento";
  const emprendimientoDescripcion = emprendimiento?.descripcion || "";
  const instagramValue = emprendimiento?.instagram || "";
  const instagramHref = instagramValue
    ? instagramValue.startsWith("http")
      ? instagramValue
      : `https://instagram.com/${instagramValue.replace("@", "")}`
    : null;
  const instagramLabel = instagramValue.replace(/^https?:\/\//, "");

  const handleAgregar = () => {
    setProductoEdit(null);
    setShowModal(true);
  };

  const handleEditar = (producto) => {
    setProductoEdit(producto);
    setShowModal(true);
  };

 const handleSubmit = async (data) => {
    if (!emprendimiento?.id_emprendimiento) {
      setError("Debes tener un emprendimiento para publicar productos.");
      return;
    }

    const precioNumber = parseFloat(data.precio);
    if (Number.isNaN(precioNumber)) {
      setError("Ingresa un precio válido para el producto.");
      return;
    }

    const categoriaId = data.id_categoria || productoEdit?.id_categoria;
    if (!categoriaId) {
      setError("Selecciona una categoría para tu producto.");
      return;
    }

    const payload = {
      nombre: data.nombre?.trim(),
      descripcion: data.descripcion?.trim() || "",
      imagen_url: data.imagenes?.[0] || productoEdit?.imagen || "",
      precio_dolares: precioNumber,
      existencias: productoEdit?.stock ?? 1,
      id_categoria: categoriaId,
      id_emprendimiento: emprendimiento.id_emprendimiento,
    };

    try {
      setError("");

      const endpoint = productoEdit?.id
        ? `${API_BASE_URL}/api/productos/${productoEdit.id}`
        : `${API_BASE_URL}/api/productos`;
      const method = productoEdit?.id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo guardar el producto");
      }

      const savedProduct = normalizeProducto(
        result.producto || result.product || result
      );
      
      setProductos((prev) => {
        if (productoEdit?.id) {
          return prev.map((p) => (p.id === productoEdit.id ? savedProduct : p));
        }
        return [...prev, savedProduct];
      });

      if (emprendimiento?.id_emprendimiento) {
        await fetchProductos(emprendimiento.id_emprendimiento);
      }

      setProductoEdit(null);
      setShowModal(false);
    } catch (err) {
      console.error("Error guardando producto:", err);
      setError(err.message || "No se pudo guardar el producto");
    }
  };

  const handleEliminarProducto = async (producto) => {
    if (!producto?.id ||
      !window.confirm(`¿Estás seguro de que quieres eliminar "${producto.nombre}"?`)) {
      return;
    }

    try {
      setError("");
      const response = await fetch(
        `${API_BASE_URL}/api/productos/${producto.id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo eliminar el producto");
      }

      setProductos((prev) => prev.filter((p) => p.id !== producto.id));

      if (emprendimiento?.id_emprendimiento) {
        await fetchProductos(emprendimiento.id_emprendimiento);
      }

      setProductoEdit(null);
      setShowModal(false);
       } catch (err) {
      console.error("Error eliminando producto:", err);
      setError(err.message || "No se pudo eliminar el producto");
    }
  };

  const handleSaveProfile = (datos) => {
    setEmprendimiento((prev) => ({
      ...prev,
      ...datos,
    }));
    setCurrentUser((prevUser) => {
      if (!prevUser) return prevUser;

      const { nombres, apellidos, correo, telefono, ...emprendimientoDatos } = datos;

      const updatedProfile = {
        ...(prevUser.profile || {}),
        nombres: nombres ?? prevUser.profile?.nombres,
        apellidos: apellidos ?? prevUser.profile?.apellidos,
        correo: correo ?? prevUser.profile?.correo,
        telefono: telefono ?? prevUser.profile?.telefono,
        emprendimiento: {
          ...(prevUser.profile?.emprendimiento || {}),
          ...emprendimientoDatos,
        },
      };

      const mergedUser = { ...prevUser, profile: updatedProfile };
      localStorage.setItem("user", JSON.stringify(mergedUser));
      if (onProfileLoaded) {
        onProfileLoaded(mergedUser);
      }
      return mergedUser;
    });
  };

  return (
    <>
      <div className="min-h-screen bg-white font-montserrat">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Desktop */}
          <div className="hidden md:flex md:items-center md:gap-20 mb-11">
            <div className="flex-shrink-0">
              <img
                src={profileImage}
                alt={emprendimientoNombre}
                className="w-40 h-40 rounded-full object-cover border"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-5 mb-5">
                <h1 className="text-xl font-normal text-gray-900">
                  {emprendimientoNombre}
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

              <div className="flex gap-10 mb-5">
                <div className="flex gap-1">
                  <span className="font-semibold text-gray-900">
                    {productos.length}
                  </span>
                  <span className="text-gray-900">productos</span>
                </div>
              </div>

              <div className="text-sm space-y-2">
                {emprendimientoDescripcion && (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {emprendimientoDescripcion}
                  </p>
                )}

                {instagramHref && (
                  <a
                    href={instagramHref}
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
                    {instagramLabel || instagramValue}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <div className="flex items-center gap-4 mb-4 px-4">
              <img
                src={profileImage}
                alt={emprendimientoNombre}
                className="w-20 h-20 rounded-full object-cover border"
              />

              <div className="flex-1 flex items-center justify-start text-left ml-4">
                <div>
                  <div className="font-semibold text-gray-900">
                    {productos.length}
                  </div>
                  <div className="text-xs text-gray-500">productos</div>
                </div>
              </div>
            </div>

            <div className="px-4 mb-4 text-sm space-y-2">
              <p className="font-semibold text-gray-900">
                {emprendimientoNombre}
              </p>

              {emprendimientoDescripcion && (
                <p className="text-gray-900 whitespace-pre-wrap">
                  {emprendimientoDescripcion}
                </p>
              )}

              {emprendimiento?.mercado_presencial && (
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

              {instagramHref && (
                <a
                  href={instagramHref}
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
                    {instagramLabel || instagramValue}
                  </a>
              )}
            </div>

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

          {/* Divider */}
          <div className="border-t border-gray-300 mt-11"></div>

          <div className="flex justify-center">
            <p className="text-sm font-semibold mt-8 pb-4">Productos</p>
          </div>

          {/* Productos */}
          {loadingProductos ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <p className="text-sm font-semibold">Cargando tus productos...</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <h2 className="text-3xl font-light mb-2">Comparte tus productos</h2>
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

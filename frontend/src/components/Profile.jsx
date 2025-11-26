import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "./Card";
import ProductForm from "./ProductForm";
import EditProfile from "./EditProfile";
import EntrepreneurshipForm from "./EntrepreneurshipForm";
import { API_BASE_URL } from "../utils/api";
import logoVerde from "../images/logoVerde.png";

const PROFILE_PLACEHOLDER = logoVerde;
const EMPRENDIMIENTO_CACHE_KEY = "emprendimientoCache";

const getStoredToken = (userData) => {
  const localToken = localStorage.getItem("token");
  if (localToken && localToken !== "undefined" && localToken !== "null") {
    return localToken;
  }

  const fallbackToken =
    userData?.token || userData?.profile?.token || userData?.accessToken;

  if (
    fallbackToken &&
    fallbackToken !== "undefined" &&
    fallbackToken !== "null"
  ) {
    return fallbackToken;
  }

  return null;
};

const getAuthHeaders = (userData) => {
  const token = getStoredToken(userData);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getUserId = (data) =>
  data?.id || data?.id_usuario || data?.userId || data?.idUser || null;

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

const readCachedEmprendimientos = () => {
  try {
    const raw = localStorage.getItem(EMPRENDIMIENTO_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("No se pudo leer el cache de emprendimientos", e);
    return {};
  }
};

const getCachedEmprendimiento = (userId) => {
  if (!userId) return null;
  const cache = readCachedEmprendimientos();
  return cache?.[userId] || null;
};

const saveCachedEmprendimiento = (userId, emprendimiento) => {
  if (!userId || !emprendimiento) return;

  try {
    const cache = readCachedEmprendimientos();
    cache[userId] = emprendimiento;
    localStorage.setItem(EMPRENDIMIENTO_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error("No se pudo guardar el cache de emprendimientos", e);
  }
};

const normalizeEmprendimiento = (data = {}) => ({
  id_emprendimiento:
    data.id_emprendimiento ||
    data.id ||
    data.idEmprendimiento ||
    data.emprendimiento_id ||
    null,
  nombre: data.nombre || data.Nombre || data.emprendimiento_nombre || "",
  descripcion:
    data.descripcion ||
    data.Descripcion ||
    data.emprendimiento_descripcion ||
    "",
  imagen_url:
    data.imagen_url ||
    data.Imagen_URL ||
    data.imagen ||
    data.emprendimiento_imagen_url ||
    "",
  instagram:
    data.instagram || data.Instagram || data.emprendimiento_instagram || "",
  disponible: data.disponible ?? data.Disponible ?? true,
  id_categoria:
    data.id_categoria ||
    data.idCategoria ||
    data.emprendimiento_id_categoria ||
    null,
});

export default function Profile({ user, onProfileLoaded }) {
  const [showModal, setShowModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [showEntrepreneurshipModal, setShowEntrepreneurshipModal] =
    useState(false);
  const [savingEntrepreneurship, setSavingEntrepreneurship] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [emprendimiento, setEmprendimiento] = useState(() => {
    const stored = user || localStorage.getItem("user");
    const parsed = typeof stored === "string" ? JSON.parse(stored) : stored;
    const rawEmpr = parsed?.profile?.emprendimiento || parsed?.profile;
    const cached = getCachedEmprendimiento(getUserId(parsed));

    if (rawEmpr) return normalizeEmprendimiento(rawEmpr);
    if (cached) return normalizeEmprendimiento(cached);

    return {};
  });
  const [productos, setProductos] = useState(() => {
    const stored = user || localStorage.getItem("user");
    const parsed = typeof stored === "string" ? JSON.parse(stored) : stored;
    const storedProductos = parsed?.profile?.productos || [];
    return storedProductos.map(normalizeProducto);
  });
  const [currentUser, setCurrentUser] = useState(() => {
    if (user) return user;
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const currentUserRef = useRef(currentUser);
  const lastLoadedUserIdRef = useRef(null);
  const lastLoadedTokenRef = useRef(null);
  const lastNotifiedUserIdRef = useRef(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const updateStoredUserProfile = useCallback((profileUpdater) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;

      const updatedProfile = profileUpdater(prev.profile || {});
      const mergedUser = { ...prev, profile: updatedProfile };
      localStorage.setItem("user", JSON.stringify(mergedUser));
      return mergedUser;
    });
  }, []);

  const fetchProductos = useCallback(
    async (emprendimientoId) => {
      setLoadingProductos(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/products?emprendimiento_id=${emprendimientoId}`,
          {
            headers: {
              ...getAuthHeaders(currentUserRef.current),
            },
          }
        );
        if (!response.ok) {
          throw new Error("No se pudieron obtener los productos");
        }
        const data = await response.json();
        const productosNormalizados = (data.productos || []).map((p) =>
          normalizeProducto(p)
        );
        setProductos(productosNormalizados);
        updateStoredUserProfile((prevProfile) => ({
          ...prevProfile,
          productos: productosNormalizados,
        }));
      } catch (fetchError) {
        console.error("Error cargando productos:", fetchError);
        setError(fetchError.message || "Error al cargar los productos");
      } finally {
        setLoadingProductos(false);
      }
    },
    [updateStoredUserProfile]
  );

  const fetchEmprendimientoById = useCallback(
    async (emprendimientoId) => {
      if (!emprendimientoId) return null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/entrepreneurship/${emprendimientoId}`,
          {
            headers: {
              ...getAuthHeaders(currentUserRef.current),
            },
          }
        );

        if (!response.ok) {
          throw new Error("No se pudo obtener el emprendimiento");
        }

        const data = await response.json();
        const normalized = normalizeEmprendimiento(data);
        setEmprendimiento(normalized);

        if (normalized.id_emprendimiento) {
          await fetchProductos(normalized.id_emprendimiento);
        }

        return normalized;
      } catch (fetchError) {
        console.error("Error obteniendo emprendimiento:", fetchError);
        setError(fetchError.message || "Error al cargar el emprendimiento");
        return null;
      }
    },
    [fetchProductos]
  );

  const loadProfile = useCallback(
    async (userId, baseUserData = null) => {
      setLoadingProfile(true);
      setError("");
      try {
        const authSource = currentUserRef.current || baseUserData;
        const authToken = getStoredToken(authSource);
        const response = await fetch(
          `${API_BASE_URL}/api/user/profile/${userId}`,
          {
            headers: {
              ...getAuthHeaders(authSource),
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("isAuthenticated");
          setError("Tu sesión expiró. Inicia sesión nuevamente.");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudo obtener la información del perfil");
        }

        const payload = await response.json();
        const profileData = payload.profile || payload;

        if (
          Array.isArray(profileData?.productos) &&
          profileData.productos.length
        ) {
          const normalizedProductos =
            profileData.productos.map(normalizeProducto);
          setProductos(normalizedProductos);
          updateStoredUserProfile((prevProfile) => ({
            ...prevProfile,
            productos: normalizedProductos,
          }));
        }

        let normalizedEmprendimiento = null;

        if (profileData?.emprendimiento) {
          normalizedEmprendimiento = normalizeEmprendimiento(
            profileData.emprendimiento
          );
          setEmprendimiento(normalizedEmprendimiento);
          saveCachedEmprendimiento(userId, normalizedEmprendimiento);

          if (normalizedEmprendimiento?.id_emprendimiento) {
            await fetchProductos(normalizedEmprendimiento.id_emprendimiento);
          }
        } else if (profileData?.id_emprendimiento) {
          normalizedEmprendimiento = await fetchEmprendimientoById(
            profileData.id_emprendimiento
          );
          if (normalizedEmprendimiento) {
            saveCachedEmprendimiento(userId, normalizedEmprendimiento);
          }
        } else {
          const storedFallback =
            currentUser?.profile?.emprendimiento || emprendimiento;

          if (storedFallback?.id_emprendimiento) {
            normalizedEmprendimiento = storedFallback;
            setEmprendimiento(storedFallback);
            await fetchProductos(storedFallback.id_emprendimiento);
          } else {
            const cached = getCachedEmprendimiento(userId);
            if (cached?.id_emprendimiento) {
              const normalizedCache = normalizeEmprendimiento(cached);
              setEmprendimiento(normalizedCache);
              await fetchProductos(normalizedCache.id_emprendimiento);
              normalizedEmprendimiento = normalizedCache;
            }
          }

          if (!normalizedEmprendimiento) {
            setEmprendimiento({});
            setProductos([]);
          }
        }

        const storedFallback = localStorage.getItem("user");
        const fallbackUser = storedFallback ? JSON.parse(storedFallback) : null;

        const baseUser = baseUserData ||
          fallbackUser || {
            id: profileData.id_usuario,
            username: profileData.username || profileData.Usuario,
          };

        const updatedProfile = {
          ...profileData,
          emprendimiento: normalizedEmprendimiento,
        };

        const updatedUser = {
          ...baseUser,
          token: authToken,
          profile: updatedProfile,
        };
        saveCachedEmprendimiento(
          getUserId(updatedUser),
          normalizedEmprendimiento
        );
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      } catch (profileError) {
        console.error("Error obteniendo perfil:", profileError);
        setError(profileError.message || "Error al cargar el perfil");
      } finally {
        setLoadingProfile(false);
      }
    },
    [fetchProductos, fetchEmprendimientoById, navigate, updateStoredUserProfile]
  );

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      lastNotifiedUserIdRef.current = null;
    }
  }, [currentUser]);

  useEffect(() => {
    const storedRaw = localStorage.getItem("user");
    const storedUser = user || (storedRaw ? JSON.parse(storedRaw) : null);
    const storedUserId = getUserId(storedUser);
    const storedToken = getStoredToken(storedUser);

    if (!storedUserId) {
      navigate("/vender");
      return;
    }

    const hasStoredEmprendimiento = Boolean(
      storedUser?.profile?.emprendimiento?.id_emprendimiento
    );

    if (
      lastLoadedUserIdRef.current === storedUserId &&
      lastLoadedTokenRef.current === storedToken &&
      hasStoredEmprendimiento
    ) {
      const normalized = normalizeEmprendimiento(
        storedUser.profile.emprendimiento
      );
      setEmprendimiento(normalized);

      if (normalized.id_emprendimiento && productos.length === 0) {
        fetchProductos(normalized.id_emprendimiento);
      }
      return;
    }

    lastLoadedUserIdRef.current = storedUserId;
    lastLoadedTokenRef.current = storedToken;
    setCurrentUser(storedUser);

    if (!storedUser?.profile?.emprendimiento?.id_emprendimiento) {
      loadProfile(storedUserId, storedUser);
    } else {
      const normalized = normalizeEmprendimiento(
        storedUser.profile.emprendimiento
      );
      setEmprendimiento(normalized);
      setLoadingProfile(false);

      if (normalized.id_emprendimiento) {
        fetchProductos(normalized.id_emprendimiento);
      }
    }
  }, [user, navigate, loadProfile, fetchProductos, productos.length]);

  useEffect(() => {
    if (location.pathname.includes("/perfil/producto/nuevo")) {
      setShowModal(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (currentUser && onProfileLoaded) {
      const userId = getUserId(currentUser);
      if (!userId) return;

      if (lastNotifiedUserIdRef.current !== userId) {
        lastNotifiedUserIdRef.current = userId;
        onProfileLoaded(currentUser);
      }
    }
  }, [currentUser, onProfileLoaded]);

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
    emprendimiento?.nombre ||
    currentUser?.profile?.username ||
    "Tu emprendimiento";
  const emprendimientoDescripcion = emprendimiento?.descripcion || "";
  const profileDataForForm = {
    ...(currentUser?.profile || {}),
    ...(emprendimiento || {}),
    username:
      currentUser?.profile?.username ||
      currentUser?.username ||
      currentUser?.profile?.Usuario ||
      "",
  };
  const entrepreneurshipFormData = {
    ...emprendimiento,
  };
  const instagramValue = emprendimiento?.instagram || "";
  const instagramHref = instagramValue
    ? instagramValue.startsWith("http")
      ? instagramValue
      : `https://instagram.com/${instagramValue.replace("@", "")}`
    : null;
  const instagramLabel = instagramValue.replace(/^https?:\/\//, "");

  const emprendimientoActionLabel = emprendimiento?.id_emprendimiento
    ? "Editar emprendimiento"
    : "Agregar emprendimiento";
  const hasEmprendimiento = Boolean(emprendimiento?.id_emprendimiento);

  const handleOpenEntrepreneurship = () => {
    setError("");
    setShowEntrepreneurshipModal(true);
  };

  const handleAgregar = () => {
    if (!hasEmprendimiento) {
      setError("Crea tu emprendimiento antes de agregar productos.");
      return;
    }

    setError("");
    setProductoEdit(null);
    setShowModal(true);
    if (!location.pathname.includes("/perfil/producto/nuevo")) {
      navigate("/perfil/producto/nuevo", { replace: false });
    }
  };

  const closeProductForm = () => {
    setShowModal(false);
    setProductoEdit(null);
    setError("");
    if (location.pathname.includes("/perfil/producto/nuevo")) {
      navigate("/perfil", { replace: true });
    }
  };

  const handleEditar = () => {
    setError("");
    setShowEntrepreneurshipModal(true);
  };

  const handleSubmit = async (data) => {
    if (!emprendimiento?.id_emprendimiento) {
      setError("Debes tener un emprendimiento para publicar productos.");
      return;
    }

    const precioNumber = parseFloat(data.precio_dolares);
    if (Number.isNaN(precioNumber)) {
      setError("Ingresa un precio válido para el producto.");
      return;
    }

    const existenciasNumber = parseInt(data.existencias ?? "0", 10);
    if (Number.isNaN(existenciasNumber) || existenciasNumber < 0) {
      setError("Ingresa una cantidad de existencias válida.");
      return;
    }

    const categoriaId =
      productoEdit?.id_categoria || emprendimiento?.id_categoria || null;
    if (!categoriaId) {
      setError("Selecciona una categoría para tu emprendimiento.");
      return;
    }

    const payload = {
      nombre: data.nombre?.trim(),
      descripcion: data.descripcion?.trim() || "",
      imagen_url: data.imagen_url?.trim() || productoEdit?.imagen || "",
      precio_dolares: precioNumber,
      existencias: existenciasNumber,
      id_categoria: categoriaId,
      id_emprendimiento: emprendimiento.id_emprendimiento,
    };

    try {
      setError("");

      const endpoint = productoEdit?.id
        ? `${API_BASE_URL}/api/products/${productoEdit.id}`
        : `${API_BASE_URL}/api/products`;
      const method = productoEdit?.id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(currentUser),
        },
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

      closeProductForm();
    } catch (err) {
      console.error("Error guardando producto:", err);
      setError(err.message || "No se pudo guardar el producto");
    }
  };

  const handleSaveEntrepreneurship = async (data) => {
    if (!data?.nombre?.trim()) {
      setError("El nombre del emprendimiento es obligatorio.");
      return;
    }

    if (!data?.id_categoria) {
      setError("Selecciona una categoría para tu emprendimiento.");
      return;
    }

    const userId = getUserId(currentUser);

    if (!emprendimiento?.id_emprendimiento && !userId) {
      setError("No se encontró el usuario para crear el emprendimiento.");
      return;
    }

    try {
      setSavingEntrepreneurship(true);
      setError("");

      const endpoint = emprendimiento?.id_emprendimiento
        ? `${API_BASE_URL}/api/entrepreneurship/${emprendimiento.id_emprendimiento}`
        : `${API_BASE_URL}/api/entrepreneurship`;

      const method = emprendimiento?.id_emprendimiento ? "PUT" : "POST";

      const payload = {
        nombre: data.nombre?.trim(),
        descripcion: data.descripcion?.trim() || "",
        imagen_url: data.imagen_url?.trim() || "",
        instagram: data.instagram?.trim() || "",
        id_categoria: Number(data.id_categoria),
        id_usuario: emprendimiento?.id_emprendimiento ? undefined : userId,
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(currentUser),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo guardar el emprendimiento");
      }

      const normalized = normalizeEmprendimiento(
        result.emprendimiento || result.emprendimientoActualizado || result
      );

      setEmprendimiento(normalized);
      setCurrentUser((prevUser) => {
        if (!prevUser) return prevUser;
        const updatedProfile = {
          ...(prevUser.profile || {}),
          emprendimiento: {
            ...(prevUser.profile?.emprendimiento || {}),
            ...normalized,
          },
        };

        const merged = { ...prevUser, profile: updatedProfile };
        localStorage.setItem("user", JSON.stringify(merged));
        return merged;
      });

      setShowEntrepreneurshipModal(false);

      if (normalized.id_emprendimiento) {
        await fetchProductos(normalized.id_emprendimiento);
      }
    } catch (err) {
      console.error("Error guardando emprendimiento:", err);
      setError(err.message || "No se pudo guardar el emprendimiento");
    } finally {
      setSavingEntrepreneurship(false);
    }
  };

  const handleEliminarProducto = async (producto) => {
    if (
      !producto?.id ||
      !window.confirm(
        `¿Estás seguro de que quieres eliminar "${producto.nombre}"?`
      )
    ) {
      return;
    }

    try {
      setError("");
      const response = await fetch(
        `${API_BASE_URL}/api/products/${producto.id}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(currentUser),
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo eliminar el producto");
      }

      setProductos((prev) => prev.filter((p) => p.id !== producto.id));

      if (emprendimiento?.id_emprendimiento) {
        await fetchProductos(emprendimiento.id_emprendimiento);
      }

      closeProductForm();
    } catch (err) {
      console.error("Error eliminando producto:", err);
      setError(err.message || "No se pudo eliminar el producto");
    }
  };

  const handleSaveProfile = async (datos) => {
    const userId = getUserId(currentUser);

    if (!userId) {
      setError("No se encontró el usuario para actualizar el perfil.");
      return false;
    }

    try {
      if (
        datos.nuevaContraseña &&
        datos.nuevaContraseña !== datos.confirmarContraseña
      ) {
        setError("Las contraseñas no coinciden.");
        return false;
      }

      setSavingProfile(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/user/profile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(currentUser),
          },
          body: JSON.stringify({
            nombres: datos.nombres?.trim(),
            apellidos: datos.apellidos?.trim(),
            correo: datos.correo?.trim(),
            telefono: datos.telefono?.trim(),
            username:
              datos.username?.trim() ||
              currentUser?.username ||
              currentUser?.profile?.username ||
              currentUser?.profile?.Usuario,
            nuevaContraseña: datos.nuevaContraseña?.trim() || undefined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo actualizar el perfil");
      }

      setCurrentUser((prevUser) => {
        if (!prevUser) return prevUser;

        const updatedProfile = {
          ...(prevUser.profile || {}),
          nombres: datos.nombres?.trim() ?? prevUser.profile?.nombres,
          apellidos: datos.apellidos?.trim() ?? prevUser.profile?.apellidos,
          correo: datos.correo?.trim() ?? prevUser.profile?.correo,
          telefono: datos.telefono?.trim() ?? prevUser.profile?.telefono,
          username:
            datos.username?.trim() ??
            prevUser.profile?.username ??
            prevUser.profile?.Usuario,
        };

        const mergedUser = {
          ...prevUser,
          username: updatedProfile.username || prevUser.username,
          profile: updatedProfile,
        };
        localStorage.setItem("user", JSON.stringify(mergedUser));
        return mergedUser;
      });

      setEmprendimiento((prev) => ({
        ...prev,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        correo: datos.correo,
        telefono: datos.telefono,
      }));

      return true;
    } catch (profileError) {
      console.error("Error actualizando perfil:", profileError);
      setError(profileError.message || "No se pudo actualizar el perfil");
      return false;
    } finally {
      setSavingProfile(false);
    }
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
                  onClick={handleOpenEntrepreneurship}
                  className="px-6 py-2 bg-gradient-to-r from-[#557051] to-[#6a8a62] hover:from-[#445a3f] hover:to-[#557051] text-white rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  {emprendimientoActionLabel}
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
                onClick={handleOpenEntrepreneurship}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#557051] to-[#6a8a62] hover:from-[#445a3f] hover:to-[#557051] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                {emprendimientoActionLabel}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative mt-11 mb-2 flex items-center">
            <div className="flex-1 border-t border-gray-300" />
            <button
              onClick={handleAgregar}
              disabled={!hasEmprendimiento}
              className={`absolute right-0 -top-3 h-10 w-10 rounded-full text-white text-2xl font-semibold shadow-md transition-transform hover:-translate-y-0.5 ${
                hasEmprendimiento
                  ? "bg-[#557051] hover:bg-[#445a3f]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              aria-label="Agregar producto"
            >
              +
            </button>
          </div>

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
              <h2 className="text-3xl font-light mb-2">
                Comparte tus productos
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Cuando compartas productos, aparecerán en tu perfil.
              </p>
              <button
                onClick={handleAgregar}
                disabled={!hasEmprendimiento}
                className={`px-8 py-3 text-white rounded-xl font-semibold text-sm shadow-lg transition-all duration-200 active:scale-95 ${
                  hasEmprendimiento
                    ? "bg-[#557051] hover:bg-[#445a3f] hover:shadow-xl"
                    : "bg-gray-300 cursor-not-allowed shadow-none"
                }`}
              >
                Comparte tu primer producto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-7 mt-4">
              {productos.map((p) => (
                <div key={p.id} className="aspect-square">
                  <ProductCard p={p} onClick={handleEditar} disableLink />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductForm
        visible={showModal}
        onClose={closeProductForm}
        onSubmit={handleSubmit}
        producto={productoEdit}
        onDelete={handleEliminarProducto}
        errorMessage={error}
      />

      <EditProfile
        visible={showEditProfileModal}
        onClose={() => {
          setShowEditProfileModal(false);
          setError("");
        }}
        emprendimientoData={profileDataForForm}
        onSave={handleSaveProfile}
        errorMessage={error}
        loading={savingProfile}
      />
      <EntrepreneurshipForm
        visible={showEntrepreneurshipModal}
        onClose={() => {
          setShowEntrepreneurshipModal(false);
          setError("");
        }}
        initialData={entrepreneurshipFormData}
        onSubmit={handleSaveEntrepreneurship}
        loading={savingEntrepreneurship}
        errorMessage={error}
      />
    </>
  );
}

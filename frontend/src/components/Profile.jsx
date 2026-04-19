import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SuccessDialog from "./SuccessDialog";
import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";
import EditProfile from "./EditProfile";
import EntrepreneurshipForm from "./EntrepreneurshipForm";
import { API_BASE_URL } from "../utils/api";
import logoVerde from "../images/logoVerde.png";

const PROFILE_PLACEHOLDER = logoVerde;
const EMPRENDIMIENTO_CACHE_KEY = "emprendimientoCache";

const isAdminViewMode = (userData) => {
  if (userData?.isAdminView) return true;
  if (userData?.disableActions) return true;
  const adminViewFlag = localStorage.getItem("isAdminViewingProfile");
  return adminViewFlag === "true";
};

const saveOriginalAdminSession = () => {
  if (localStorage.getItem("adminSessionSaved") === "true") return;

  const adminToken = localStorage.getItem("token");
  const adminUser = localStorage.getItem("user");

  if (adminToken && adminUser) {
    try {
      localStorage.setItem("adminOriginalToken", adminToken);
      localStorage.setItem("adminOriginalUser", adminUser);
      localStorage.setItem("isAdminViewingProfile", "true");
      localStorage.setItem("adminSessionSaved", "true");
    } catch (error) {
      console.error("Error guardando sesión de admin:", error);
    }
  }
};

const restoreOriginalAdminSession = () => {
  const originalToken = localStorage.getItem("adminOriginalToken");
  const originalUser = localStorage.getItem("adminOriginalUser");

  if (originalToken && originalUser) {
    try {
      localStorage.setItem("token", originalToken);
      localStorage.setItem("user", originalUser);
    } catch (error) {
      console.error("Error restaurando sesión de admin:", error);
    }
  }

  localStorage.removeItem("adminOriginalToken");
  localStorage.removeItem("adminOriginalUser");
  localStorage.removeItem("isAdminViewingProfile");
  localStorage.removeItem("adminSessionSaved");
};

const getStoredToken = (userData) => {
  if (isAdminViewMode(userData)) {
    const adminToken =
      localStorage.getItem("adminOriginalToken") ||
      localStorage.getItem("token");
    if (adminToken && adminToken !== "undefined" && adminToken !== "null") {
      return adminToken;
    }
  }

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

// Función para enriquecer un producto con sus datos completos
const enrichProduct = async (producto) => {
  if (
    producto.id_categoria !== undefined &&
    producto.id_categoria !== null &&
    producto.id_emprendimiento !== undefined &&
    producto.id_emprendimiento !== null
  ) {
    return producto;
  }

  if (!producto.precio && producto.precio !== 0) {
    return producto;
  }

  try {
    const productId = producto.id || producto.id_producto;
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);

    if (response.ok) {
      const data = await response.json();
      const detalle = data.producto || data;

      return {
        ...producto,
        id_categoria: detalle.id_categoria ?? producto.id_categoria,
        id_emprendimiento:
          detalle.id_emprendimiento ?? producto.id_emprendimiento,
        categoria: detalle.categoria ?? producto.categoria,
      };
    }
  } catch (err) {
    console.error(`Error enriching product ${producto.id}:`, err);
  }

  return producto;
};

const enrichProducts = async (productos) => {
  const productosEnriquecidos = await Promise.all(
    productos.map(async (item) => {
      if (item.precio !== undefined || item.precio === 0) {
        return await enrichProduct(item);
      }
      return item;
    }),
  );
  return productosEnriquecidos;
};

const readCachedEmprendimientos = () => {
  try {
    const raw = localStorage.getItem(EMPRENDIMIENTO_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
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

  boxful_email: data.boxful_email || "",
  boxful_address_id: data.boxful_address_id || null,
  boxful_allows_card_payment: data.boxful_allows_card_payment ?? true,
  boxful_allows_cod_payment: data.boxful_allows_cod_payment ?? false,
  boxful_courier_id: data.boxful_courier_id || null,
});

export default function Profile({ user, onProfileLoaded, disableActions }) {
  const [showModal, setShowModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [showEntrepreneurshipModal, setShowEntrepreneurshipModal] =
    useState(false);
  const [savingEntrepreneurship, setSavingEntrepreneurship] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const initializedRef = useRef(false);
  const adminSessionSavedRef = useRef(false);
  const currentUserIdRef = useRef(null);
  const lastNotifiedUserIdRef = useRef(null);
  const loadingRef = useRef(false);
  const currentUserRef = useRef(null);

  const isAdminMode = useMemo(() => {
    return isAdminViewMode({
      isAdminView: user?.isAdminView,
      disableActions,
    });
  }, [user?.isAdminView, disableActions]);

  const [emprendimiento, setEmprendimiento] = useState({});
  const [productos, setProductos] = useState([]);

  const [currentUser, setCurrentUser] = useState(() => {
    if (user) return user;
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [cuponesProducto, setCuponesProducto] = useState([]);
  const [cuponesCategoria, setCuponesCategoria] = useState([]);
  const [cuponesEmp, setCuponesEmp] = useState([]);
  const [cuponesLoaded, setCuponesLoaded] = useState(false);

  const getVendorIdFromUrl = useCallback(() => {
    const pathParts = location.pathname.split("/");
    const profileIndex = pathParts.indexOf("perfil");
    if (profileIndex !== -1 && pathParts[profileIndex + 1]) {
      return pathParts[profileIndex + 1];
    }
    return null;
  }, [location.pathname]);

  const vendorIdFromUrl = getVendorIdFromUrl();

  const targetUserId = useMemo(() => {
    if (isAdminMode && vendorIdFromUrl) {
      return vendorIdFromUrl;
    }
    return getUserId(currentUser);
  }, [isAdminMode, vendorIdFromUrl, currentUser]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    currentUserIdRef.current = targetUserId;
  }, [targetUserId]);

  useEffect(() => {
    if (isAdminMode && !adminSessionSavedRef.current) {
      saveOriginalAdminSession();
      adminSessionSavedRef.current = true;
    }
  }, [isAdminMode]);

  // FETCH CUPONES
  useEffect(() => {
    const fetchCupones = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/cupones?solo_disponibles=true`,
        );
        if (!res.ok) return;

        const data = await res.json();
        const cupones = data.cupones || [];

        setCuponesProducto(cupones.filter((c) => c.id_producto));
        setCuponesCategoria(
          cupones.filter((c) => c.id_categoria && !c.id_producto),
        );
        setCuponesEmp(
          cupones.filter(
            (c) => c.id_emprendimiento && !c.id_producto && !c.id_categoria,
          ),
        );
        setCuponesLoaded(true);
      } catch (err) {
        console.error("Error cargando cupones:", err);
      }
    };

    fetchCupones();
  }, []);

  const getCouponForProduct = (producto) => {
    if (!cuponesLoaded) return null;
    if (producto.precio === undefined && producto.precio !== 0) return null;

    const porProducto = cuponesProducto.find(
      (c) =>
        String(c.id_producto) === String(producto.id || producto.id_producto),
    );
    if (porProducto) return porProducto;

    const porCategoria = cuponesCategoria.find(
      (c) => String(c.id_categoria) === String(producto.id_categoria),
    );
    if (porCategoria) return porCategoria;

    const porEmprendimiento = cuponesEmp.find(
      (c) => String(c.id_emprendimiento) === String(producto.id_emprendimiento),
    );
    return porEmprendimiento || null;
  };

  const fetchProductos = useCallback(
    async (emprendimientoId) => {
      if (!emprendimientoId) {
        setProductos([]);
        return [];
      }

      try {
        const headers = isAdminMode
          ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
          : getAuthHeaders(currentUserRef.current);

        const response = await fetch(
          `${API_BASE_URL}/products?emprendimiento_id=${emprendimientoId}`,
          {
            headers: headers,
          },
        );

        if (response.status === 404 || response.status === 204) {
          setProductos([]);
          return [];
        }

        if (!response.ok) {
          throw new Error("No se pudieron obtener los productos");
        }

        const data = await response.json();
        let productosNormalizados = (data.productos || data.data || []).map(
          normalizeProducto,
        );

        // Enriquecer productos para obtener id_categoria
        productosNormalizados = await enrichProducts(productosNormalizados);

        setProductos(productosNormalizados);
        return productosNormalizados;
      } catch (fetchError) {
        console.error("Error cargando productos:", fetchError);
        if (!fetchError.message.includes("404")) {
          setError("Error al cargar los productos");
        }
        return [];
      }
    },
    [isAdminMode],
  );

  const fetchEmprendimientoById = useCallback(
    async (emprendimientoId) => {
      if (!emprendimientoId) return null;

      try {
        const headers = isAdminMode
          ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
          : getAuthHeaders(currentUserRef.current);

        const response = await fetch(
          `${API_BASE_URL}/entrepreneurship/${emprendimientoId}`,
          {
            headers: headers,
          },
        );

        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error("No se pudo obtener el emprendimiento");
        }

        const data = await response.json();
        const normalized = normalizeEmprendimiento(data);
        setEmprendimiento(normalized);
        return normalized;
      } catch (fetchError) {
        console.error("Error obteniendo emprendimiento:", fetchError);
        if (!fetchError.message.includes("404")) {
          setError("Error al cargar el emprendimiento");
        }
        return null;
      }
    },
    [isAdminMode],
  );

  const refreshData = useCallback(async () => {
    const userId = targetUserId;
    if (!userId || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const headers = isAdminMode
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
        : getAuthHeaders(currentUserRef.current);

      const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {
        headers: headers,
      });

      if (!response.ok) throw new Error("No se pudo actualizar los datos");

      const payload = await response.json();
      const profileData = payload.profile || payload;

      let emprendimientoId = null;

      if (profileData?.emprendimiento) {
        const normalized = normalizeEmprendimiento(profileData.emprendimiento);
        setEmprendimiento(normalized);
        saveCachedEmprendimiento(userId, normalized);
        emprendimientoId = normalized.id_emprendimiento;
      } else if (profileData?.id_emprendimiento) {
        emprendimientoId = profileData.id_emprendimiento;
        const emprendimientoData =
          await fetchEmprendimientoById(emprendimientoId);
        if (emprendimientoData) {
          setEmprendimiento(emprendimientoData);
        }
      } else {
        setEmprendimiento({});
        setProductos([]);
      }

      if (emprendimientoId) {
        await fetchProductos(emprendimientoId);
      }

      if (!isAdminMode) {
        const updatedUser = {
          ...currentUserRef.current,
          profile: {
            ...profileData,
            emprendimiento: profileData?.emprendimiento || {},
          },
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error("Error actualizando datos:", error);
      setError("Error al actualizar los datos");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchProductos, fetchEmprendimientoById, isAdminMode, targetUserId]);

  const resetEntrepreneurshipData = useCallback(() => {
    setEmprendimiento({});
    setProductos([]);

    const userId = targetUserId;
    if (userId) {
      const cache = readCachedEmprendimientos();
      delete cache[userId];
      localStorage.setItem(EMPRENDIMIENTO_CACHE_KEY, JSON.stringify(cache));
    }
  }, [targetUserId]);

  useEffect(() => {
    if (initializedRef.current) return;

    const initializeProfile = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        const storedUser =
          user || JSON.parse(localStorage.getItem("user") || "null");

        const userId = targetUserId;

        if (!userId) {
          if (!isAdminMode) navigate("/vender");
          setLoading(false);
          return;
        }

        const headers = isAdminMode
          ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
          : getAuthHeaders(storedUser);

        const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {
          headers: headers,
        });

        if (!response.ok) {
          if (response.status === 404) {
            setLoading(false);
            initializedRef.current = true;
            return;
          }
          throw new Error("No se pudo obtener el perfil");
        }

        const payload = await response.json();
        const profileData = payload.profile || payload;

        if (profileData?.emprendimiento) {
          const normalized = normalizeEmprendimiento(
            profileData.emprendimiento,
          );
          setEmprendimiento(normalized);
          saveCachedEmprendimiento(userId, normalized);

          if (normalized.id_emprendimiento) {
            await fetchProductos(normalized.id_emprendimiento);
          }
        } else if (profileData?.id_emprendimiento) {
          const normalized = await fetchEmprendimientoById(
            profileData.id_emprendimiento,
          );
          if (normalized) {
            setEmprendimiento(normalized);
            saveCachedEmprendimiento(userId, normalized);
            await fetchProductos(normalized.id_emprendimiento);
          }
        } else {
          const cachedEmprendimiento = getCachedEmprendimiento(userId);
          if (cachedEmprendimiento) {
            setEmprendimiento(normalizeEmprendimiento(cachedEmprendimiento));
            if (cachedEmprendimiento.id_emprendimiento) {
              await fetchProductos(cachedEmprendimiento.id_emprendimiento);
            }
          }
        }

        if (!isAdminMode) {
          const updatedUser = {
            ...storedUser,
            profile: {
              ...profileData,
              emprendimiento: profileData.emprendimiento || {},
            },
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }
      } catch (error) {
        console.error("Error en carga inicial:", error);
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
        initializedRef.current = true;
        loadingRef.current = false;
      }
    };

    initializeProfile();
  }, [
    fetchProductos,
    fetchEmprendimientoById,
    isAdminMode,
    navigate,
    user,
    targetUserId,
  ]);

  useEffect(() => {
    if (currentUser && onProfileLoaded) {
      const userId = getUserId(currentUser);
      if (userId && lastNotifiedUserIdRef.current !== userId) {
        lastNotifiedUserIdRef.current = userId;
        onProfileLoaded(currentUser);
      }
    }
  }, [currentUser, onProfileLoaded]);

  useEffect(() => {
    if (location.pathname.includes("/perfil/producto/nuevo")) {
      setShowModal(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (isAdminMode) {
        restoreOriginalAdminSession();
        adminSessionSavedRef.current = false;
      }
    };
  }, [isAdminMode]);

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    setSuccessMessage("");

    if (successMessage.includes("Perfil eliminado")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("emprendimientoCache");
      window.location.href = "/";
    }
  };

  const handleSubmit = async (data) => {
    if (!emprendimiento?.id_emprendimiento) {
      setError("Debes tener un emprendimiento para publicar productos.");
      return false;
    }

    if (isAdminMode) {
      setError("Los administradores no pueden crear/modificar productos.");
      return false;
    }

    const payload = {
      nombre: data.nombre?.trim(),
      descripcion: data.descripcion?.trim() || "",
      imagen_url: data.imagen_url?.trim() || productoEdit?.imagen || "",
      precio_dolares: parseFloat(data.precio_dolares),
      existencias: parseInt(data.existencias ?? "0", 10),
      id_categoria: productoEdit?.id_categoria || emprendimiento?.id_categoria,
      id_emprendimiento: emprendimiento.id_emprendimiento,
    };

    try {
      setError("");

      const endpoint = productoEdit?.id
        ? `${API_BASE_URL}/products/${productoEdit.id}`
        : `${API_BASE_URL}/products`;

      const response = await fetch(endpoint, {
        method: productoEdit?.id ? "PUT" : "POST",
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
        result.producto || result.product || result,
      );

      setProductos((prev) => {
        if (productoEdit?.id) {
          return prev.map((p) => (p.id === productoEdit.id ? savedProduct : p));
        }
        return [...prev, savedProduct];
      });

      setSuccessMessage(
        productoEdit
          ? "Producto actualizado correctamente"
          : "Producto creado correctamente",
      );
      setShowSuccessDialog(true);
      closeProductForm();

      await refreshData();
      return true;
    } catch (err) {
      console.error("Error guardando producto:", err);
      setError(err.message || "No se pudo guardar el producto");
      return false;
    }
  };

  const handleEliminarProducto = async (producto) => {
    if (!producto?.id) return false;

    if (isAdminMode) {
      setError("Los administradores no pueden eliminar productos.");
      return false;
    }

    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/products/${producto.id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders(currentUser) },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo eliminar el producto");
      }

      setProductos((prev) => prev.filter((p) => p.id !== producto.id));
      setSuccessMessage(`Producto eliminado correctamente`);
      setShowSuccessDialog(true);
      closeProductForm();

      await refreshData();
      return true;
    } catch (err) {
      console.error("Error eliminando producto:", err);
      setError(err.message || "No se pudo eliminar el producto");
      return false;
    }
  };

  const handleSaveEntrepreneurship = async (data) => {
    if (!data?.nombre?.trim() || !data?.id_categoria) {
      setError(
        !data?.nombre?.trim()
          ? "El nombre del emprendimiento es obligatorio."
          : "Selecciona una categoría para tu emprendimiento.",
      );
      return false;
    }

    const userId = targetUserId;

    try {
      setSavingEntrepreneurship(true);
      setError("");

      const endpoint = emprendimiento?.id_emprendimiento
        ? `${API_BASE_URL}/entrepreneurship/${emprendimiento.id_emprendimiento}`
        : `${API_BASE_URL}/entrepreneurship`;

      const response = await fetch(endpoint, {
        method: emprendimiento?.id_emprendimiento ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(currentUser),
        },
        body: JSON.stringify({
          nombre: data.nombre?.trim(),
          descripcion: data.descripcion?.trim() || "",
          imagen_url: data.imagen_url?.trim() || "",
          instagram: data.instagram?.trim() || "",
          id_categoria: Number(data.id_categoria),
          id_usuario: emprendimiento?.id_emprendimiento ? undefined : userId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo guardar el emprendimiento");
      }

      const normalized = normalizeEmprendimiento(
        result.emprendimiento || result.emprendimientoActualizado || result,
      );

      setEmprendimiento(normalized);
      saveCachedEmprendimiento(userId, normalized);
      setSuccessMessage(
        emprendimiento?.id_emprendimiento
          ? "Emprendimiento actualizado correctamente"
          : "Emprendimiento creado correctamente",
      );
      setShowSuccessDialog(true);
      setShowEntrepreneurshipModal(false);

      await refreshData();
      return true;
    } catch (err) {
      console.error("Error guardando emprendimiento:", err);
      setError(err.message || "No se pudo guardar el emprendimiento");
      return false;
    } finally {
      setSavingEntrepreneurship(false);
    }
  };

  const handleSaveProfile = async (datos) => {
    const userId = targetUserId;
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

      const responseUser = await fetch(
        `${API_BASE_URL}/user/profile/${userId}`,
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
              currentUser?.profile?.username,
            nuevaContraseña: datos.nuevaContraseña?.trim() || undefined,
          }),
        },
      );

      const resultUser = await responseUser.json();

      if (!responseUser.ok) {
        throw new Error(
          resultUser.error || "No se pudo actualizar el perfil personal",
        );
      }

      if (emprendimiento?.id_emprendimiento) {
        const boxfulPayload = {
          boxful_email: datos.boxful_email?.trim() || null,
          boxful_password: datos.boxful_password || undefined,
          boxful_address_id: datos.boxful_address_id || null,
          boxful_allows_card_payment: datos.boxful_allows_card_payment ?? true,
          boxful_allows_cod_payment: datos.boxful_allows_cod_payment ?? false,
          boxful_courier_id: datos.boxful_courier_id?.trim() || null,
        };

        try {
          const responseEmp = await fetch(
            `${API_BASE_URL}/entrepreneurship/${emprendimiento.id_emprendimiento}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(currentUser),
              },
              body: JSON.stringify(boxfulPayload),
            },
          );

          if (!responseEmp.ok) {
            const errorEmp = await responseEmp.json();
            console.error("Error guardando datos de envío:", errorEmp);
          }
        } catch (error) {
          console.error("Fallo de red al guardar el emprendimiento:", error);
        }
      }

      setSuccessMessage("Perfil actualizado correctamente");
      setShowSuccessDialog(true);
      setShowEditProfileModal(false);

      await refreshData();
      return true;
    } catch (profileError) {
      console.error("Error actualizando perfil:", profileError);
      setError(profileError.message || "No se pudo actualizar el perfil");
      return false;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAgregar = () => {
    if (!emprendimiento?.id_emprendimiento) {
      setError("Crea tu emprendimiento antes de agregar productos.");
      return;
    }
    if (isAdminMode) {
      setError("Los administradores no pueden agregar productos.");
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

  const handleOpenEntrepreneurship = () => {
    setError("");
    setShowEntrepreneurshipModal(true);
  };

  const handleEntrepreneurshipDeleteSuccess = () => {
    resetEntrepreneurshipData();
    setSuccessMessage("Emprendimiento eliminado correctamente");
    setShowSuccessDialog(true);
    refreshData();
  };

  const handleProfileDeleteSuccess = () => {
    setSuccessMessage(
      "Perfil eliminado correctamente. Serás redirigido a la página de inicio.",
    );
    setShowSuccessDialog(true);
  };

  if (loading && !initializedRef.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-montserrat">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#557051] border-r-transparent"></div>
          <p className="mt-4 text-gray-500 text-sm font-semibold">
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  const profileImage = emprendimiento?.imagen_url || PROFILE_PLACEHOLDER;
  const emprendimientoNombre =
    emprendimiento?.nombre ||
    currentUser?.profile?.username ||
    "Tu emprendimiento";
  const emprendimientoDescripcion = emprendimiento?.descripcion || "";
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
  const canAddProducts = hasEmprendimiento && !isAdminMode;

  return (
    <>
      <div className="min-h-screen bg-white font-montserrat">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {isAdminMode && (
            <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Modo administrador</span>
              </div>
              <p className="text-sm mt-1">
                Estás viendo y editando el perfil de{" "}
                {emprendimientoNombre || "este vendedor"}.
                {!hasEmprendimiento &&
                  " Este usuario aún no tiene un emprendimiento."}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

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

          <div className="relative mt-11 mb-2 flex items-center">
            <div className="flex-1 border-t border-gray-300" />
            <button
              onClick={handleAgregar}
              disabled={!canAddProducts}
              className={`absolute right-0 -top-3 h-10 w-10 rounded-full text-white text-2xl font-semibold shadow-md transition-transform ${
                canAddProducts
                  ? "bg-[#557051] hover:bg-[#445a3f] hover:-translate-y-0.5 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              aria-label="Agregar producto"
              title={
                isAdminMode
                  ? "Los administradores no pueden agregar productos"
                  : !hasEmprendimiento
                    ? "Primero debes crear un emprendimiento"
                    : "Agregar producto"
              }
            >
              +
            </button>
          </div>

          <div className="flex justify-center">
            <p className="text-sm font-semibold mt-8 pb-4">
              {isAdminMode ? "Productos del emprendimiento" : "Productos"}
            </p>
          </div>

          {productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <h2 className="text-3xl font-light mb-2">
                {isAdminMode
                  ? "Este emprendimiento no tiene productos"
                  : "Comparte tus productos"}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {isAdminMode
                  ? "El emprendedor aún no ha agregado productos."
                  : "Cuando compartas productos, aparecerán en tu perfil."}
              </p>
              {!isAdminMode && (
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
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-4">
              {productos.map((p) => {
                const coupon = getCouponForProduct(p);
                return (
                  <ProductCard
                    key={p.id || p.id_producto}
                    p={p}
                    activeCoupon={coupon}
                    showPrice={true}
                    allowEdit={!isAdminMode}
                  />
                );
              })}
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
        isAdminMode={isAdminMode}
      />

      <EditProfile
        visible={showEditProfileModal}
        onClose={() => {
          setShowEditProfileModal(false);
          setError("");
        }}
        profileData={currentUser?.profile}
        emprendimientoData={emprendimiento}
        onSave={handleSaveProfile}
        errorMessage={error}
        loading={savingProfile}
        onDeleteSuccess={handleProfileDeleteSuccess}
        onSuccess={(message) => {
          setSuccessMessage(message);
          setShowSuccessDialog(true);
          setShowEditProfileModal(false);
        }}
        isAdminMode={isAdminMode}
      />

      <EntrepreneurshipForm
        visible={showEntrepreneurshipModal}
        onClose={() => {
          setShowEntrepreneurshipModal(false);
          setError("");
        }}
        initialData={emprendimiento}
        onSubmit={handleSaveEntrepreneurship}
        loading={savingEntrepreneurship}
        errorMessage={error}
        onDeleteSuccess={handleEntrepreneurshipDeleteSuccess}
        isAdminMode={isAdminMode}
      />

      <SuccessDialog
        show={showSuccessDialog}
        message={successMessage}
        onConfirm={handleSuccessClose}
      />
    </>
  );
}
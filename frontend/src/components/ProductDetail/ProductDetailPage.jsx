import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Carousel from "../Carousel";
import ProductHeader from "./ProductHeader";
import ProductForm from "../ProductForm";
import SuccessDialog from "../SuccessDialog";
import { API_BASE_URL } from "../../utils/api";
import ShippingCheckoutModal from "../ShippingCheckoutModal";
import { Truck } from "lucide-react";
import ProductCoupon from "./ProductCoupon";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  const [activeCoupon, setActiveCoupon] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isAdminViewingProfile =
    localStorage.getItem("isAdminViewingProfile") === "true";
  const storedUserStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  const [showBoxful, setShowBoxful] = useState(false);

  let myEntrepreneurshipId = null;
  let isAdmin = false;

  if (storedUserStr) {
    try {
      const userObj = JSON.parse(storedUserStr);
      const emp = userObj?.profile?.emprendimiento;

      const userRole =
        userObj?.profile?.Rol || userObj?.profile?.rol || userObj?.role;
      isAdmin =
        userRole?.toLowerCase() === "administrador" || isAdminViewingProfile;

      if (emp) {
        myEntrepreneurshipId =
          emp.id_emprendimiento || emp.id || emp.idEmprendimiento;
      }
    } catch (e) {
      console.error("Error leyendo usuario del localStorage", e);
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            setCategories(data.data);
          } else if (Array.isArray(data)) {
            setCategories(data);
          } else {
            setCategories([]);
          }
        }
      } catch (error) {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const productRes = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!productRes.ok) throw new Error("No se pudo obtener el producto");
        const productData = await productRes.json();
        const producto = productData.producto;
        setProduct(producto);

        if (producto.id_emprendimiento) {
          const emprendimientoRes = await fetch(
            `${API_BASE_URL}/entrepreneurship/${producto.id_emprendimiento}`,
          );
          if (emprendimientoRes.ok) {
            const emprendimientoData = await emprendimientoRes.json();
            setEmprendimiento(emprendimientoData);
          }

          // NUEVO: Fetch de cupones activos del emprendimiento
          try {
            const cuponesRes = await fetch(
              `${API_BASE_URL}/cupones?id_emprendimiento=${producto.id_emprendimiento}&solo_disponibles=true`
            );
            if (cuponesRes.ok) {
              const cuponesData = await cuponesRes.json();
              const cupones = cuponesData.cupones || [];

              // Evaluamos la jerarquía del cupón (Producto > Categoría > Emprendimiento)
              let applicable = cupones.find(
                (c) => String(c.id_producto) === String(producto.id || producto.id_producto)
              );
              
              if (!applicable) {
                applicable = cupones.find(
                  (c) => String(c.id_categoria) === String(producto.id_categoria)
                );
              }
              
              if (!applicable) {
                applicable = cupones.find(
                  (c) => !c.id_producto && !c.id_categoria
                );
              }

              setActiveCoupon(applicable);
            }
          } catch (err) {
            console.error("Error obteniendo cupones:", err);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const esDueno =
    product &&
    myEntrepreneurshipId &&
    String(product.id_emprendimiento) === String(myEntrepreneurshipId);

  const canEdit = esDueno || isAdmin;

  const handleUpdateProduct = async (formData) => {
    // ... tu lógica original de handleUpdateProduct ...
    setUpdateError("");
    try {
      const payload = {
        ...formData,
        id_categoria: formData.id_categoria || product.id_categoria,
        disponible: true,
      };

      const authToken = isAdmin
        ? token
        : localStorage.getItem("adminOriginalToken") || token;

      const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el producto");
      }

      const raw = result.producto;

      let categoriaNombre = product.categoria || "Sin categoría";
      const categoriaId = parseInt(
        formData.id_categoria || product.id_categoria,
      );

      if (Array.isArray(categories)) {
        const categoriaActualizada = categories.find(
          (cat) => cat.id_categoria === categoriaId,
        );

        if (categoriaActualizada) {
          categoriaNombre =
            categoriaActualizada.categoria ||
            categoriaActualizada.nombre ||
            "Sin nombre";
        }
      }

      const productoActualizado = {
        ...product,
        nombre: raw.nombre || raw.Nombre,
        descripcion: raw.descripcion || raw.Descripcion,
        imagen: raw.imagen || raw.imagen_url || raw.Imagen_URL,
        precio: raw.precio || raw.precio_dolares || raw.Precio_dolares,
        id_categoria:
          raw.id_categoria || formData.id_categoria || product.id_categoria,
        categoria: categoriaNombre,
      };

      setProduct(productoActualizado);
      setShowModal(false);
      setSuccessMessage("Producto actualizado correctamente");
      setShowSuccess(true);
    } catch (err) {
      setUpdateError(err.message || "Error al actualizar el producto");
    }
  };

  const handleDeleteProduct = async () => {
    // ... tu lógica original de handleDeleteProduct ...
    try {
      const authToken = isAdmin
        ? token
        : localStorage.getItem("adminOriginalToken") || token;

      const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccessMessage("Producto eliminado correctamente");
        setShowSuccess(true);
        setTimeout(() => {
          if (isAdmin) {
            if (isAdminViewingProfile) {
              navigate(-1);
            } else {
              navigate("/admin/entrepreneurs");
            }
          } else {
            navigate("/perfil");
          }
        }, 1500);
      } else {
        const errorData = await response.json();
        setUpdateError(errorData.message || "No se pudo eliminar el producto");
      }
    } catch (e) {
      setUpdateError("Error de conexión al eliminar");
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Producto no encontrado</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {isAdmin && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Modo administrador</span>
            </div>
            <p className="text-sm mt-1">
              Estás viendo este producto como administrador. Puedes editarlo o
              eliminarlo.
            </p>
          </div>
        )}

        {emprendimiento && (
          <div className="mb-8">
            <ProductHeader
              nombre={emprendimiento.nombre}
              numero={emprendimiento.telefono}
              imagen={emprendimiento.imagen_url}
              instagram={emprendimiento.instagram}
              isAdmin={isAdmin}
            />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={
                  product.imagen ||
                  "https://via.placeholder.com/400?text=Sin+Imagen"
                }
                alt={product.nombre}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400?text=Sin+Imagen";
                }}
              />
            </div>

            <div className="md:w-1/2 p-6 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                {product.nombre}
              </h1>

              {/* RENDERIZADO CONDICIONAL DEL PRECIO */}
              {activeCoupon ? (
                <div className="mb-4 flex items-center gap-3">
                  <p className="text-xl text-gray-400 line-through font-medium">
                    ${product.precio}
                  </p>
                  <div className="flex flex-col">
                    <p className="text-3xl font-bold text-red-600">
                      ${Math.max(0, product.precio - activeCoupon.descuento).toFixed(2)}
                    </p>
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                      Descuento aplicado
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-green-900 mb-4">
                  ${product.precio}
                </p>
              )}

              <div className="mb-4">
                <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                  {product.categoria || "Sin categoría"}
                </span>
              </div>
              <ProductCoupon />

              {product.descripcion && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Descripción
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.descripcion}
                  </p>
                </div>
              )}

              <div className="space-y-3 mt-6">
                {canEdit ? (
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full bg-green-900 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    {isAdmin ? "Editar producto" : "Editar producto"}
                  </button>
                ) : (
                  <>
                    {emprendimiento?.telefono && (
                      <a
                        href={`https://wa.me/503${emprendimiento.telefono}?text=Hola! Me interesa el producto: ${product.nombre}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-colors text-center block font-medium shadow-sm"
                      >
                        Contactar por WhatsApp
                      </a>
                    )}

                    <button
                      onClick={() => setShowBoxful(true)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl transition-colors text-center block font-medium shadow-sm"
                    >
                      📦 Comprar por Boxful
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {product.id_emprendimiento && (
          <Carousel
            title={`Más productos de ${emprendimiento?.nombre || "este emprendimiento"}`}
            subtitle={`Descubre otros artículos de ${emprendimiento?.nombre || "este emprendedor"}`}
            endpoint={`/products?emprendimiento_id=${product.id_emprendimiento}`}
          />
        )}
      </div>

      <ProductForm
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleUpdateProduct}
        onDelete={handleDeleteProduct}
        producto={product}
        errorMessage={updateError}
        categories={categories}
        isAdminMode={isAdmin}
      />

      <SuccessDialog
        show={showSuccess}
        message={successMessage}
        onConfirm={handleSuccessClose}
      />

      <ShippingCheckoutModal
        visible={showBoxful}
        onClose={() => setShowBoxful(false)}
        product={product}
        emprendimiento={emprendimiento}
      />
    </div>
  );
}
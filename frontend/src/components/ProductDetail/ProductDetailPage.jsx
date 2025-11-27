import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Carousel from "../Carousel";
import ProductHeader from "./ProductHeader";
import ProductForm from "../ProductForm"; 
import { API_BASE_URL } from "../../utils/api";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const storedUserStr = localStorage.getItem("user");
  const token = localStorage.getItem("token"); 
  let myEntrepreneurshipId = null;

  if (storedUserStr) {
    try {
      const userObj = JSON.parse(storedUserStr);
      const emp = userObj?.profile?.emprendimiento;
      if (emp) {
        myEntrepreneurshipId = emp.id_emprendimiento || emp.id || emp.idEmprendimiento;
      }
    } catch (e) {
      console.error("Error leyendo usuario del localStorage", e);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Obtener el producto
        const productRes = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!productRes.ok) throw new Error("No se pudo obtener el producto");
        const productData = await productRes.json();
        const producto = productData.producto;
        setProduct(producto);

        // 2. Obtener el emprendimiento
        if (producto.id_emprendimiento) {
          const emprendimientoRes = await fetch(
            `${API_BASE_URL}/api/entrepreneurship/${producto.id_emprendimiento}`
          );
          if (emprendimientoRes.ok) {
            const emprendimientoData = await emprendimientoRes.json();
            setEmprendimiento(emprendimientoData);
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

  const esDueno = product && myEntrepreneurshipId && String(product.id_emprendimiento) === String(myEntrepreneurshipId);

  const handleUpdateProduct = async (formData) => {
    setUpdateError("");
    try {
      const payload = {
        ...formData,
        id_categoria: product.id_categoria, 
        disponible: true 
      };

      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el producto");
      }

     const raw = result.producto; 

      const productoActualizado = {
        ...product, // Mantiene cosas que no cambiaron 
        
        nombre: raw.nombre || raw.Nombre,
        descripcion: raw.descripcion || raw.Descripcion,
        imagen: raw.imagen || raw.imagen_url || raw.Imagen_URL, 
        precio: raw.precio || raw.precio_dolares || raw.Precio_dolares, 
        stock: raw.stock || raw.existencias || raw.Existencias, 
      };

      setProduct(productoActualizado); 
      setShowModal(false);
      alert("Producto actualizado correctamente");

    } catch (err) {
      console.error(err);
      setUpdateError(err.message);
    }
  };

  const handleDeleteProduct = async () => {
      try {
          const response = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${token}` }
          });
          
          if(response.ok) {
              navigate("/perfil"); 
          } else {
              alert("No se pudo eliminar el producto");
          }
      } catch (e) {
          console.error(e);
          alert("Error de conexión al eliminar");
      }
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
        
        {/* Header del Emprendimiento */}
        {emprendimiento && (
          <div className="mb-8">
            <ProductHeader
              nombre={emprendimiento.nombre}
              numero={emprendimiento.telefono}
              imagen={emprendimiento.imagen_url}
              instagram={emprendimiento.instagram}
            />
          </div>
        )}

        {/* Tarjeta del Producto */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            {/* Imagen */}
            <div className="md:w-1/2">
              <img
                src={product.imagen || "https://via.placeholder.com/400?text=Sin+Imagen"}
                alt={product.nombre}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=Sin+Imagen"; }}
              />
            </div>

            {/* Información */}
            <div className="md:w-1/2 p-6 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                {product.nombre}
              </h1>

              <p className="text-3xl font-bold text-green-900 mb-4">
                ${product.precio}
              </p>

              <div className="mb-4">
                <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                  {product.categoria}
                </span>
              </div>

              {product.descripcion && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Descripción</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.descripcion}
                  </p>
                </div>
              )}

              {product.stock !== undefined && (
                <p className="text-sm text-gray-500 mb-4">
                  Stock disponible: <span className="font-semibold">{product.stock}</span>
                </p>
              )}

              {/* --- BOTONES CONDICIONALES --- */}
              <div className="space-y-3 mt-6">
                
                {esDueno ? (
                  /* VISTA PARA EL DUEÑO */
                  <button
                    onClick={() => setShowModal(true)} 
                    className="w-full bg-green-900 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar producto
                  </button>
                ) : (
                  /* VISTA PARA CLIENTE */
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

                    {emprendimiento?.correo && (
                      <a
                        href={`mailto:${emprendimiento.correo}?subject=Consulta sobre ${product.nombre}`}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-colors text-center block font-medium shadow-sm"
                      >
                        Enviar Email
                      </a>
                    )}
                  </>
                )}
                
              </div>
            </div>
          </div>
        </div>

        {/* Carrusel */}
        {product.id_emprendimiento && (
          <Carousel
            title={`Más productos de ${product.nombre_emprendimiento}`}
            subtitle={`Descubre otros artículos de ${product.nombre_emprendimiento}`}
            endpoint={`/api/products?emprendimiento_id=${product.id_emprendimiento}`}
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
      />

    </div>
  );
}
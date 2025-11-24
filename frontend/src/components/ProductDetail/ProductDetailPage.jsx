import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Carousel from "../Carousel";
import ProductHeader from "./ProductHeader";
import { API_BASE_URL } from "../../utils/api";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Obtener el producto
        const productRes = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!productRes.ok) throw new Error("No se pudo obtener el producto");
        const productData = await productRes.json();
        const producto = productData.producto;
        console.log("📦 Datos del producto:", producto); // DEBUG
        setProduct(producto);

        // 2. Obtener el emprendimiento usando el id_emprendimiento del producto
        if (producto.id_emprendimiento) {
          const emprendimientoRes = await fetch(
            `${API_BASE_URL}/api/entrepreneurship/${producto.id_emprendimiento}`
          );
          if (emprendimientoRes.ok) {
            const emprendimientoData = await emprendimientoRes.json();
            setEmprendimiento(emprendimientoData);
            console.log("Datos del emprendimiento:", emprendimientoData);
            console.log("✅ Respuesta API emprendimiento:", emprendimientoData);
            console.log("📸 URL de imagen:", emprendimientoData.imagen_url); // Para debug
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
        {/* ProductHeader - Se muestra solo si hay datos del emprendimiento */}
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

        {/* Información del Producto */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            {/* Imagen del producto */}
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

            {/* Info del producto */}
            <div className="md:w-1/2 p-6">
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
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Descripción
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.descripcion}
                  </p>
                </div>
              )}

              {product.stock !== undefined && (
                <p className="text-sm text-gray-500 mb-4">
                  Stock disponible:{" "}
                  <span className="font-semibold">{product.stock}</span>
                </p>
              )}

              {/* Botones de contacto */}
              <div className="space-y-3 mt-6">
                {emprendimiento?.telefono && (
                  <a
                    href={`https://wa.me/502${emprendimiento.telefono}?text=Hola! Me interesa el producto: ${product.nombre}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl transition-colors text-center block font-medium"
                  >
                    💬 Contactar por WhatsApp
                  </a>
                )}

                {emprendimiento?.correo && (
                  <a
                    href={`mailto:${emprendimiento.correo}?subject=Consulta sobre ${product.nombre}`}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl transition-colors text-center block font-medium"
                  >
                    📧 Enviar Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carrusel de productos relacionados */}
        {product.id_emprendimiento && (
          <Carousel
            title={`Más productos de ${product.nombre_emprendimiento}`}
            subtitle={`Descubre otros artículos de ${product.nombre_emprendimiento}`}
            endpoint={`/api/products?emprendimiento_id=${product.id_emprendimiento}`}
          />
        )}
      </div>
    </div>
  );
}

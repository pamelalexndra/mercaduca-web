import React, { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import ArrowButton from "./ArrowButton";
import { API_BASE_URL } from "../utils/api";

function SkeletonCards({ count = 5 }) {
  return (
    <>
      {Array(count)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="snap-start shrink-0 w-44 sm:w-48 md:w-52">
            <img
              src="/assets/loaders/skeleton-card.svg"
              alt=""
              className="w-full rounded-xl"
              aria-hidden="true"
            />
          </div>
        ))}
    </>
  );
}

// Función para enriquecer un producto con sus datos completos
const enrichProduct = async (producto) => {
  // Si ya tiene los campos necesarios, devolverlo directamente
  if (
    producto.id_categoria !== undefined &&
    producto.id_emprendimiento !== undefined
  ) {
    return producto;
  }

  // Si no tiene precio, no es un producto (es emprendimiento)
  if (!producto.precio && producto.precio !== 0) {
    return producto;
  }

  // Hacer fetch del detalle del producto
  try {
    const productId = producto.id || producto.id_producto;
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);

    if (response.ok) {
      const data = await response.json();
      const detalle = data.producto || data;

      return {
        ...producto,
        id_categoria: detalle.id_categoria || producto.id_categoria,
        id_emprendimiento:
          detalle.id_emprendimiento || producto.id_emprendimiento,
        categoria: detalle.categoria || producto.categoria,
      };
    }
  } catch (err) {
    console.error(`Error enriching product ${producto.id}:`, err);
  }

  return producto;
};

// Función para enriquecer múltiples productos en paralelo
const enrichProducts = async (productos) => {
  // Solo enriquecer productos (los que tienen precio)
  const productosEnriquecidos = await Promise.all(
    productos.map(async (item) => {
      // Si tiene precio, es un producto
      if (item.precio !== undefined || item.precio === 0) {
        return await enrichProduct(item);
      }
      return item;
    }),
  );

  return productosEnriquecidos;
};

export default function Carousel({
  title,
  subtitle,
  endpoint,
  items: staticItems,
  variant = "default",
}) {
  const scrollerRef = useRef(null);

  const [items, setItems] = useState(staticItems || []);
  const [loading, setLoading] = useState(!!endpoint);
  const [error, setError] = useState(null);

  // Estados de cupones
  const [cuponesProducto, setCuponesProducto] = useState([]);
  const [cuponesCategoria, setCuponesCategoria] = useState([]);
  const [cuponesEmp, setCuponesEmp] = useState([]);
  const [cuponesLoaded, setCuponesLoaded] = useState(false);

  // FETCH PRODUCTOS
  useEffect(() => {
    if (!endpoint) return;

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}${endpoint}`;
        const res = await fetch(url);

        if (!res.ok) throw new Error("No se pudieron cargar los elementos");

        const data = await res.json();

        let itemsData =
          data.productos || data.emprendimientos || data.items || [];

        if (!Array.isArray(itemsData) || itemsData.length === 0) {
          throw new Error("No hay elementos para mostrar");
        }

        // Enriquecer productos (solo si es endpoint de productos)
        if (endpoint.includes("/products")) {
          itemsData = await enrichProducts(itemsData);
        }

        setItems(itemsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [endpoint]);

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

  // Busca cupón en orden: Producto > Categoría > Emprendimiento
  const getCouponForProduct = (producto) => {
    if (!cuponesLoaded) return null;

    // Si no tiene precio, no es un producto
    if (producto.precio === undefined && producto.precio !== 0) return null;

    // 1. Buscar cupón específico del producto
    const porProducto = cuponesProducto.find(
      (c) =>
        String(c.id_producto) === String(producto.id || producto.id_producto),
    );

    if (porProducto) return porProducto;

    // 2. Buscar cupón por categoría
    const porCategoria = cuponesCategoria.find(
      (c) => String(c.id_categoria) === String(producto.id_categoria),
    );

    if (porCategoria) return porCategoria;

    // 3. Buscar cupón por emprendimiento
    const porEmprendimiento = cuponesEmp.find(
      (c) => String(c.id_emprendimiento) === String(producto.id_emprendimiento),
    );

    return porEmprendimiento || null;
  };

  const scrollBy = (delta) => {
    scrollerRef.current?.scrollBy({
      left: delta,
      behavior: "smooth",
    });
  };

  // ERROR STATE
  if (error) {
    return (
      <section className="mb-14">
        <div className="mx-auto max-w-6xl px-6 text-center py-10">
          <img
            src="/assets/loaders/owl-empty-state.svg"
            alt="Sin resultados"
            className="w-24 mx-auto mb-3 opacity-60"
          />
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
      </section>
    );
  }

  // Para emprendimientos (no tienen precio, no mostrar descuentos)
  if (endpoint && endpoint.includes("/entrepreneurship")) {
    return (
      <section className="mb-14">
        <div className="mx-auto max-w-6xl px-6">
          <h3 className="text-xl font-loubag font-bold text-center">{title}</h3>

          <p className="mt-1 text-center text-sm text-zinc-500 font-poppins">
            {subtitle}
          </p>

          <div className="relative mt-6 pb-12 font-montserrat">
            <div
              ref={scrollerRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
            >
              {loading ? (
                <SkeletonCards count={5} />
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="snap-start shrink-0 w-44 sm:w-48 md:w-52"
                  >
                    <ProductCard p={item} activeCoupon={null} />
                  </div>
                ))
              )}
            </div>

            <div className="absolute -bottom-[10px] right-[8px] flex gap-3 items-center">
              <ArrowButton onClick={() => scrollBy(-300)} dir="prev" />
              <ArrowButton onClick={() => scrollBy(300)} dir="next" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // PRODUCTOS (con descuentos)
  if (endpoint) {
    return (
      <section className="mb-14">
        <div className="mx-auto max-w-6xl px-6">
          <h3 className="text-xl font-loubag font-bold text-center">{title}</h3>

          <p className="mt-1 text-center text-sm text-zinc-500 font-poppins">
            {subtitle}
          </p>

          <div className="relative mt-6 pb-12 font-montserrat">
            <div
              ref={scrollerRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
            >
              {loading ? (
                <SkeletonCards count={5} />
              ) : (
                items.map((p) => {
                  const coupon = getCouponForProduct(p);
                  return (
                    <div
                      key={p.id}
                      className="snap-start shrink-0 w-44 sm:w-48 md:w-52"
                    >
                      <ProductCard p={p} activeCoupon={coupon} />
                    </div>
                  );
                })
              )}
            </div>

            <div className="absolute -bottom-[10px] right-[8px] flex gap-3 items-center">
              <ArrowButton onClick={() => scrollBy(-300)} dir="prev" />
              <ArrowButton onClick={() => scrollBy(300)} dir="next" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
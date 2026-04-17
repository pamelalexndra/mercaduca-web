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
          <div
            key={`skeleton-${i}`}
            className="snap-start shrink-0 w-44 sm:w-48 md:w-52"
          >
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
  if (
    producto.id_categoria !== undefined &&
    producto.id_emprendimiento !== undefined
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
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimatingRef = useRef(false);
  const activeIndexRef = useRef(0);

  // Estados de cupones (solo para productos)
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

  const scrollBy = (delta) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  const goToIndex = (index, smooth = true) => {
    const el = scrollerRef.current;
    if (!el || isAnimatingRef.current) return;

    const target = Math.max(0, Math.min(index, items.length - 1));
    activeIndexRef.current = target;
    setActiveIndex(target);

    const start = el.scrollLeft;
    const end = target * el.clientWidth;
    const duration = 900;
    const startTime = performance.now();

    isAnimatingRef.current = true;

    const animate = (time) => {
      const t = Math.min((time - startTime) / duration, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      el.scrollLeft = start + (end - start) * eased;
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimatingRef.current = false;
      }
    };

    requestAnimationFrame(animate);
  };

  const handlePrev = () => {
    const newIndex =
      activeIndexRef.current === 0
        ? items.length - 1
        : activeIndexRef.current - 1;
    goToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (activeIndexRef.current + 1) % items.length;
    goToIndex(newIndex);
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

  // ============ EMPRENDIMIENTOS ============
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
                    <ProductCard
                      p={item}
                      activeCoupon={null}
                      showPrice={false}
                    />
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

  // ============ PRODUCTOS ============
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
                      key={p.id || p.id_producto}
                      className="snap-start shrink-0 w-44 sm:w-48 md:w-52"
                    >
                      <ProductCard
                        p={p}
                        activeCoupon={coupon}
                        showPrice={true}
                      />
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

  // ============ ACTIVIDADES (Banners) ============
  const containerClasses = "text-white rounded-3xl py-6 sm:py-8 px-3 sm:px-8";
  const imageContainerClasses =
    "aspect-[5/4] sm:aspect-[16/10] lg:aspect-[16/9]";

  useEffect(() => {
    if (!staticItems) return;
    let timeoutId;
    let nextIndex = 1;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        if (isAnimatingRef.current) {
          scheduleNext();
          return;
        }
        goToIndex(nextIndex);
        nextIndex = (nextIndex + 1) % items.length;
        scheduleNext();
      }, 4500);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [items.length, staticItems]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full transition-all duration-500 ease-in-out ${containerClasses}`}
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#557051",
      }}
    >
      {title && (
        <h3 className="text-xl font-loubag font-bold text-center mb-2">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="mb-4 text-center text-sm text-white/80 font-poppins">
          {subtitle}
        </p>
      )}

      <div
        ref={scrollerRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar w-full"
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="snap-start shrink-0 w-full flex flex-col justify-center items-center text-center px-2 sm:px-4"
          >
            <div
              className={`relative flex items-center justify-center w-full rounded-xl overflow-hidden ${imageContainerClasses}`}
              style={{
                height: "clamp(250px, 28vw, 420px)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
              }}
            >
              <img
                src={item.image}
                alt={`slide-${i}`}
                loading="eager"
                decoding="sync"
                fetchpriority="high"
                className="object-contain w-full h-full transition-transform duration-700 ease-in-out hover:scale-[1.03] will-change-transform select-none pointer-events-none bg-[#557051]"
                style={{ borderRadius: "1rem" }}
              />
            </div>
            {item.text && (
              <p className="mt-4 text-sm sm:text-base lg:text-lg font-montserrat p-2 text-center text-white/90">
                {item.text}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-white border border-[#2b201b]/20 w-10 h-10 rounded-full transform transition-transform duration-200 hover:scale-110"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2b201b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-white border border-[#2b201b]/20 w-10 h-10 rounded-full transform transition-transform duration-200 hover:scale-110"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2b201b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="flex justify-center mt-4 space-x-3">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goToIndex(i)}
            className={`h-3 w-3 rounded-full border transition-all duration-300 ${
              i === activeIndex
                ? "bg-[#2b201b] border-[#2b201b] scale-125"
                : "bg-white border-white opacity-70 hover:opacity-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
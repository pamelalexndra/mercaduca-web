import React, { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import ArrowButton from "./ArrowButton";

export default function Carousel({ title, subtitle, endpoint }) {
  const scrollerRef = useRef(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const scrollBy = (delta) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  useEffect(() => {
    if (!endpoint) return;
    const fetchItems = async () => {
      try {
        setError(null);
        const url = `${import.meta.env.VITE_API_URL}${endpoint}`;
        console.log("📡 Fetching desde:", url); // <-- agrega esto
        const res = await fetch(url);
        if (!res.ok) throw new Error("No se pudieron cargar los elementos");
        const data = await res.json();
        const productos = data.productos || [];
        if (!Array.isArray(productos) || productos.length === 0) {
          throw new Error("No hay productos para mostrar");
        }
        setItems(productos);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchItems();
  }, [endpoint]);

  if (error) return <div>Error: {error}</div>;
  if (!items.length)
    return <div className="text-center text-zinc-500">Cargando...</div>;

  return (
    <section className="mb-12">
      <div className="mx-auto max-w-6xl px-6">
        <h3 className="text-xl font-loubag font-bold text-center">{title}</h3>
        <p className="mt-1 text-center text-sm text-zinc-500 font-poppins">
          {subtitle}
        </p>

        <div className="relative mt-6 font-montserrat">
          <div
            ref={scrollerRef}
            className="
              flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory 
              pb-2 no-scrollbar
            "
          >
            {items.map((p) => (
              <div
                key={p.id}
                className="snap-start shrink-0 w-44 sm:w-48 md:w-52"
              >
                <ProductCard p={p} />
              </div>
            ))}
          </div>

          <div className="absolute right-2 botton-2 flex gap-2 md:mt-2">
            <ArrowButton onClick={() => scrollBy(-300)} dir="prev" />
            <ArrowButton onClick={() => scrollBy(300)} dir="next" />
          </div>
        </div>
      </div>
    </section>
  );
}
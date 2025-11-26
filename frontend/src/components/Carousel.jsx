import React, { useEffect, useRef, useState } from "react";
import ProductCard from "./Card";
import ArrowButton from "./ArrowButton";
import { API_BASE_URL } from "../utils/api";

export default function Carousel({
  title,
  subtitle,
  endpoint,
  items: staticItems,
  variant = "default",
}) {
  const scrollerRef = useRef(null);
  const [items, setItems] = useState(staticItems || []);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimatingRef = useRef(false);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    if (!endpoint) return;

    const fetchItems = async () => {
      try {
        setError(null);
        const url = `${API_BASE_URL}${endpoint}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("No se pudieron cargar los elementos");

        const data = await res.json();

        const itemsData =
          data.productos || data.emprendimientos || data.items || [];

        if (!Array.isArray(itemsData) || itemsData.length === 0) {
          throw new Error("No hay elementos para mostrar");
        }

        setItems(itemsData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchItems();
  }, [endpoint]);

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

  if (error) return <div>Error: {error}</div>;
  if (!items.length)
    return <div className="text-center text-zinc-500">Cargando...</div>;
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
              {items.map((p) => (
                <div
                  key={p.id}
                  className="snap-start shrink-0 w-44 sm:w-48 md:w-52"
                >
                  <ProductCard p={p} />
                </div>
              ))}
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

  const containerClasses =
    variant === "activities"
      ? "text-white rounded-3xl py-6 sm:py-8 px-3 sm:px-8"
      : "text-white rounded-3xl py-6 sm:py-8 px-3 sm:px-8";

  const imageContainerClasses =
    variant === "activities"
      ? "aspect-[5/4] sm:aspect-[16/10] lg:aspect-[16/9]"
      : "aspect-[16/9]";
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
              className={`relative flex items-center justify-center 
              w-full rounded-xl overflow-hidden ${imageContainerClasses}`}
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
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10
        flex items-center justify-center bg-white border border-[#2b201b]/20
        w-10 h-10 rounded-full transform transition-transform duration-200 hover:scale-110"
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
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10
        flex items-center justify-center bg-white border border-[#2b201b]/20
        w-10 h-10 rounded-full transform transition-transform duration-200 hover:scale-110"
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

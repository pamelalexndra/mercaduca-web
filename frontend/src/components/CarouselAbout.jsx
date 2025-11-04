import React, { useRef, useState, useEffect } from "react";
import ArrowButton from "./ArrowButton";

export default function CarouselAbout({ items, variant = "default" }) {
  const scrollerRef = useRef(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    items.forEach((item) => {
      const img = new Image();
      img.src = item.image;
      img.loading = "eager";
      img.decoding = "async";
    });
  }, [items]);

  useEffect(() => {
    const next = (activeIndexRef.current + 1) % items.length;
    const img = new Image();
    img.src = items[next].image;
  }, [activeIndex]);

  const goToIndex = (index, smooth = true) => {
    const el = scrollerRef.current;
    if (!el || isAnimatingRef.current) return;
    const target = Math.max(0, Math.min(index, items.length - 1));
    activeIndexRef.current = target;
    setActiveIndex(target);

    const start = el.scrollLeft;
    const end = target * el.clientWidth;

    if (!smooth) {
      el.scrollLeft = end;
      return;
    }

    isAnimatingRef.current = true;
    const duration = 600;
    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
      el.scrollLeft = start + (end - start) * eased;
      if (progress < 1) requestAnimationFrame(animate);
      else isAnimatingRef.current = false;
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

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (isAnimatingRef.current) return;
      const index = Math.round(el.scrollLeft / el.clientWidth);
      activeIndexRef.current = index;
      setActiveIndex(index);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAnimatingRef.current) return;
      const next = (activeIndexRef.current + 1) % items.length;
      goToIndex(next);
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);
  const containerClasses =
    variant === "activities"
      ? "bg-[#557051] text-white rounded-3xl shadow-md py-4 sm:py-6 lg:py-8 px-2 sm:px-6 lg:px-10"
      : "bg-transparent";

  const imageContainerClasses =
    variant === "activities"
      ? "bg-[#ffffff]/15 backdrop-blur-sm aspect-[5/4] sm:aspect-[16/10] lg:aspect-[16/9]"
      : "bg-[#557051]/15 backdrop-blur-sm aspect-[16/9]";

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full transition-all duration-500 ease-in-out ${containerClasses}`}
      style={{
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <div
        ref={scrollerRef}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar w-full will-change-transform"
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="snap-start shrink-0 w-full flex flex-col justify-center items-center text-center px-2 sm:px-4"
          >
            <div
              className={`relative flex items-center justify-center 
                           w-full rounded-xl overflow-hidden shadow-lg transition-all duration-500 ease-in-out ${imageContainerClasses}`}
              style={{
                height: "clamp(250px, 28vw, 420px)",
              }}
            >
              <img
                src={item.image}
                alt={`slide-${i}`}
                loading="eager"
                decoding="async"
                className="max-h-full max-w-full object-contain transition-transform duration-700 ease-in-out hover:scale-[1.03]"
              />
            </div>

            {item.text && (
              <p
                className={`mt-4 text-sm sm:text-base lg:text-lg font-montserrat p-2 text-center ${
                  variant === "activities" ? "text-white/90" : "text-[#000]/80"
                }`}
              >
                {item.text}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="absolute inset-y-0 left-2 sm:left-4 flex items-center justify-center z-10">
        <button
          onClick={handlePrev}
          className="flex items-center justify-center bg-white text-[#2b201b] rounded-full p-2 sm:p-3 shadow-md hover:scale-110 transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <div className="absolute inset-y-0 right-2 sm:right-4 flex items-center justify-center z-10">
        <button
          onClick={handleNext}
          className="flex items-center justify-center bg-white text-[#2b201b] rounded-full p-2 sm:p-3 shadow-md hover:scale-110 transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div className="flex justify-center mt-4 space-x-3">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goToIndex(i)}
            className={`h-3 w-3 rounded-full border transition-all duration-300 ${
              i === activeIndex
                ? variant === "activities"
                  ? "bg-[#2b201b] border-[#2b201b] scale-125"
                  : "bg-black border-black scale-125"
                : "bg-white border-white opacity-70 hover:opacity-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

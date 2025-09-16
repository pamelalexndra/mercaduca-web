import React, { useRef } from "react";
import ProductCard from "./ProductCard";
import ArrowButton from "./ArrowButton";

export default function Carousel({ title, subtitle, items }) {
  const scrollerRef = useRef(null);

  const scrollBy = (delta) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-6">
        <h3 className="text-xl font-loubag font-bold text-center">{title}</h3>
        <p className="mt-1 text-center text-sm text-zinc-500 font-poppins">{subtitle}</p>
        <div className="relative mt-6 font-montserrat">
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
          >
            {items.map((p) => (
              <div key={p.id} className="snap-start shrink-0 w-56">
                <ProductCard p={p} />
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-white via-transparent to-white" />
            <div className="absolute inset-y-0 left-2 flex items-center">
              <ArrowButton onClick={() => scrollBy(-320)} dir="prev" />
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center">
              <ArrowButton onClick={() => scrollBy(320)} dir="next" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

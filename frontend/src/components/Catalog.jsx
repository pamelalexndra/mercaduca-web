import React, { useRef } from "react";
import { 
  Utensils, 
  Cookie, 
  Gem, 
  Drum, 
  Shirt, 
  Crown, 
  Droplet, 
  Bike, 
  Brush, 
  Palette, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"; 

import SearchBox from "./SearchBox";
import ProductCard from "./ProductCard";

export default function Catalog({ ALL_PRODUCTS, onGoHome, inline = false }) {
  const scrollRef = useRef(null);

  const categories = [
    { name: "Alimentos", icon: <Utensils size={20} /> },
    { name: "Snacks", icon: <Cookie size={20} /> },
    { name: "Joyería y Accesorios", icon: <Gem size={20} /> },
    { name: "Juguetes", icon: <Drum size={20} /> },
    { name: "Ropa", icon: <Shirt size={20} /> },
    { name: "Coleccionables", icon: <Crown size={20} /> },
    { name: "Skincare", icon: <Droplet size={20} /> },
    { name: "Deportivos", icon: <Bike size={20} /> },
    { name: "Cosméticos", icon: <Brush size={20} /> },
    { name: "Decorativos", icon: <Palette size={20} /> },
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-3xl font-bold text-center font-loubag">Catálogo</h2>
        <div className="mt-4">
          <SearchBox />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {ALL_PRODUCTS.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        {!inline && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <button className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 transition">
              Ver más
            </button>
            <button onClick={onGoHome} className="text-sm text-zinc-600 hover:text-zinc-800">
              Regresar a Inicio
            </button>
          </div>
        )}
      </section>
    </>
  );
}
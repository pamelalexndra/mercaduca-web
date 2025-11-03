import React, { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function SearchBox({ placeholder = "Search" }) {
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = [
    "Productos de belleza",
    "Snacks",
    "Coleccionables",
    "Productos deportivos",
    "Papelería",
    "Skincare",
    "Accesorios",
  ];

  return (
    <div className="relative mx-auto w-full max-w-xs sm:max-w-md font-montserrat">
      <div
        className="
          flex items-center rounded-full border border-zinc-300 bg-white
          px-3 py-2 shadow-sm
        "
      >
        <Search className="text-zinc-500 size-4 mr-2" />
        <input
          type="search"
          placeholder={placeholder}
          className="
            flex-1 bg-transparent text-sm text-zinc-700 
            placeholder:text-zinc-400 outline-none
          "
        />
        <button
          type="button"
          onClick={() => setFilterOpen(!filterOpen)}
          className={`
            p-2 rounded-full transition-colors
            ${filterOpen ? "bg-[#557051] text-white" : "text-[#557051] hover:bg-zinc-100"}
          `}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {filterOpen && (
        <>
          {/* Overlay que cubre toda la pantalla y cierra al hacer clic */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setFilterOpen(false)}
          />

          {/* Panel del filtro */}
          <div
            className="
              absolute left-1/2 -translate-x-1/2 w-[90vw] sm:w-[70vw]
              mt-3 rounded-2xl border border-zinc-200 bg-[#FAFAF9] 
              shadow-lg p-4 flex flex-wrap gap-2 justify-center 
              animate-fadeIn z-40
            "
            onClick={(e) => e.stopPropagation()} // evita que se cierre al hacer clic dentro del panel
          >
            <button
              onClick={() => setFilterOpen(false)}
              className="absolute top-3 right-4 p-1 rounded-md text-[#557051] hover:bg-zinc-200 transition"
            >
              <X size={18} />
            </button>

            {categories.map((cat, i) => (
              <button
                key={i}
                className="
                  px-3 py-1.5 text-[12px] rounded-full border border-zinc-300 
                  text-zinc-700 bg-white hover:bg-[#557051] hover:text-white
                  transition
                "
              >
                {cat}
              </button>
            ))}

            <button
              className="
                w-7 h-7 flex items-center justify-center text-xl 
                rounded-full border border-zinc-300 text-[#557051]
                hover:bg-[#557051] hover:text-white transition
              "
            > 
              +
          </button>
        </div>
        </>
      )}
    </div>
  );
}

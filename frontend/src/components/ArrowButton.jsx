import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ArrowButton({ onClick, dir }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      className="
        flex items-center justify-center
        rounded-full border border-[#507051]
        bg-white text-[#557051]
        w-10 h-10            /*  tamaño ligeramente mayor */
        hover:bg-[#557051] hover:text-white
        transition-colors duration-200
      "
      aria-label={dir === "prev" ? "Anterior" : "Siguiente"}
    >
      <Icon className="w-4.5 h-4.5" />
    </button>
  );
}

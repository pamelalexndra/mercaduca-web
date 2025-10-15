import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ArrowButton({ onClick, dir }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button //hacer que desplazen al mantener presionado
      onClick={onClick}
      className="
        rounded-full bg-[F4F4F2] p-2
        border border-[#507051] text-[#557051]
        hover:bg-[#557051] hover:text-white
        "
      aria-label={dir === "prev" ? "Anterior" : "Siguiente"}
    >
      <Icon className="size-5" />
    </button>
  );
}

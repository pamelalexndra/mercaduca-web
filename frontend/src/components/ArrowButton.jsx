import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ArrowButton({ onClick, dir }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 -translate-y-1/2 p-2 rounded-full border bg-white shadow-sm hover:bg-zinc-50"
      aria-label={dir === "prev" ? "Anterior" : "Siguiente"}
    >
      <Icon className="size-5" />
    </button>
  );
}

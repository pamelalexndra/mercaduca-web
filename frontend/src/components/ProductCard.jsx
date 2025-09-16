import React from "react";

export default function ProductCard({ p }) {
  return (
    <div className="group rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden font-montserrat hover:shadow-md transition">
      <div className="aspect-square bg-zinc-200 flex items-center justify-center text-zinc-400 text-sm">
        Imagen
      </div>
      <div className="p-3 text-xs text-zinc-500">{p.category}</div>
      <div className="px-3 pb-3">
        <div className=" text-sm font-medium text-zinc-800 line-clamp-2">{p.name}</div>
        <div className="mt-2 flex items-center gap-2">
          <button className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-xs">{p.price}</button>
          <button className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-xs">Detalles</button>
        </div>
      </div>
    </div>
  );
}

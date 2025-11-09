import React from "react";
import { Link } from "react-router-dom";
import productPlaceholder from "../images/productPlaceholder.jpg";

export default function ProductCard({ p }) {
  return (
    <Link to={`/detalle/${p.id}`}>
      <div
        className="
        group rounded-xl border border-zinc-200 
        bg-white shadow-sm overflow-hidden font-montserrat 
        hover:shadow-md transition
      "
      >
        <div className="w-full aspect-[4/3] overflow-hidden">
          <img
            src={p.imagen || productPlaceholder}
            alt={p.nombre || "Producto"}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-3 pt-5 font-montserrat text-[12px]">
          <h3 className="flex items-center justify-between font-semibold text-zinc-900 leading-tight">
            <span>{p.nombre || "Nombre del producto"}</span>
            <span className="font-semibold text-[#557051] text-sm">
              ${p.precio || "0.00"}
            </span>
          </h3>
        </div>
      </div>
    </Link>
  );
}
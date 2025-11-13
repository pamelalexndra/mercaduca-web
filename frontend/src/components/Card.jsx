import React from "react";
import { Link } from "react-router-dom";
import productPlaceholder from "../images/productPlaceholder.jpg";

export default function Card({ e, p }) {
  const data = e || p;
  const isProduct = !!data.precio;

  const image = data.imagen || productPlaceholder;
  const name = data.nombre || (isProduct ? "Producto" : "Emprendimiento");
  const price = data.precio;
  const link = isProduct
    ? `/detalle/${data.id}`
    : `/emprendimiento/${data.id}`;

  return (
    <Link to={link}>
      <div
        className="
        group rounded-xl border border-zinc-200 
        bg-white shadow-sm overflow-hidden font-montserrat 
        hover:shadow-md transition
      "
      >
        {/* Imagen */}
        <div className="w-full aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        </div>

        {/* Contenido */}
        <div className="p-3 pt-5 font-montserrat text-[12px]">
          <h3
            className={`${isProduct
                ? "flex items-center justify-between"
                : "text-center truncate"
              } font-semibold text-zinc-900 leading-tight`}
          >
            <span>{name}</span>
            {isProduct && (
              <span className="font-semibold text-[#557051] text-sm">
                ${price || "0.00"}
              </span>
            )}
          </h3>
        </div>
      </div>
    </Link>
  );
}
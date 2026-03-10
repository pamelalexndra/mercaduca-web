import React from "react";
import { Link } from "react-router-dom";
import productPlaceholder from "../images/productPlaceholder.jpg";

export default function ProductCard({ p, activeCoupon }) {
  // Verificamos si hay un cupón válido con un descuento mayor a 0
  const hasDiscount = activeCoupon && activeCoupon.descuento > 0;
  
  const originalPrice = parseFloat(p.precio) || 0;
  const discountAmount = hasDiscount ? parseFloat(activeCoupon.descuento) : 0;
  
  // Calculamos el precio final (asegurándonos de que no baje de $0)
  const finalPrice = Math.max(0, originalPrice - discountAmount).toFixed(2);

  return (
    <Link to={`/detalle/${p.id || p.id_producto}`}>
      <div
        className="
        group relative rounded-xl border border-zinc-200 
        bg-white shadow-sm overflow-hidden font-montserrat 
        hover:shadow-md transition
      "
      >
        {/* Badge flotante de Oferta */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 shadow-sm uppercase tracking-wide">
            Oferta
          </div>
        )}

        <div className="w-full aspect-[4/3] overflow-hidden">
          <img
            src={p.imagen || productPlaceholder}
            alt={p.nombre || "Producto"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        <div className="p-3 pt-4 font-montserrat flex flex-col gap-1.5">
          <h3 className="font-semibold text-zinc-900 text-[13px] leading-tight line-clamp-2">
            {p.nombre || "Nombre del producto"}
          </h3>
          
          <div className="mt-1 flex items-center">
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-gray-400 line-through text-[11px] font-medium">
                  ${originalPrice.toFixed(2)}
                </span>
                <span className="font-bold text-red-600 text-[14px]">
                  ${finalPrice}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-[#557051] text-[14px]">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
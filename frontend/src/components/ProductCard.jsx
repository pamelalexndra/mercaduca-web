import React from "react";
import { Link } from "react-router-dom";
import productPlaceholder from "../images/productPlaceholder.jpg";
import DiscountBadge from "./ProductDetail/DiscountBadge";

export default function ProductCard({ p, activeCoupon }) {
  // Determinar si tiene descuento
  const hasDiscount = activeCoupon && activeCoupon.descuento > 0;
  const discountPercent = activeCoupon?.descuento || 0;

  const originalPrice = parseFloat(p.precio) || 0;
  const finalPrice = hasDiscount
    ? (originalPrice * (1 - discountPercent / 100)).toFixed(2)
    : originalPrice.toFixed(2);

  return (
    <Link to={`/detalle/${p.id || p.id_producto}`}>
      <div className="group relative rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden font-montserrat hover:shadow-md transition">
        {/* Etiqueta de descuento usando DiscountBadge */}
        {hasDiscount && (
          <DiscountBadge
            percent={discountPercent}
            position="left"
            variant="rebaja"
            size="md"
          />
        )}

        <div className="w-full aspect-[4/3] overflow-hidden">
          <img
            src={p.imagen || productPlaceholder}
            alt={p.nombre || "Producto"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.src = productPlaceholder;
            }}
          />
        </div>

        <div className="p-3 pt-4 font-montserrat flex flex-col gap-1.5">
          <h3 className="font-semibold text-zinc-900 text-[13px] leading-tight line-clamp-2">
            {p.nombre || "Nombre del producto"}
          </h3>

          <div className="mt-1 flex items-center">
            {hasDiscount ? (
              <div className="flex items-baseline gap-2 flex-wrap">
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
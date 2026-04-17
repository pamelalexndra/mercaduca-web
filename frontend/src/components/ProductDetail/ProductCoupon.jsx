import React from "react";
import { TicketPercent } from "lucide-react";

export default function ProductCoupon({ cupon, isAdmin }) {
  if (!cupon) {
    return null;
  }

  let mensaje = "Ahorra en productos de esta tienda";
  if (cupon.id_producto) {
    mensaje = "Ahorra en este producto";
  } else if (cupon.id_categoria) {
    mensaje = "Ahorra en productos de esta categoría";
  }

  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 font-montserrat">
      <div className="flex items-start gap-3">
        <div className="text-red-600 mt-1">
          <TicketPercent size={20} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-red-600">
            DESCUENTO APLICADO
          </p>

          <p className="text-xs text-zinc-700 mt-1">
            {mensaje}{" "}
            <span className="font-bold text-red-600 text-sm">
              {cupon.descuento || cupon.Descuento}% OFF
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}
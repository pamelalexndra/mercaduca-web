import React from "react";
import { TicketPercent } from "lucide-react";

export default function ProductCoupon({ cupon, isAdmin, applied, onApply }) {
  if (!cupon) {
    if (isAdmin) return null;
    return (
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-2 font-montserrat">
        <TicketPercent size={16} className="text-gray-400 shrink-0" />
        <p className="text-xs text-gray-400">
          Cupón no disponible en este producto
        </p>
      </div>
    );
  }

  let mensaje = "Ahorra en productos de esta tienda";
  if (cupon.id_producto) {
    mensaje = "Ahorra en este producto";
  } else if (cupon.id_categoria) {
    mensaje = "Ahorra en productos de esta categoría";
  }

  return (
    <div className="mt-4 rounded-xl border border-[#557051]/20 bg-[#557051]/5 p-4 font-montserrat">
      <div className="flex items-start gap-3">
        <div className="text-[#557051] mt-1">
          <TicketPercent size={20} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-[#557051]">
            Cupón disponible
          </p>

          <p className="text-xs text-zinc-600 mt-1">
            {mensaje}{" "}
            <span className="font-semibold">
              {cupon.descuento || cupon.Descuento}%
            </span>
          </p>
          {!isAdmin &&
            (applied ? (
              <p className="mt-3 text-xs font-semibold text-[#557051]">
                ✓ Descuento aplicado
              </p>
            ) : (
              <button
                onClick={onApply}
                className="mt-3 text-xs font-semibold bg-[#557051] text-white px-4 py-1.5 rounded-lg hover:opacity-90 transition"
              >
                Aplicar descuento
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

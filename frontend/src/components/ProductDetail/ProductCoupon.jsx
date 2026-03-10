import React from "react";
import { TicketPercent } from "lucide-react";

export default function ProductCoupon() {
  return (
    <div
      className="
      mt-4 rounded-xl border border-[#557051]/20 
      bg-[#557051]/5 p-4 font-montserrat
      "
    >
      <div className="flex items-start gap-3">
        <div className="text-[#557051] mt-1">
          <TicketPercent size={20} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-[#557051]">
            Cupón disponible
          </p>

          <p className="text-xs text-zinc-600 mt-1">
            Ahorra <span className="font-semibold">50%</span> en productos de
            esta categoría
          </p>

          <button
            className="
            mt-3 text-xs font-semibold 
            bg-[#557051] text-white 
            px-4 py-1.5 rounded-lg 
            hover:opacity-90 transition
            "
          >
            Aplicar cupón
          </button>
        </div>
      </div>
    </div>
  );
}
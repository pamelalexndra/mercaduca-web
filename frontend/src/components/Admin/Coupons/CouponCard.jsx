import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import productPlaceholder from "../../../images/productPlaceholder.jpg";

export default function CouponCard({ cupon }) {
  const [tiempoRestante, setTiempoRestante] = useState("");

  const calcularTiempoRestante = (fechaLimite) => {
    if (!fechaLimite) return "Sin fecha límite";

    const limite = new Date(fechaLimite);
    const ahora = new Date();

    if (limite <= ahora) return "Expirado";

    const diff = limite - ahora;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    if (dias > 0) {
      return `${dias}D ${horas}H ${minutos}M ${segundos}S`;
    } else {
      return `${horas}H ${minutos}M ${segundos}S`;
    }
  };

  useEffect(() => {
    const actualizarTiempo = () => {
      setTiempoRestante(calcularTiempoRestante(cupon.fecha_limite));
    };

    actualizarTiempo();
    const intervalo = setInterval(actualizarTiempo, 1000);

    return () => clearInterval(intervalo);
  }, [cupon.fecha_limite]);

  return (
    <Link to={`/cupones/detalle/${cupon.id_cupon}`}>
      <div className="group relative rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden font-montserrat hover:shadow-md transition">
        <div className="w-full aspect-[4/3] overflow-hidden">
          <img
            src={cupon.imagen_url || productPlaceholder}
            alt={cupon.nombre || "Cupón"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        <div className="p-4 font-montserrat flex flex-col gap-2">
          <h3 className="font-semibold text-zinc-900 text-base leading-tight line-clamp-2">
            {cupon.nombre || "Nombre del cupón"}
          </h3>

          <div className="flex items-center justify-between mt-1">
            <strong>
              <span className="text-sm text-gray-500">
                {cupon.descuento > 0
                  ? `${parseFloat(cupon.descuento).toFixed(0)}% OFF`
                  : "0% OFF"}
              </span>
            </strong>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
            <Clock size={14} className="text-[#557051]" />
            <span className="font-medium">{tiempoRestante}</span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/cupones/detalle/${cupon.id_cupon}`;
            }}
            className="mt-3 w-full bg-[#557051] text-white py-2.5 rounded-lg hover:bg-[#455a42] transition-colors font-semibold text-sm"
          >
            Ver cupón
          </button>
        </div>
      </div>
    </Link>
  );
}

import CouponsTab from "./CouponsTab";
import React, { useState } from "react";
import CouponModal from "./CouponsModal";
import { PlusCircle } from "lucide-react";

export default function CouponsPage() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-cream font-montserrat text-gray-800 min-h-screen p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="bg-white rounded-3xl shadow-xl p-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-poppins text-3xl text-[#557051] font-bold">
                Gestión de cupones
              </h1>
              <p className="font-montserrat text-gray-500 mt-1">
                Administra los descuentos y promociones de{" "}
                <strong>MercadUCA</strong>
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-[#557051] text-white px-6 py-3 rounded-xl hover:opacity-90 transition flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Crear cupón
            </button>
          </div>
        </header>

        <section className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-loubag text-xl text-[#557051]">
              Cupones registrados
            </h2>
          </div>

          <CouponsTab />
          {isOpen && <CouponModal onClose={() => setIsOpen(false)} />}
        </section>
      </div>
    </div>
  );
}

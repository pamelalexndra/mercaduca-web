import React, { useState, useEffect } from "react";
import { PlusCircle, ChevronDown } from "lucide-react";
import CouponCard from "./CouponCard";
import CouponsForm from "./CouponsForm";
import SuccessDialog from "../../SuccessDialog";
import { API_BASE_URL } from "../../../utils/api.js";

export default function CouponManagement() {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCupon, setSelectedCupon] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState("todos");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filterOptions = [
    { value: "todos", label: "Todos los cupones" },
    { value: "disponibles", label: "Cupones disponibles" },
    { value: "expirados", label: "Cupones expirados" },
  ];

  const getFilterLabel = () => {
    const option = filterOptions.find((opt) => opt.value === filter);
    return option ? option.label : "Todos los cupones";
  };

  const loadCupones = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/cupones`;

      if (filter === "disponibles") {
        url += "?solo_disponibles=true";
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.cupones && Array.isArray(result.cupones)) {
        let filteredCupones = result.cupones;
        if (filter === "expirados") {
          const ahora = new Date();
          filteredCupones = result.cupones.filter((cupon) => {
            if (!cupon.fecha_limite) return false;
            return new Date(cupon.fecha_limite) <= ahora;
          });
        }
        setCupones(filteredCupones);
      } else {
        console.error("La respuesta no tiene el formato esperado:", result);
        setCupones([]);
      }
    } catch (error) {
      console.error("Error cargando cupones:", error);
      setCupones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCupones();
  }, [filter]);

  const handleAddCupon = () => {
    setSelectedCupon(null);
    setShowForm(true);
  };

  const handleFormSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setShowForm(false);
    setSelectedCupon(null);
    loadCupones();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedCupon(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".filter-dropdown")) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="bg-cream font-montserrat text-gray-800 min-h-screen p-4 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 lg:space-y-10">
        <header className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 lg:p-10">
          <div className="hidden lg:flex justify-between items-center">
            <div className="flex-1">
              <h1 className="font-poppins text-2xl lg:text-3xl text-[#557051] font-bold">
                Gestión de cupones
              </h1>
              <p className="font-montserrat text-gray-500 mt-1">
                Administra los descuentos y promociones de{" "}
                <strong>MercadUCA</strong>
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddCupon}
                className="bg-[#557051] text-white font-medium py-2.5 px-6 rounded-lg hover:bg-[#455a42] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle size={20} />
                Crear cupón
              </button>
            </div>
          </div>

          <div className="lg:hidden">
            <div className="text-center md:text-left">
              <h1 className="font-poppins text-xl md:text-2xl text-[#557051] font-bold">
                Gestión de cupones
              </h1>
              <p className="font-montserrat text-gray-500 mt-1 text-sm md:text-base">
                Administra los descuentos y promociones de{" "}
                <strong>MercadUCA</strong>
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <button
                onClick={handleAddCupon}
                className="w-full bg-[#557051] text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:bg-[#455a42] transition-transform active:scale-95 flex items-center gap-2 justify-center"
              >
                <PlusCircle size={20} />
                Crear cupón
              </button>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="font-loubag text-lg md:text-xl text-[#557051]">
              Cupones registrados
            </h2>

            {/* Filtro desplegable */}
            <div className="relative filter-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterDropdown(!showFilterDropdown);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
              >
                {getFilterLabel()}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showFilterDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilter(option.value);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                        filter === option.value
                          ? "bg-[#557051] text-white hover:bg-[#455a42]"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#557051]"></div>
            </div>
          ) : cupones.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No hay cupones registrados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {cupones.map((cupon) => (
                <CouponCard key={cupon.id_cupon} cupon={cupon} />
              ))}
            </div>
          )}
        </section>
      </div>

      {showForm && (
        <CouponsForm
          cupon={selectedCupon}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      <SuccessDialog
        show={showSuccess}
        message={successMessage}
        onConfirm={() => setShowSuccess(false)}
      />
    </div>
  );
}
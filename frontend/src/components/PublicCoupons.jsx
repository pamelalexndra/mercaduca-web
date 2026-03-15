import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, Percent } from "lucide-react";
import CouponCard from "./Admin/Coupons/CouponCard";
import SearchBox from "./SearchBox/SearchBox.jsx";
import { API_BASE_URL } from "../utils/api.js";

export default function PublicCoupons({ onGoHome }) {
  const [cupones, setCupones] = useState([]);
  const [filteredCupones, setFilteredCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCouponsCount, setVisibleCouponsCount] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadCupones = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/cupones?solo_disponibles=true`,
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.cupones && Array.isArray(result.cupones)) {
        setCupones(result.cupones);
        setFilteredCupones(result.cupones);
      } else {
        console.error("La respuesta no tiene el formato esperado:", result);
        setCupones([]);
        setFilteredCupones([]);
      }
    } catch (error) {
      console.error("Error cargando cupones:", error);
      setError(error.message || "Error al cargar los cupones");
      setCupones([]);
      setFilteredCupones([]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    loadCupones();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCupones(cupones);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = cupones.filter(
        (cupon) =>
          cupon.nombre?.toLowerCase().includes(term) ||
          cupon.descripcion?.toLowerCase().includes(term),
      );
      setFilteredCupones(filtered);
    }
    setVisibleCouponsCount(20);
  }, [searchTerm, cupones]);

  const handleSearch = (search) => {
    setSearchTerm(search);
  };

  const handleLoadMore = () => {
    setVisibleCouponsCount((prevCount) => prevCount + 20);
  };

  const handleGoHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (onGoHome) onGoHome();
  };

  const visibleCoupons = filteredCupones.slice(0, visibleCouponsCount);

  if (loading && isInitialLoad) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-8 min-h-[50vh] flex flex-col items-center justify-center">
        <img
          src="/assets/loaders/owl-loader-mercaduca.svg"
          alt="Cargando cupones"
          className="w-36"
        />
        <p className="mt-4 text-[#557051] font-medium">Cargando cupones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-8 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={loadCupones}
          className="px-4 py-2 bg-[#557051] text-white rounded-lg hover:bg-[#445b41] transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-3xl font-bold text-center font-loubag mb-8 text-zinc-800">
          Cupones
        </h2>

        <div className="flex flex-col items-start">
          <div className="md:hidden relative w-full flex items-center justify-center mb-6">
            <div className="w-full max-w-sm">
              <SearchBox
                onSearch={handleSearch}
                initialSearchTerm={searchTerm}
                showFilterButton={false}
                placeholder="Buscar cupones..."
                className="w-full"
              />
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="hidden md:flex relative items-center justify-center mb-6 h-12">
              <div className="w-full max-w-md">
                <SearchBox
                  onSearch={handleSearch}
                  initialSearchTerm={searchTerm}
                  showFilterButton={false}
                  placeholder="Buscar cupones..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {loading && !isInitialLoad
                ? Array(8)
                    .fill()
                    .map((_, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden animate-pulse"
                      >
                        <div className="w-full aspect-[4/3] bg-zinc-200" />
                        <div className="p-4">
                          <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-zinc-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))
                : visibleCoupons.map((cupon) => (
                    <CouponCard key={cupon.id_cupon} cupon={cupon} />
                  ))}
            </div>

            {filteredCupones.length === 0 && !loading && (
              <div className="text-center py-16 text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                <Percent size={48} className="mx-auto text-zinc-300 mb-4" />
                <p className="mb-2">No se encontraron cupones disponibles</p>
                <p className="text-sm text-zinc-400">
                  {searchTerm
                    ? "Prueba con otro término de búsqueda"
                    : "Vuelve pronto para nuevas ofertas"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 text-[#557051] hover:underline"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}

            <div className="mt-10 flex flex-col items-center gap-4">
              {visibleCoupons.length < filteredCupones.length && (
                <button
                  onClick={handleLoadMore}
                  className="rounded-xl border border-zinc-300 px-6 py-2.5 text-sm font-medium hover:bg-zinc-100 transition"
                >
                  Ver más cupones
                </button>
              )}

              <button
                onClick={handleGoHome}
                className="text-sm text-zinc-600 hover:text-zinc-800"
              >
                Regresar a inicio
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

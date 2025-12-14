import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "./Card";
import SearchBox from "./SearchBox/SearchBox.jsx";
import FilterPanel from "./FilterPanel";
import SuccessDialog from "./SuccessDialog";
import useEntrepreneurships from "../hooks/useEntrepreneurships";
import useCategories from "../hooks/useCategories";
import { Filter } from "lucide-react";

export default function Emprendedores({ onGoHome }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { entrepreneurships, loading, error, fetchEntrepreneurships } = useEntrepreneurships();
  const { categories } = useCategories(true);

  // Filter & Search State
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");

  // UI State
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initialize from URL
  useEffect(() => {
    if (!isInitialLoad) return;

    const urlSearch = searchParams.get("search") || "";
    const urlCategories = searchParams.get("categories");
    const urlSort = searchParams.get("sort") || "";

    const categoryArray = urlCategories
      ? urlCategories
        .split(",")
        .map((id) => parseInt(id, 10))
        .filter((n) => !Number.isNaN(n))
      : [];

    setSearchTerm(urlSearch);
    setSelectedCategories(categoryArray);
    setSortOption(urlSort);

    // Initial fetch
    fetchEntrepreneurships(categoryArray, urlSearch, { sort: urlSort });

    setIsInitialLoad(false);
  }, [searchParams, isInitialLoad, fetchEntrepreneurships]);


  const updateFilters = (newCategories, newSearch, newSort) => {
    // 1. Update State
    if (newCategories !== undefined) setSelectedCategories(newCategories);
    if (newSearch !== undefined) setSearchTerm(newSearch);
    if (newSort !== undefined) setSortOption(newSort);

    // Prepare values
    const cats = newCategories !== undefined ? newCategories : selectedCategories;
    const search = newSearch !== undefined ? newSearch : searchTerm;
    const sort = newSort !== undefined ? newSort : sortOption;

    // 2. Update URL
    const newSearchParams = new URLSearchParams(searchParams);

    if (cats.length > 0) newSearchParams.set("categories", cats.join(","));
    else newSearchParams.delete("categories");

    if (search) newSearchParams.set("search", search);
    else newSearchParams.delete("search");

    if (sort) newSearchParams.set("sort", sort);
    else newSearchParams.delete("sort");

    setSearchParams(newSearchParams);

    // 3. Fetch
    fetchEntrepreneurships(cats, search, { sort: sort });
  };

  const handleCategoryChange = (ids) => updateFilters(ids, undefined, undefined);
  const handleSortChange = (sort) => updateFilters(undefined, undefined, sort);
  const handleSearch = (search) => updateFilters(undefined, search, undefined);

  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  const handleGoHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (onGoHome) {
      onGoHome();
    }
  };

  if (loading && isInitialLoad) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-8 text-center min-h-[50vh] flex items-center justify-center">
        <div className="text-lg text-zinc-500">Cargando catálogo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-8 text-center">
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#557051] text-white rounded-lg hover:bg-[#445b41]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <h2 className="text-3xl font-bold text-center font-loubag mb-8 text-zinc-800">
          Emprendimientos
        </h2>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Mobile Filter Button */}
          <div className="md:hidden relative w-full flex items-center justify-center mb-6">
            <div className="w-full max-w-sm">
              <SearchBox
                onSearch={handleSearch}
                initialSearchTerm={searchTerm}
                showFilterButton={false}
                className="w-full"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="absolute right-0 p-2 border border-zinc-200 rounded-lg bg-white text-zinc-700 hover:bg-zinc-50 shadow-sm"
            >
              <Filter size={24} />
            </button>
          </div>

          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block w-64 flex-shrink-0 sticky top-4">
            <FilterPanel
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              sortOption={sortOption}
              onSortChange={handleSortChange}
              showPriceFilter={false}
              onClear={() => updateFilters([], "", "")}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1 w-full">
            {/* Desktop Search Box */}
            <div className="hidden md:block mb-6">
              <SearchBox
                onSearch={handleSearch}
                initialSearchTerm={searchTerm}
                showFilterButton={false}
                placeholder="Buscar emprendimientos..."
              />
            </div>

            {/* Results Summary */}
            {(selectedCategories.length > 0 || searchTerm) && (
              <div className="mb-4 text-sm text-zinc-500">
                Encontrados {entrepreneurships.length} emprendimientos
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {entrepreneurships.map((p) => (
                <Card key={p.id} p={p} />
              ))}
            </div>

            {entrepreneurships.length === 0 && !loading && (
              <div className="text-center py-16 text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                <p>No se encontraron emprendimientos con los filtros seleccionados.</p>
                <div className="mt-4">
                  <button
                    onClick={() => updateFilters([], "", "")}
                    className="text-[#557051] hover:underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-col items-center gap-4">
              <button
                onClick={handleGoHome}
                className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 transition text-zinc-600"
              >
                Regresar a Inicio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[110] flex bg-black/50 md:hidden">
          <div className="relative w-[80%] max-w-sm bg-white shadow-xl p-4 overflow-y-auto animate-slideInLeft mt-[56px] sm:mt-[64px] h-[calc(100%-56px)] sm:h-[calc(100%-64px)] rounded-tr-2xl rounded-br-2xl">
            <FilterPanel
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              sortOption={sortOption}
              onSortChange={handleSortChange}
              showPriceFilter={false}
              onClear={() => updateFilters([], "", "")}
              onClose={() => setShowMobileFilters(false)}
            />
            <div className="mt-6 pt-4 border-t border-zinc-100">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-[#557051] text-white rounded-xl font-medium hover:bg-[#445b41]"
              >
                Ver resultados ({entrepreneurships.length})
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowMobileFilters(false)} />
        </div>
      )}

      <SuccessDialog
        show={showSuccess}
        message={successMessage}
        onConfirm={handleSuccessClose}
      />
    </>
  );
}

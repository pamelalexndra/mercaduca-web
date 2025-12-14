import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBox from "./SearchBox/SearchBox.jsx";
import ProductCard from "./Card";
import FilterPanel from "./FilterPanel";
import useProducts from "../hooks/useProducts";
import useCategories from "../hooks/useCategories";
import { Filter } from "lucide-react";

export default function Catalog({ onGoHome }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filteredProducts, loading, error, fetchProducts } = useProducts();
  const { categories } = useCategories(true);

  // Filter & Search State
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortOption, setSortOption] = useState("");

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [visibleProductsCount, setVisibleProductsCount] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initialize from URL
  useEffect(() => {
    if (!isInitialLoad) return;

    const urlSearch = searchParams.get("search") || "";
    const urlCategories = searchParams.get("categories");
    const urlMin = searchParams.get("min") || "";
    const urlMax = searchParams.get("max") || "";
    const urlSort = searchParams.get("sort") || "";

    const categoryArray = urlCategories
      ? urlCategories
        .split(",")
        .map((id) => parseInt(id, 10))
        .filter((n) => !Number.isNaN(n))
      : [];

    setSearchTerm(urlSearch);
    setSelectedCategories(categoryArray);
    setPriceRange({ min: urlMin, max: urlMax });
    setSortOption(urlSort);

    // Initial fetch
    fetchProducts(categoryArray, urlSearch, {
      min: urlMin,
      max: urlMax,
      sort: urlSort,
    });

    setIsInitialLoad(false);
  }, [searchParams, isInitialLoad, fetchProducts]);

  // Effect to handle refetches when filters change (after initial load)
  // We'll duplicate the logic in handlers to update URL, but we can also use useEffect to react to URL changes if we want true deep linking responsiveness.
  // For simplicity and to avoid loops, I will follow the pattern of updating URL -> Component State logic or vice versa.
  // The existing pattern was: Handler -> State Update -> URL Update -> Fetch. I'll stick to that.

  useEffect(() => {
    setVisibleProductsCount(20);
  }, [selectedCategories, searchTerm, priceRange, sortOption]);

  const updateFilters = (newCategories, newSearch, newPrice, newSort) => {
    // 1. Update State
    if (newCategories !== undefined) setSelectedCategories(newCategories);
    if (newSearch !== undefined) setSearchTerm(newSearch);
    if (newPrice !== undefined) setPriceRange(newPrice);
    if (newSort !== undefined) setSortOption(newSort);

    // Prepare values for URL and Fetch
    const cats = newCategories !== undefined ? newCategories : selectedCategories;
    const search = newSearch !== undefined ? newSearch : searchTerm;
    const price = newPrice !== undefined ? newPrice : priceRange;
    const sort = newSort !== undefined ? newSort : sortOption;

    // 2. Update URL
    const newSearchParams = new URLSearchParams(searchParams);

    if (cats.length > 0) newSearchParams.set("categories", cats.join(","));
    else newSearchParams.delete("categories");

    if (search) newSearchParams.set("search", search);
    else newSearchParams.delete("search");

    if (price.min) newSearchParams.set("min", price.min);
    else newSearchParams.delete("min");

    if (price.max) newSearchParams.set("max", price.max);
    else newSearchParams.delete("max");

    if (sort) newSearchParams.set("sort", sort);
    else newSearchParams.delete("sort");

    setSearchParams(newSearchParams);

    // 3. Fetch
    fetchProducts(cats, search, {
      min: price.min,
      max: price.max,
      sort: sort,
    });
  };

  const handleCategoryChange = (ids) => updateFilters(ids, undefined, undefined, undefined);
  const handlePriceChange = (range) => updateFilters(undefined, undefined, range, undefined);
  const handleSortChange = (sort) => updateFilters(undefined, undefined, undefined, sort);
  const handleSearch = (search) => updateFilters(undefined, search, undefined, undefined);

  const handleLoadMore = () => {
    setVisibleProductsCount((prevCount) => prevCount + 20);
  };

  const handleGoHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (onGoHome) onGoHome();
  };

  const visibleProducts = filteredProducts.slice(0, visibleProductsCount);

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
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-3xl font-bold text-center font-loubag mb-8 text-zinc-800">Catálogo</h2>

        <div className="flex flex-col items-start">
          {/* Mobile Filter Button (Legacy mobile view kept if needed, or unified) */}
          {/* We are unifying. The top SearchBox section below will handle desktop.
              For mobile, we still need the stack. */}
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
              onClick={() => setShowFilters(true)}
              className="absolute right-0 p-2 border border-zinc-200 rounded-lg bg-white text-zinc-700 hover:bg-zinc-50 shadow-sm"
            >
              <Filter size={24} />
            </button>
          </div>



          {/* Main Content */}
          <div className="flex-1 w-full">
            {/* Desktop Header: Search + Filter Button */}
            {/* Desktop Header: Search + Filter Button */}
            <div className="hidden md:flex relative items-center justify-center mb-6 h-12">
              <button
                onClick={() => setShowFilters(true)}
                className="absolute left-0 flex items-center gap-2 px-4 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-700 hover:bg-zinc-50 font-medium transition-colors shadow-sm"
              >
                <Filter size={20} />
                Filtros
              </button>

              <div className="w-full max-w-md">
                <SearchBox
                  onSearch={handleSearch}
                  initialSearchTerm={searchTerm}
                  showFilterButton={false}
                  placeholder="Buscar productos..."
                />
              </div>
            </div>

            {/* Applied Filters Summary */}
            {(selectedCategories.length > 0 || searchTerm || priceRange.min || priceRange.max || sortOption) && (
              <div className="mb-4 text-sm text-zinc-500">
                Encontrados {filteredProducts.length} productos
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {visibleProducts.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-16 text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                <p>No se encontraron productos con los filtros seleccionados.</p>
                <div className="mt-4">
                  <button
                    onClick={() => updateFilters([], "", { min: "", max: "" }, "")}
                    className="text-[#557051] hover:underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-col items-center gap-4">
              {visibleProducts.length < filteredProducts.length && (
                <button
                  onClick={handleLoadMore}
                  className="rounded-xl border border-zinc-300 px-6 py-2.5 text-sm font-medium hover:bg-zinc-100 transition"
                >
                  Ver más productos
                </button>
              )}

              <button
                onClick={handleGoHome}
                className="text-sm text-zinc-600 hover:text-zinc-800"
              >
                Regresar a Inicio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Drawer (Unified) */}
      {showFilters && (
        <div className="fixed inset-0 z-[110] flex bg-black/50">
          <div className="relative w-[80%] max-w-sm bg-white shadow-xl p-4 overflow-y-auto animate-slideInLeft mt-[56px] sm:mt-[64px] h-[calc(100%-56px)] sm:h-[calc(100%-64px)] rounded-tr-2xl rounded-br-2xl">
            <FilterPanel
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              sortOption={sortOption}
              onSortChange={handleSortChange}
              showPriceFilter={true}
              onClear={() => updateFilters([], "", { min: "", max: "" }, "")}
              onClose={() => setShowFilters(false)}
            />
            <div className="mt-6 pt-4 border-t border-zinc-100">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3 bg-[#557051] text-white rounded-xl font-medium hover:bg-[#445b41]"
              >
                Ver resultados ({filteredProducts.length})
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowFilters(false)} />
        </div>
      )}
    </>
  );
}
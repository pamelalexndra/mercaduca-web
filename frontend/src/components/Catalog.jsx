import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter } from "lucide-react";
import SearchBox from "./SearchBox/SearchBox.jsx";
import ProductCard from "./ProductCard.jsx";
import FilterPanel from "./FilterPanel";
import useProducts from "../hooks/useProducts";
import useCategories from "../hooks/useCategories";
import { API_BASE_URL } from "../utils/api";

export default function Catalog({ onGoHome }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filteredProducts, loading, error, fetchProducts } = useProducts();
  const { categories } = useCategories(true);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortOption, setSortOption] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [visibleProductsCount, setVisibleProductsCount] = useState(20);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Estados de cupones
  const [cuponesProducto, setCuponesProducto] = useState([]);
  const [cuponesCategoria, setCuponesCategoria] = useState([]);
  const [cuponesEmp, setCuponesEmp] = useState([]);
  const [cuponesLoaded, setCuponesLoaded] = useState(false);

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

    fetchProducts(categoryArray, urlSearch, {
      min: urlMin,
      max: urlMax,
      sort: urlSort,
    });

    setIsInitialLoad(false);
  }, [searchParams, isInitialLoad, fetchProducts]);

  // FETCH CUPONES
  useEffect(() => {
    const fetchCupones = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/cupones?solo_disponibles=true`,
        );
        if (!res.ok) return;

        const data = await res.json();
        const cupones = data.cupones || [];

        const productos = cupones.filter((c) => c.id_producto);
        const categorias = cupones.filter(
          (c) => c.id_categoria && !c.id_producto,
        );
        const emprendimientos = cupones.filter(
          (c) => c.id_emprendimiento && !c.id_producto && !c.id_categoria,
        );

        setCuponesProducto(productos);
        setCuponesCategoria(categorias);
        setCuponesEmp(emprendimientos);
        setCuponesLoaded(true);
      } catch (err) {
        console.error("Error cargando cupones:", err);
      }
    };

    fetchCupones();
  }, []);

  // FUNCION para obtener cupón de un producto
  const getCouponForProduct = (producto) => {
    if (!cuponesLoaded) return null;

    // 1. Buscar cupón específico del producto
    const porProducto = cuponesProducto.find(
      (c) =>
        String(c.id_producto) === String(producto.id || producto.id_producto),
    );

    if (porProducto) return porProducto;

    // 2. Buscar cupón por categoría
    const porCategoria = cuponesCategoria.find(
      (c) => String(c.id_categoria) === String(producto.id_categoria),
    );

    if (porCategoria) return porCategoria;

    // 3. Buscar cupón por emprendimiento
    const porEmprendimiento = cuponesEmp.find(
      (c) => String(c.id_emprendimiento) === String(producto.id_emprendimiento),
    );

    return porEmprendimiento || null;
  };

  useEffect(() => {
    setVisibleProductsCount(20);
  }, [selectedCategories, searchTerm, priceRange, sortOption]);

  const updateFilters = (newCategories, newSearch, newPrice, newSort) => {
    if (newCategories !== undefined) setSelectedCategories(newCategories);
    if (newSearch !== undefined) setSearchTerm(newSearch);
    if (newPrice !== undefined) setPriceRange(newPrice);
    if (newSort !== undefined) setSortOption(newSort);

    const cats =
      newCategories !== undefined ? newCategories : selectedCategories;
    const search = newSearch !== undefined ? newSearch : searchTerm;
    const price = newPrice !== undefined ? newPrice : priceRange;
    const sort = newSort !== undefined ? newSort : sortOption;

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

    fetchProducts(cats, search, {
      min: price.min,
      max: price.max,
      sort: sort,
    });
  };

  const handleCategoryChange = (ids) =>
    updateFilters(ids, undefined, undefined, undefined);
  const handlePriceChange = (range) =>
    updateFilters(undefined, undefined, range, undefined);
  const handleSortChange = (sort) =>
    updateFilters(undefined, undefined, undefined, sort);
  const handleSearch = (search) =>
    updateFilters(undefined, search, undefined, undefined);

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
      <div className="container mx-auto max-w-7xl px-6 py-8 min-h-[50vh] flex items-center justify-center">
        <img
          src="/assets/loaders/owl-loader-mercaduca.svg"
          alt="Cargando catálogo"
          className="w-36"
        />
        <p className="mt-4 text-[#557051] font-medium">Cargando catálogo...</p>
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
        <h2 className="text-3xl font-bold text-center font-loubag mb-8 text-zinc-800">
          Catálogo
        </h2>

        <div className="flex flex-col items-start">
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

          <div className="flex-1 w-full">
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

            {(selectedCategories.length > 0 ||
              searchTerm ||
              priceRange.min ||
              priceRange.max ||
              sortOption) && (
              <div className="mb-4 text-sm text-zinc-500">
                Encontrados {filteredProducts.length} productos
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {loading && !isInitialLoad
                ? Array(8)
                    .fill()
                    .map((_, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden animate-pulse"
                      >
                        <div className="w-full aspect-[4/3] bg-zinc-200" />

                        <div className="p-3 pt-5 text-[12px]">
                          <div className="flex items-center justify-between">
                            <div className="h-3 bg-zinc-200 rounded w-2/3" />
                            <div className="h-3 bg-zinc-200 rounded w-1/4" />
                          </div>
                        </div>
                      </div>
                    ))
                : visibleProducts.map((p) => {
                    const coupon = getCouponForProduct(p);
                    return (
                      <ProductCard key={p.id} p={p} activeCoupon={coupon} />
                    );
                  })}
            </div>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-16 text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                <p>
                  No se encontraron productos con los filtros seleccionados.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() =>
                      updateFilters([], "", { min: "", max: "" }, "")
                    }
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
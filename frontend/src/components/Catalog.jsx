import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBox from "./SearchBox/SearchBox.jsx";
import ProductCard from "./ProductCard";

export default function Catalog({ onGoHome }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchProducts = async (categoryIds = [], search = "") => {
    try {
      setError(null);

      let url = "http://localhost:5000/api/productos";
      const params = [];

      if (categoryIds.length > 0) params.push(`ids=${categoryIds.join(",")}`);
      if (search && search.trim() !== "") params.push(`search=${encodeURIComponent(search.trim())}`);
      if (params.length) url += `?${params.join("&")}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar productos");

      const data = await response.json();
      const productos = data.productos || [];

      if (categoryIds.length === 0 && !search) setAllProducts(productos);
      setFilteredProducts(productos);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlCategories = searchParams.get("categories");

    if (isInitialLoad) {
      if (urlSearch) setSearchTerm(urlSearch);

      if (urlCategories) {
        const categoryArray = urlCategories
          .split(",")
          .map((id) => parseInt(id, 10))
          .filter((n) => !Number.isNaN(n));

        setSelectedCategories(categoryArray);

        if (categoryArray.length > 0 || urlSearch) {
          fetchProducts(categoryArray, urlSearch || "");
        } else {
          fetchProducts();
        }
      } else if (urlSearch) {
        fetchProducts([], urlSearch);
      } else {
        fetchProducts();
      }

      setIsInitialLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isInitialLoad]);

  const handleCategoryFilter = (categoryIds) => {
    setSelectedCategories(categoryIds);

    const newSearchParams = new URLSearchParams(searchParams);
    if (categoryIds.length > 0) newSearchParams.set("categories", categoryIds.join(","));
    else newSearchParams.delete("categories");
    setSearchParams(newSearchParams);

    if (categoryIds.length === 0 && !searchTerm) {
      if (allProducts.length > 0) setFilteredProducts(allProducts);
      else fetchProducts();
      return;
    }

    fetchProducts(categoryIds, searchTerm);
  };

  const handleSearch = (search) => {
    setSearchTerm(search);

    const newSearchParams = new URLSearchParams(searchParams);
    if (search) newSearchParams.set("search", search);
    else newSearchParams.delete("search");
    setSearchParams(newSearchParams);

    if (search === "" && selectedCategories.length === 0) {
      if (allProducts.length > 0) setFilteredProducts(allProducts);
      else fetchProducts();
      return;
    }

    fetchProducts(selectedCategories, search);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-6 py-8 text-center">
        <div className="text-lg">Cargando catálogo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-6 py-8 text-center">
        <div className="text-red-500">Error: {error}</div>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-3xl font-bold text-center font-loubag">Catálogo</h2>
        <div className="mt-4">
          <SearchBox
            onCategoryFilter={handleCategoryFilter}
            onSearch={handleSearch}
            initialSelectedCategories={selectedCategories}
            initialSearchTerm={searchTerm}
          />
        </div>

        {(selectedCategories.length > 0 || searchTerm) && (
          <div className="mt-4 text-center text-sm text-zinc-600">
            {searchTerm && `Búsqueda: "${searchTerm}"`}
            {searchTerm && selectedCategories.length > 0 && " • "}
            {selectedCategories.length > 0 && `Filtrado por ${selectedCategories.length} categoría(s)`}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-8 text-zinc-500">No se encontraron productos</div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <button className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 transition">
            Ver más
          </button>
          <button onClick={onGoHome} className="text-sm text-zinc-600 hover:text-zinc-800">
            Regresar a Inicio
          </button>
        </div>
      </section>
    </>
  );
}

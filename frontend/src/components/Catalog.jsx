import React, { useMemo, useEffect, useState, useRef } from "react";
import SearchBox from "./SearchBox";
import ProductCard from "./Card";

export default function Catalog({ ALL_PRODUCTS, onGoHome, inline = false }) {
  const grid = useMemo(() => ALL_PRODUCTS, [ALL_PRODUCTS]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  // Obtener productos con filtros
  const fetchProducts = async (categoryIds = [], search = "") => {
    try {
      setError(null);

      let url = "http://localhost:5000/api/productos";
      const params = [];

      // Si hay categorías seleccionadas, las añadimos como parámetro
      if (categoryIds.length > 0) {
        const idsParam = categoryIds.join(",");
        params.push(`ids=${idsParam}`);
      }

      // Si hay un termino de busqueda, lo añadimos
      if (search && search.trim() !== "") {
        params.push(`search=${encodeURIComponent(search.trim())}`);
      }

      url += "?" + params.join("&");

      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar productos");

      const data = await response.json();

      if (categoryIds.length === 0 && !search) {
        setAllProducts(data.productos || []);
      }
      setFilteredProducts(data.productos || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Manejar filtrado por categorías
  const handleCategoryFilter = (categoryIds) => {
    setSelectedCategories(categoryIds);

    if (categoryIds.length === 0 && !searchTerm) {
      setFilteredProducts(allProducts);
    } else {
      fetchProducts(categoryIds, searchTerm);
    }
  };

  // Manejar filtrado por búsqueda
  const handleSearch = (search) => {
    setSearchTerm(search);

    if (search === "" && selectedCategories.length === 0) {
      setFilteredProducts(allProducts);
    } else {
      fetchProducts(selectedCategories, search);
    }
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
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
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
          />
        </div>

        {/* Mostrar categorías seleccionadas */}
        {(selectedCategories.length > 0 || searchTerm) && (
          <div className="mt-4 text-center text-sm text-zinc-600">
            Filtrado por {selectedCategories.length} categoría(s)
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
          <div className="text-center py-8 text-zinc-500">
            No se encontraron productos
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <button className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 transition">
            Ver más
          </button>
          <button
            onClick={onGoHome}
            className="text-sm text-zinc-600 hover:text-zinc-800"
          >
            Regresar a Inicio
          </button>
        </div>
      </section>
    </>
  );
}

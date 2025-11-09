import React, { useMemo, useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBox from "./SearchBox/SearchBox.jsx";
import ProductCard from "./ProductCard";

export default function Catalog({ ALL_PRODUCTS, onGoHome, inline = false }) {
  const grid = useMemo(() => ALL_PRODUCTS, [ALL_PRODUCTS]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  // ✅ SOLUCIÓN: Manejar la carga inicial y parámetros de URL en un solo efecto
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCategories = searchParams.get('categories');

    // Si es la carga inicial y hay parámetros en la URL, usarlos
    if (isInitialLoad) {
      if (urlSearch) {
        setSearchTerm(urlSearch);
      }

      if (urlCategories) {
        const categoryArray = urlCategories.split(',').map(id => parseInt(id));
        setSelectedCategories(categoryArray);

        // Si hay categorías en la URL, hacer fetch con esos filtros
        if (categoryArray.length > 0 || urlSearch) {
          fetchProducts(categoryArray, urlSearch || "");
        } else {
          // Si no hay filtros en la URL, cargar todos los productos
          fetchProducts();
        }
      } else if (urlSearch) {
        // Si solo hay búsqueda en la URL
        fetchProducts([], urlSearch);
      } else {
        // Si no hay parámetros en la URL, cargar todos los productos
        fetchProducts();
      }

      setIsInitialLoad(false);
    }
  }, [searchParams, isInitialLoad]);

  // Manejar filtrado por categorías
  const handleCategoryFilter = (categoryIds) => {
    setSelectedCategories(categoryIds);

    const newSearchParams = new URLSearchParams(searchParams);
    if (categoryIds.length > 0) {
      newSearchParams.set('categories', categoryIds.join(','));
    } else {
      newSearchParams.delete('categories');
    }
    setSearchParams(newSearchParams);

    if (categoryIds.length === 0 && !searchTerm) {
      setFilteredProducts(allProducts);
    } else {
      fetchProducts(categoryIds, searchTerm);
    }
    // ✅ Si NO hay categorías ni búsqueda → obtener todos los productos
    if (categoryIds.length === 0 && !searchTerm) {
      fetchProducts(); // <-- ESTA ES LA CLAVE
    } else {
      fetchProducts(categoryIds, searchTerm);
    }
  };

  // Manejar filtrado por búsqueda
  const handleSearch = (search) => {
    setSearchTerm(search);

    const newSearchParams = new URLSearchParams(searchParams);
    if (search) {
      newSearchParams.set('search', search);
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams);

    if (search === "" && selectedCategories.length === 0) {
      setFilteredProducts(allProducts);
    } else {
      fetchProducts(selectedCategories, search);
    }
    // ✅ Si NO hay búsqueda ni categorías → obtener todos los productos
    if (search === "" && selectedCategories.length === 0) {
      fetchProducts(); // <-- Y ESTA ES LA OTRA CLAVE
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
            // ✅ NUEVAS PROPS: Pasar el estado actual al SearchBox
            initialSelectedCategories={selectedCategories}
            initialSearchTerm={searchTerm}
          />
        </div>

        {/* Mostrar categorías seleccionadas */}
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
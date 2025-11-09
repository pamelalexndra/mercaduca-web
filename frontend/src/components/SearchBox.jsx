import React, { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function SearchBox({
  placeholder = "Search",
  onCategoryFilter,
  onSearch,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(7);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null); // Timer para el debounce

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:5000/api/categorias");

        if (!response.ok) {
          throw new Error("Error al cargar categorías");
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message);
        setCategories(["Sin categorías disponibles"]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleShowMore = () => {
    if (visibleCount === 7) {
      setVisibleCount(visibleCount + 7); // Mostrar 14 (primeras 7 + siguientes 7)
    } else if (visibleCount === 14) {
      setVisibleCount(visibleCount + 7); // Mostrar 21 (todas las que tienes)
    }
  };

  const handleShowLess = () => {
    setVisibleCount(visibleCount - 7); // Volver a mostrar solo 7
  };

  const visibleCategories = categories.slice(0, visibleCount);
  const hasMoreCategories = visibleCount < categories.length;
  const isShowingMoreThan7 = visibleCount > 7;

  const handleCategoryClick = (category) => {
    // Si la categoría ya está seleccionada, la quitamos
    // Si no está seleccionada, la añadimos
    const categoryId = category.id_categoria;

    let newSelectedCategories;
    if (selectedCategories.includes(categoryId)) {
      newSelectedCategories = selectedCategories.filter(
        (id) => id !== categoryId
      );
    } else {
      newSelectedCategories = [...selectedCategories, categoryId];
    }

    setSelectedCategories(newSelectedCategories);

    if (onCategoryFilter) {
      onCategoryFilter(newSelectedCategories);
    }
  };

  const isCategorySelected = (category) => {
    return selectedCategories.includes(category.id_categoria);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      }
    }, 500);

    setDebounceTimer(timer);
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        // Limpiar timer de debounce
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        // Ejecutar búsqueda
        if (onSearch) {
          onSearch(searchTerm);
        }

        // Quitar el foco elegantemente
        e.target.blur();
      }
    },
    [debounceTimer, onSearch, searchTerm]
  );

  const handleClearSearch = () => {
    setSearchTerm("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-xs sm:max-w-md font-montserrat">
      <div
        className="
          flex items-center rounded-full border border-zinc-300 bg-white
          px-3 py-2 shadow-sm
        "
      >
        <Search className="text-zinc-500 size-4 mr-2" />
        <input
          type="search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="
            flex-1 bg-transparent text-sm text-zinc-700 
            placeholder:text-zinc-400 outline-none
            [-webkit-appearance:none] 
            [-moz-appearance:textfield]
            [&::-webkit-search-cancel-button]:hidden
            [&::-webkit-search-decoration]:hidden
          "
        />
        {/* Botón para limpiar la búsqueda */}
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="p-1 text-zinc-400 hover:text-zinc-600 transition"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setFilterOpen(!filterOpen);
          }}
          className={`
            p-2 rounded-full transition-colors
            ${filterOpen ? "bg-[#557051] text-white" : "text-[#557051] hover:bg-zinc-100"}
          `}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {filterOpen && (
        <>
          {/* Overlay que cubre toda la pantalla y cierra al hacer clic */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setFilterOpen(false)}
          />

          {/* Panel del filtro */}
          <div
            className="
              absolute left-1/2 -translate-x-1/2 w-[90vw] sm:w-[70vw]
              mt-3 rounded-2xl border border-zinc-200 bg-[#FAFAF9] 
              shadow-lg p-4 flex flex-wrap gap-2 justify-center 
              animate-fadeIn z-40
            "
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFilterOpen(false)}
              className="absolute top-3 right-4 p-1 rounded-md text-[#557051] hover:bg-zinc-200 transition"
            >
              <X size={18} />
            </button>

            {/* Estado de carga */}
            {loading && (
              <div className="w-full text-center py-4 text-zinc-500 text-sm">
                Cargando categorías...
              </div>
            )}

            {/* Estado de error */}
            {error && !loading && (
              <div className="w-full text-center py-2">
                <p className="text-red-500 text-sm mb-2">{error}</p>
              </div>
            )}

            {/* Contador de categorías mostradas */}
            <div className="w-full">
              {!loading && !error && categories.length > 0 && (
                <div className="text-center text-xs text-zinc-500 mb-2">
                  Mostrando {visibleCategories.length} de {categories.length}{" "}
                  categorías
                </div>
              )}
            </div>

            {/*<div className="grid grid-cols-7 gap-1.5"></div>*/}
            {visibleCategories.map((category, index) => (
              <button
                key={category.id_categoria || index}
                onClick={() => handleCategoryClick(category)}
                className={`
                    px-3 py-1.25 text-[11px] rounded-full border border-zinc-300 
                    transition
                    ${
                      isCategorySelected(category)
                        ? "bg-[#557051] text-white"
                        : "text-zinc-700 bg-white hover:bg-[#557051] hover:text-white"
                    }
                  `}
              >
                {category.categoria || category}
              </button>
            ))}

            <div className="flex justify-center gap-2 mt-2 w-full">
              {hasMoreCategories && (
                <button
                  onClick={handleShowMore}
                  className="
                    w-7 h-7 flex items-center justify-center text-xl 
                    rounded-full border border-zinc-300 text-[#557051]
                    hover:bg-[#557051] hover:text-white transition
                  "
                >
                  +
                </button>
              )}

              {isShowingMoreThan7 && (
                <button
                  onClick={handleShowLess}
                  className="
                    w-7 h-7 flex items-center justify-center text-xl 
                    rounded-full border border-zinc-300 text-[#557051]
                    hover:bg-[#557051] hover:text-white transition
                  "
                >
                  -
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

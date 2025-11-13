import React, { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function SearchBox({
  placeholder = "Search",
  onCategoryFilter,
  onSearch,
  enableDebounce = true,
  initialSelectedCategories = [],
  initialSearchTerm = "",
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(7);

  const [selectedCategories, setSelectedCategories] = useState(initialSelectedCategories);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    setSelectedCategories(initialSelectedCategories);
  }, [initialSelectedCategories]);

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

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
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  const handleCategoryClick = (category) => {
    const id = category.id_categoria;

    let updated;
    if (selectedCategories.includes(id)) {
      updated = selectedCategories.filter((cid) => cid !== id);
    } else {
      updated = [...selectedCategories, id];
    }

    setSelectedCategories(updated);
    if (onCategoryFilter) onCategoryFilter(updated);
  };

  const isCategorySelected = (category) =>
    selectedCategories.includes(category.id_categoria);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (enableDebounce) {
      if (debounceTimer) clearTimeout(debounceTimer);

      const timer = setTimeout(() => {
        if (onSearch) onSearch(value);
      }, 500);

      setDebounceTimer(timer);
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (debounceTimer) clearTimeout(debounceTimer);
        if (onSearch) onSearch(searchTerm);
        e.target.blur();
      }
    },
    [debounceTimer, onSearch, searchTerm]
  );

  const handleClearSearch = () => {
    setSearchTerm("");
    if (onSearch) onSearch("");
  };

  return (
    <>
      <div className="relative mx-auto w-full max-w-xs sm:max-w-md font-montserrat">
        <div className="flex items-center rounded-full border border-zinc-300 bg-white px-3 py-2 shadow-sm">
          <Search className="text-zinc-500 size-4 mr-2" />
          <input
            type="search"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-zinc-700 placeholder:text-zinc-400 outline-none"
          />

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
            onClick={() => setFilterOpen(!filterOpen)}
            className={`p-2 rounded-full transition-colors ${
              filterOpen
                ? "bg-[#557051] text-white"
                : "text-[#557051] hover:bg-zinc-100"
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {filterOpen && (
        <>
          {/* Overlay */}
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

            {loading && (
              <div className="w-full text-center py-4 text-zinc-500 text-sm">
                Cargando categorías...
              </div>
            )}

            {error && !loading && (
              <div className="w-full text-center py-2">
                <p className="text-red-500 text-sm mb-2">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="flex gap-2 overflow-x-auto scroll-smooth pb-2 no-scrollbar">
                {categories.map((category, i) => (
                  <button
                    key={category.id_categoria || i}
                    onClick={() => handleCategoryClick(category)}
                    className={`
                      flex-shrink-0 px-4 py-2 text-sm rounded-full border transition-all duration-200
                      ${
                        isCategorySelected(category)
                          ? "bg-[#557051] text-white border-[#557051]"
                          : "border-zinc-300 text-zinc-700 hover:bg-[#557051]/10 hover:text-[#557051]"
                      }
                    `}
                  >
                    {category.categoria || category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
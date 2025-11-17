// components/SearchBox.jsx
import React, { useState, useEffect, useCallback } from "react";
import SearchInput from "./SearchInput.jsx";
import CategoryFilterSilder from "./CategoryFilterSlider.jsx";
import useCategories from "../../hooks/useCategories.js";

export default function SearchBox({
  placeholder = "Search",
  onCategoryFilter,
  onSearch,
  enableDebounce = true,
  initialSelectedCategories = [],
  initialSearchTerm = "",
}) {
  const { categories, loading, error } = useCategories(true); // 'true' para categorias con productos
  const [filterOpen, setFilterOpen] = useState(false);

  // Estado interno local
  const [selectedCategories, setSelectedCategories] = useState(
    initialSelectedCategories || []
  );
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");

  useEffect(() => {
    setSelectedCategories(initialSelectedCategories || []);
    setSearchTerm(initialSearchTerm || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleToggleCategory = useCallback(
    (category) => {
      const id = category.id_categoria;
      setSelectedCategories((prev) => {
        const exists = prev.includes(id);
        const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
        onCategoryFilter && onCategoryFilter(next);
        return next;
      });
    },
    [onCategoryFilter]
  );

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleSearch = useCallback(
    (value) => {
      onSearch && onSearch(value);
    },
    [onSearch]
  );

  return (
    <>
      <div className="relative mx-auto w-full max-w-xs sm:max-w-md font-montserrat">
        <SearchInput
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          onSearch={handleSearch}
          enableDebounce={enableDebounce}
          onToggleFilterOpen={() => setFilterOpen((s) => !s)}
          isFilterOpen={filterOpen}
        />
      </div>

      <CategoryFilterSilder
        isOpen={filterOpen}
        categories={categories}
        selectedCategoryIds={selectedCategories}
        onToggleCategory={handleToggleCategory}
        loading={loading}
        error={error}
      />
    </>
  );
}

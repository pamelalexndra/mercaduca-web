// components/SearchBox.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import SearchInput from "./SearchInput.jsx";
import CategoryFilterSilder from "./CategoryFilterSlider.jsx";
import useCategories from "../../hooks/useCategories.js";
import useDebounce from "../../hooks/useDebounce.js";

export default function SearchBox({
  placeholder = "Search",
  onCategoryFilter,
  onSearch,
  enableDebounce = true,
  initialSelectedCategories = [],
  initialSearchTerm = "",
  showFilterButton = true,
}) {
  const { categories, loading, error } = useCategories(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState(
    initialSelectedCategories || []
  );
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (enableDebounce) {
      onSearchRef.current?.(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, enableDebounce]);

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
      if (!enableDebounce) {
        onSearchRef.current?.(value);
      }
    },
    [enableDebounce]
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
          showFilterButton={showFilterButton}
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
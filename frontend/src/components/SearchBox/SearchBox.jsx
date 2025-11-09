// components/SearchBox.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import SearchInput from "./SearchInput.jsx";
import CategoryDropdown from "./CategoryDropdown.jsx";
import useCategories from "../../hooks/useCategories.js";

export default function SearchBox({
    placeholder = "Search",
    onCategoryFilter,
    onSearch,
    enableDebounce = true,
    initialSelectedCategories = [],
    initialSearchTerm = "",
}) {
    const { categories, loading, error } = useCategories();
    const [filterOpen, setFilterOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(7);

    // Estado interno local (sincronizable desde props iniciales)
    const [selectedCategories, setSelectedCategories] = useState(initialSelectedCategories || []);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");

    // Mantener refs para no re-render innecesariamente
    const isFirstMountRef = useRef(true);

    // Sincronizar con props iniciales si cambian (comportamiento consistente con tu original)
    // ✅ Solo sincronizar en el primer render (cuando se abre Catalog)
    useEffect(() => {
        setSelectedCategories(initialSelectedCategories || []);
        setSearchTerm(initialSearchTerm || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handlers
    const handleToggleCategory = useCallback((category) => {
        const id = category.id_categoria;
        setSelectedCategories((prev) => {
            const exists = prev.includes(id);
            const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
            onCategoryFilter && onCategoryFilter(next);
            return next;
        });
    }, [onCategoryFilter]);

    const handleClearAllCategories = useCallback(() => {
        setSelectedCategories([]);
        onCategoryFilter && onCategoryFilter([]);
    }, [onCategoryFilter]);

    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    const handleSearch = useCallback((value) => {
        onSearch && onSearch(value);
    }, [onSearch]);

    const handleShowMore = useCallback(() => setVisibleCount((v) => v + 7), []);
    const handleShowLess = useCallback(() => setVisibleCount((v) => Math.max(7, v - 7)), []);

    return (
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

            {filterOpen && (
                <CategoryDropdown
                    categories={categories}
                    selectedCategoryIds={selectedCategories}
                    onToggleCategory={handleToggleCategory}
                    onClearAll={handleClearAllCategories}
                    visibleCount={visibleCount}
                    onShowMore={handleShowMore}
                    onShowLess={handleShowLess}
                    onClose={() => setFilterOpen(false)}
                    loading={loading}
                    error={error}
                />
            )}
        </div>
    );
}

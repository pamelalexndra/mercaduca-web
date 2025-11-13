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

    // Mantenemos tus variables aunque no se usen visualmente en el nuevo diseño (scroll)
    const [visibleCount, setVisibleCount] = useState(7);

    // Estado interno local
    const [selectedCategories, setSelectedCategories] = useState(initialSelectedCategories || []);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");

    const isFirstMountRef = useRef(true);

    useEffect(() => {
        setSelectedCategories(initialSelectedCategories || []);
        setSearchTerm(initialSearchTerm || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handlers (Tu lógica original intacta)
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
        <>
            {/* Contenedor del Input (Mantiene estilos del nuevo original) */}
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

            {/* CategoryDropdown siempre se renderiza para permitir la animación CSS.
                Le pasamos isOpen={filterOpen}.
            */}
            <CategoryDropdown
                isOpen={filterOpen}
                categories={categories}
                selectedCategoryIds={selectedCategories}
                onToggleCategory={handleToggleCategory}
                onClearAll={handleClearAllCategories}
                visibleCount={visibleCount}
                onShowMore={handleShowMore}
                onShowLess={handleShowLess}
                loading={loading}
                error={error}
            />
        </>
    );
}

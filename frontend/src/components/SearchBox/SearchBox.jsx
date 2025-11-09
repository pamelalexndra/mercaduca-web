import React, { useState, useEffect, useRef, useCallback } from 'react';
import SearchInput from './SearchInput.jsx';
import FilterPanel from './FilterPanel.jsx';

export default function SearchBox({ placeholder = 'Search', onCategoryFilter, onSearch, enableDebounce = true }) {
    const [filterOpen, setFilterOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [visibleCount, setVisibleCount] = useState(7);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // refs for debounce and mounted flag
    const debounceRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        const fetchCategories = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('http://localhost:5000/api/categorias');
                if (!res.ok) throw new Error('Error al cargar categorías');
                const data = await res.json();
                if (!mountedRef.current) return;
                setCategories(data || []);
            } catch (err) {
                console.error(err);
                if (!mountedRef.current) return;
                setError(err.message);
            } finally {
                if (mountedRef.current) setLoading(false);
            }
        };

        fetchCategories();
        return () => {
            mountedRef.current = false;
            clearTimeout(debounceRef.current);
        };
    }, []);

    // Debounced search emitter
    const emitSearch = useCallback((value) => {
        if (enableDebounce) {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                onSearch?.(value);
            }, 400);
        } else {
            onSearch?.(value);
        }
    }, [enableDebounce, onSearch]);

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        emitSearch(value);
    };

    const handleClear = () => {
        setSearchTerm('');
        emitSearch('');
    };

    const handleToggleCategory = (id) => {
        setSelectedCategories((prev) => {
            const exists = prev.includes(id);
            const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
            onCategoryFilter?.(next);
            return next;
        });
    };

    const handleShowMore = () => {
        setVisibleCount((v) => Math.min(categories.length, v + 7));
    };

    const handleShowLess = () => {
        setVisibleCount((v) => Math.max(7, v - 7));
    };

    return (
        <div className="relative mx-auto w-full max-w-xs sm:max-w-md font-montserrat">
            <SearchInput
                value={searchTerm}
                placeholder={placeholder}
                onChange={handleSearchChange}
                onClear={handleClear}
                onToggleFilter={() => setFilterOpen((v) => !v)}
            />

            {filterOpen && (
                <FilterPanel
                    categories={categories}
                    visibleCount={visibleCount}
                    selected={selectedCategories}
                    onToggleCategory={handleToggleCategory}
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
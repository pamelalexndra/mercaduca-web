// components/SearchInput.jsx
import React, { useEffect, useRef, useCallback } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

export default function SearchInput({
    placeholder = "Search",
    value,
    onChange,
    onSearch,
    enableDebounce = true,
    onToggleFilterOpen,
    isFilterOpen,
}) {
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleChange = useCallback(
        (e) => {
            const v = e.target.value;
            onChange(v);

            if (!enableDebounce) return;
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                onSearch && onSearch(v);
            }, 500);
        },
        [enableDebounce, onChange, onSearch]
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (timerRef.current) clearTimeout(timerRef.current);
                onSearch && onSearch(value);
                e.target.blur();
            }
        },
        [onSearch, value]
    );

    return (
        <div className="flex items-center rounded-full border border-zinc-300 bg-white px-3 py-2 shadow-sm w-full">
            <Search className="text-zinc-500 size-4 mr-2" />
            <input
                type="search"
                aria-label="Buscar productos"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
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

            {value && (
                <button
                    type="button"
                    onClick={() => {
                        onChange("");
                        onSearch && onSearch("");
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-600 transition"
                    aria-label="Limpiar búsqueda"
                >
                    <X size={16} />
                </button>
            )}

            <button
                type="button"
                onClick={onToggleFilterOpen}
                className={`p-2 rounded-full transition-colors ${isFilterOpen ? "bg-[#557051] text-white" : "text-[#557051] hover:bg-zinc-100"}`}
                aria-expanded={isFilterOpen}
                aria-label="Abrir filtros"
            >
                <SlidersHorizontal size={18} />
            </button>
        </div>
    );
}

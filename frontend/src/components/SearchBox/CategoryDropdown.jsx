// components/CategoryDropdown.jsx
import React, { useMemo } from "react";
import { X } from "lucide-react";

function CategoryButton({ category, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick(category);
            }}
            className={`px-3 py-1.25 text-[11px] rounded-full border transition-colors duration-200 ${selected ? "bg-[#557051] text-white border-[#557051]" : "text-zinc-700 bg-white border-zinc-300 hover:bg-[#557051] hover:text-white"}`}
            aria-pressed={selected}
        >
            {category.categoria || category}
        </button>
    );
}

export default function CategoryDropdown({
    categories = [],
    selectedCategoryIds = [],
    onToggleCategory,
    onClearAll,
    visibleCount,
    onShowMore,
    onShowLess,
    onClose,
    loading,
    error,
}) {
    const visibleCategories = useMemo(() => categories.slice(0, visibleCount), [categories, visibleCount]);
    const hasMore = visibleCount < categories.length;
    const isShowingMoreThan7 = visibleCount > 7;

    return (
        <>
            <div className="fixed inset-0 z-30" onClick={onClose} />
            <div
                className="absolute left-1/2 -translate-x-1/2 w-[90vw] sm:w-[70vw] mt-3 rounded-2xl border border-zinc-200 bg-[#FAFAF9] shadow-lg p-4 flex flex-wrap gap-2 justify-center animate-fadeIn z-40"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <button type="button" onClick={onClose} className="absolute top-3 right-4 p-1 rounded-md text-[#557051] hover:bg-zinc-200">
                    <X size={18} />
                </button>

                {loading && <div className="w-full text-center py-4 text-zinc-500 text-sm">Cargando categorías...</div>}
                {error && !loading && <div className="w-full text-center py-2"><p className="text-red-500 text-sm mb-2">{error}</p></div>}

                <div className="w-full">{!loading && !error && categories.length > 0 && <div className="text-center text-xs text-zinc-500 mb-2">Mostrando {visibleCategories.length} de {categories.length} categorías</div>}</div>

                {visibleCategories.map((category, idx) => (
                    <CategoryButton
                        key={category.id_categoria || idx}
                        category={category}
                        selected={selectedCategoryIds.includes(category.id_categoria)}
                        onClick={onToggleCategory}
                    />
                ))}

                <div className="flex justify-center gap-2 mt-2 w-full">
                    {hasMore && <button type="button" onClick={onShowMore} className="w-7 h-7 flex items-center justify-center text-xl rounded-full border border-zinc-300 text-[#557051] hover:bg-[#557051] hover:text-white">+</button>}
                    {isShowingMoreThan7 && <button type="button" onClick={onShowLess} className="w-7 h-7 flex items-center justify-center text-xl rounded-full border border-zinc-300 text-[#557051] hover:bg-[#557051] hover:text-white">-</button>}
                </div>

                {onClearAll && (
                    <div className="w-full flex justify-center mt-2">
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClearAll(); }} className="px-3 py-1 text-[11px] rounded-full border border-red-300 bg-red-50 text-red-600 hover:bg-red-100">
                            Limpiar
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}


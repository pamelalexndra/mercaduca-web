import React, { useMemo } from "react";

function CategoryButton({ category, selected, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 text-[11px] rounded-full border transition ${selected
                    ? "bg-[#557051] text-white border-[#557051]"
                    : "text-zinc-700 bg-white hover:bg-[#557051] hover:text-white"
                }`}
        >
            {category.categoria || category}
        </button>
    );
}

export default function FilterPanel({
    categories = [],
    visibleCount = 7,
    selected = [],
    onToggleCategory,
    onClose,
    loading,
    error,
    onShowMore,
    onShowLess,
}) {
    const visible = useMemo(
        () => categories.slice(0, visibleCount),
        [categories, visibleCount]
    );
    const hasMore = visibleCount < categories.length;
    const isShowingMoreThan7 = visibleCount > 7;

    return (
        <>
            {/* Fondo para cerrar al hacer clic fuera */}
            <div className="fixed inset-0 z-30" onClick={onClose} />

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
                    onClick={onClose}
                    className="absolute top-3 right-4 p-1 rounded-md text-[#557051] hover:bg-zinc-200 transition"
                >
                    ✕
                </button>

                {loading && (
                    <div className="w-full text-center py-4 text-zinc-500 text-sm">
                        Cargando categorías...
                    </div>
                )}

                {error && !loading && (
                    <div className="w-full text-center py-2 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="w-full text-center text-xs text-zinc-500 mb-2">
                            Mostrando {visible.length} de {categories.length} categorías
                        </div>

                        {visible.map((cat, i) => (
                            <CategoryButton
                                key={cat.id_categoria ?? i}
                                category={cat}
                                selected={selected.includes(cat.id_categoria)}
                                onClick={() => onToggleCategory(cat.id_categoria)}
                            />
                        ))}

                        <div className="flex justify-center gap-2 mt-2 w-full">
                            {hasMore && (
                                <button
                                    onClick={onShowMore}
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
                                    onClick={onShowLess}
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
                    </>
                )}
            </div>
        </>
    );
}

// components/CategoryDropdown.jsx
import React from "react";

export default function CategoryDropdown({
  isOpen,
  categories = [],
  selectedCategoryIds = [],
  onToggleCategory,
  loading,
  error,
}) {
  const scrollContainerRef = React.useRef(null);

  const isSelected = (id) => selectedCategoryIds.includes(id);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.scrollLeft += e.deltaY * 2;
    };

    const timer = setTimeout(() => {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }, 100);

    return () => {
      clearTimeout(timer);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, categories.length]);

  return (
    <div
      className={`transition-all duration-300 overflow-hidden ${
        isOpen ? "max-h-[140px] mt-8" : "max-h-0"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-8">
        {loading && (
          <div className="text-zinc-500 text-sm text-center py-2">
            Cargando categorías...
          </div>
        )}
        {error && !loading && (
          <div className="text-red-500 text-sm text-center py-2">{error}</div>
        )}

        {!loading && !error && (
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto scroll-smooth pb-2 no-scrollbar"
          >
            {categories.map((category, i) => (
              <button
                key={category.id_categoria || i}
                type="button"
                onClick={() => onToggleCategory(category)}
                className={`
                  flex-shrink-0 px-4 py-2 text-sm rounded-full border transition-all duration-200
                  ${
                    isSelected(category.id_categoria)
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
    </div>
  );
}
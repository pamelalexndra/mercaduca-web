import React, { useState } from "react";
import { ChevronDown, ChevronUp, Filter, X, Trash2 } from "lucide-react";

export default function FilterPanel({
    categories = [],
    selectedCategories = [],
    onCategoryChange,
    priceRange = { min: "", max: "" },
    onPriceChange,
    sortOption = "",
    onSortChange,
    showPriceFilter = true,
    className = "",
    onClose, // For mobile drawer usage
    onClear,
}) {
    const [openSections, setOpenSections] = useState({
        categories: true,
        price: true,
        sort: true,
    });

    const toggleSection = (section) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCategoryToggle = (id) => {
        if (selectedCategories.includes(id)) {
            onCategoryChange(selectedCategories.filter((c) => c !== id));
        } else {
            onCategoryChange([...selectedCategories, id]);
        }
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        // Allow empty string or numbers
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            onPriceChange({ ...priceRange, [name]: value });
        }
    };

    const sortOptions = [
        { label: "Más recientes", value: "fecha_desc" },
        { label: "Más antiguos", value: "fecha_asc" },
        { label: "Nombre (A-Z)", value: "nombre_asc" },
        { label: "Nombre (Z-A)", value: "nombre_desc" },
        ...(showPriceFilter
            ? [
                { label: "Precio: Menor a Mayor", value: "precio_asc" },
                { label: "Precio: Mayor a Menor", value: "precio_desc" },
            ]
            : []),
    ];

    return (
        <div
            className={`bg-white rounded-xl border border-zinc-200 shadow-sm p-5 font-montserrat ${className}`}
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                    <Filter size={20} /> Filtros
                </h3>

                <div className="flex items-center gap-2">
                    {(selectedCategories.length > 0 || (priceRange.min || priceRange.max) || sortOption) && (
                        <button
                            onClick={() => {
                                if (onClear) {
                                    onClear();
                                } else {
                                    onCategoryChange([]);
                                    if (onPriceChange) onPriceChange({ min: "", max: "" });
                                    onSortChange("");
                                }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500 bg-zinc-100 hover:bg-red-50 hover:text-red-600 rounded-full transition-all group"
                            title="Limpiar todos los filtros"
                        >
                            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                            <span>Limpiar</span>
                        </button>
                    )}

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="md:hidden p-2 -mr-2 text-zinc-500 hover:text-zinc-800"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="border-b border-zinc-100 py-4">
                <button
                    onClick={() => toggleSection("categories")}
                    className="flex w-full items-center justify-between text-zinc-800 font-semibold mb-2"
                >
                    <span>Categorías</span>
                    {openSections.categories ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                </button>
                {openSections.categories && (
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <label
                                    key={cat.id_categoria}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat.id_categoria)}
                                        onChange={() => handleCategoryToggle(cat.id_categoria)}
                                        className="w-4 h-4 rounded border-zinc-300 text-[#557051] focus:ring-[#557051]"
                                    />
                                    {cat.categoria || cat.Categoria}
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-zinc-400">No hay categorías</p>
                        )}
                    </div>
                )}
            </div>

            {/* Price Range */}
            {
                showPriceFilter && (
                    <div className="border-b border-zinc-100 py-4">
                        <button
                            onClick={() => toggleSection("price")}
                            className="flex w-full items-center justify-between text-zinc-800 font-semibold mb-2"
                        >
                            <span>Precio</span>
                            {openSections.price ? (
                                <ChevronUp size={16} />
                            ) : (
                                <ChevronDown size={16} />
                            )}
                        </button>
                        {openSections.price && (
                            <div className="mt-2 flex items-center gap-2">
                                <input
                                    type="number"
                                    name="min"
                                    placeholder="Min"
                                    value={priceRange.min}
                                    onChange={handlePriceChange}
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-[#557051] focus:ring-1 focus:ring-[#557051]"
                                />
                                <span className="text-zinc-400">-</span>
                                <input
                                    type="number"
                                    name="max"
                                    placeholder="Max"
                                    value={priceRange.max}
                                    onChange={handlePriceChange}
                                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-[#557051] focus:ring-1 focus:ring-[#557051]"
                                />
                            </div>
                        )}
                    </div>
                )
            }

            {/* Sort */}
            <div className="py-4">
                <button
                    onClick={() => toggleSection("sort")}
                    className="flex w-full items-center justify-between text-zinc-800 font-semibold mb-2"
                >
                    <span>Ordenar por</span>
                    {openSections.sort ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                </button>
                {openSections.sort && (
                    <div className="mt-2 space-y-2">
                        {sortOptions.map((opt) => (
                            <label
                                key={opt.value}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <input
                                    type="radio"
                                    name="sortOption"
                                    value={opt.value}
                                    checked={sortOption === opt.value}
                                    onChange={() => onSortChange(opt.value)}
                                    onClick={() => {
                                        if (sortOption === opt.value) {
                                            onSortChange("");
                                        }
                                    }}
                                    className="w-4 h-4 text-[#557051] border-zinc-300 focus:ring-[#557051]"
                                />
                                <span className="text-sm text-zinc-600 group-hover:text-zinc-900 transition-colors">
                                    {opt.label}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
}
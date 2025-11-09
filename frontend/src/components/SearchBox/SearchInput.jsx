import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function SearchInput({
    value,
    placeholder = 'Search',
    onChange,
    onClear,
    onToggleFilter,
}) {
    return (
        <div className="flex items-center rounded-full border border-zinc-300 bg-white px-3 py-2 shadow-sm">
            <Search className="text-zinc-500 mr-2" />
            <input
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                className="flex-1 bg-transparent text-sm text-zinc-700 placeholder:text-zinc-400 outline-none"
            />

            {value && (
                <button onClick={onClear} className="p-1 text-zinc-400 hover:text-zinc-600 transition">
                    <X size={16} />
                </button>
            )}

            <button
                type="button"
                onClick={onToggleFilter}
                className="p-2 rounded-full text-[#557051] hover:bg-zinc-100 transition"
                aria-label="Toggle filters"
            >
                <SlidersHorizontal size={18} />
            </button>
        </div>
    );
}
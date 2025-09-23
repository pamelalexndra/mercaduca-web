import React from "react";
import { Search } from "lucide-react";

export default function SearchBox({ placeholder = "Search" }) {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="mx-auto w-full max-w-md">
      <div className="relative font-montserrat">
        <input
          type="search"
          placeholder={placeholder}
          className="w-full rounded-lg border border-zinc-300 bg-white py-3 pl-4 pr-10 text-sm outline-none ring-0 focus:border-zinc-400 focus:shadow-sm"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
      </div>
    </form>
  );
}

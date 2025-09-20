import React from "react";
import { Link } from "react-router-dom";
import logoVerde from "../images/logoVerde.png";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-zinc-200">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-6">
        <Link to="/" className="font-semibold text-xl tracking-tight">
          <img
            src={logoVerde}
            alt="MercadUCA"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="ml-auto hidden sm:flex items-center gap-6 text-sm">
          <Link to="/" className="hover:text-zinc-700">Inicio</Link>
          <Link to="/catalog" className="hover:text-zinc-700">Catálogo</Link>
          <Link to="/emprendedores" className="hover:text-zinc-700">Emprendedores</Link>
          <Link to="/sobreNosotros" className="hover:text-zinc-700">Sobre nosotros</Link>
          <Link
            to="/vender"
            className="inline-flex items-center rounded-2xl border border-zinc-300 bg-zinc-100 px-4 py-2 font-medium hover:bg-zinc-200 transition"
          >
            Quiero vender
          </Link>
        </nav>
      </div>
    </header>
  );
}
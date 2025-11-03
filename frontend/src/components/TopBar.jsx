import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoVerde from "../images/logoVerde.png";
import { Menu, X } from "lucide-react";

export default function TopBar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-100 bg-[#FAFAF9]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex w-full items-center justify-between sm:hidden">
            <Link to="/" className="flex items-center">
              <img
                src={logoVerde}
                alt="MercadUCA"
                className="h-8 w-auto object-contain"
              />
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[#557051] rounded-md hover:bg-[#557051] hover:text-white transition sm:hidden"
            >
              <Menu size={22} />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-6 w-full">
            <Link to="/" className="font-semibold text-xl tracking-tight">
              <img
                src={logoVerde}
                alt="MercadUCA"
                className="h-10 w-auto object-contain"
              />
            </Link>

            <nav className="ml-auto flex items-center gap-6 text-sm">
              <Link to="/" className="hover:text-zinc-700">Inicio</Link>
              <Link to="/catalog" target="_blank" className="hover:text-zinc-700">Catálogo</Link>
              <Link to="/emprendedores" className="hover:text-zinc-700">Emprendedores</Link>
              <Link to="/sobreNosotros" className="hover:text-zinc-700">Sobre nosotros</Link>

              {!user ? (
                <Link
                  to="/vender"
                  className="
                    inline-flex items-center rounded-full 
                    border-2 border-[#557051] text-[#557051]
                    px-4 py-2 font-medium 
                    hover:bg-[#557051] hover:text-white 
                    transition-colors duration-300
                  "
                >
                  <span className="hidden sm:inline">Quiero vender</span>
                  <span className="sm:hidden">Vender</span>
                </Link>
              ) : (
                <Link to="/perfil" className="flex items-center">
                  <img
                    src={user.imagen_url || "https://i.ibb.co/4JwQfHf/avatar.jpg"}
                    alt="Perfil"
                    className="w-9 h-9 rounded-full border border-[#557051] object-cover"
                  />
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-90 flex sm:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
          <div
            className="
              relative ml-auto w-3/4 max-w-xs 
              h-[calc(100%-56px)] top-[56px]
              bg-[#557051]
              text-white p-6 flex flex-col pt-20 
              space-y-4 animate-slideIn
            "
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute right-4 p-2 top-6 text-white rounded-md hover:bg-[#445a3f]/80 transition"
            >
              <X size={22} />
            </button>

            <nav className="flex flex-col items-start ml-3 gap-5 text-montserrat text-[14px]">
              <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
              <Link to="/catalog" onClick={() => setMenuOpen(false)}>Catálogo</Link>
              <Link to="/emprendedores" onClick={() => setMenuOpen(false)}>Emprendedores</Link>
              <Link to="/sobreNosotros" onClick={() => setMenuOpen(false)}>Sobre nosotros</Link>
              {!user ? (
                <Link
                  to="/vender"
                  className="mt-2 inline-block rounded-full border-2 border-white 
                    text-white px-5 py-2
                    hover:bg-white hover:text-[#557051] transition"
                >
                  Quiero vender
                </Link>
              ) : (
                <Link
                  to="/perfil"
                  className="mt-2 inline-block rounded-full border-2 border-white 
                    text-white px-5 py-2
                    hover:bg-white hover:text-[#557051] transition"
                >
                  Perfil
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
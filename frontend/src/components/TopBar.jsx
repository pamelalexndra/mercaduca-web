import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoVerde from "../images/logoVerde.png";
import { Menu, X } from "lucide-react";

const PROFILE_PLACEHOLDER = "https://via.placeholder.com/80?text=Perfil";

export default function TopBar({user}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const [catalogWindow, setCatalogWindow] = useState(null);

  const isAuthenticated = Boolean(user);
  const emprendimientoData = user?.profile?.emprendimiento;
  const profileImage =
    emprendimientoData?.imagen_url || emprendimientoData?.imagen || PROFILE_PLACEHOLDER;
  const profileLabel = emprendimientoData?.nombre || user?.profile?.nombres || "Mi perfil";

  const abrirCatalogo = () => {
    if (!catalogWindow || catalogWindow.closed) {
      const nueva = window.open("/catalog", "catalogoWindow");
      setCatalogWindow(nueva);
    } else {
      catalogWindow.focus();
    }
  };

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
              <Link to="/" className="hover:text-zinc-700">
                Inicio
              </Link>
              <button onClick={abrirCatalogo} className="hover:text-zinc-700">
                Catálogo
              </button>

              <Link to="/emprendimientos" className="hover:text-zinc-700">
                Emprendimientos
              </Link>
              <Link to="/sobreNosotros" className="hover:text-zinc-700">
                Sobre nosotros
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/perfil"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#557051] overflow-hidden hover:border-[#3f523d] transition-colors"
                  title={profileLabel}
                >
                  <img
                    src={profileImage}
                    alt={profileLabel}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
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
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Inicio
              </Link>

              <button
                onClick={() => {
                  abrirCatalogo();
                  setMenuOpen(false);
                }}
              >
                Catálogo
              </button>

              <Link to="/emprendimiento" onClick={() => setMenuOpen(false)}>
                Emprendemientos
              </Link>
              <Link to="/sobreNosotros" onClick={() => setMenuOpen(false)}>
                Sobre nosotros
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/perfil"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 inline-flex items-center gap-3 rounded-full border-2 border-white text-white px-5 py-2 hover:bg-white hover:text-[#557051] transition"
                >
                  <img
                    src={profileImage}
                    alt={profileLabel}
                    className="w-8 h-8 rounded-full object-cover border border-white/70"
                  />
                  Mi perfil
                </Link>
              ) : (
                <Link
                  to="/vender"
                  onClick={() => setMenuOpen(false)}
                  className=" mt-2 inline-block rounded-full border-2 border-white
                    text-white px-5 py-2
                    hover:bg-white hover:text-[#557051] transition"
                >
                  Quiero vender
                </Link>
              )}5
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

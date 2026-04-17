import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

import SearchBox from "./SearchBox/SearchBox.jsx";
import Carousel from "./Carousel";

import mercaducaBlanco from "../images/mercaducaBlanco.png";
import bgLandingGato from "../images/bgLandingGato.jpg";

import { activityService } from "../services/activity.service.js";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Landing({ currentUser }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bannerRef = useRef(null);
  const dragStart = useRef(null);
  const currentPositionRef = useRef("50% 50%");

  const [actividadesParaCarrusel, setActividadesParaCarrusel] = useState([]);
  const [loadingActividades, setLoadingActividades] = useState(true);
  const [bannerImg, setBannerImg] = useState(null);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [bannerPosition, setBannerPosition] = useState("50% 50%");
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const [bannerRes, posRes] = await Promise.all([
          fetch(`${API_BASE_URL}/config/landing_banner`),
          fetch(`${API_BASE_URL}/config/landing_banner_position`),
        ]);

        if (bannerRes.ok) {
          const bannerData = await bannerRes.json();
          setBannerImg(bannerData.valor || bgLandingGato);
        } else {
          setBannerImg(bgLandingGato);
        }

        if (posRes.ok) {
          const posData = await posRes.json();
          if (posData.valor) setBannerPosition(posData.valor);
        }
      } catch {
        setBannerImg(bgLandingGato);
      } finally {
        setLoadingBanner(false);
      }
    };

    fetchBannerData();
  }, []);

  useEffect(() => {
    currentPositionRef.current = bannerPosition;
  }, [bannerPosition]);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoadingActividades(true);
        const response = await activityService.getAll();
        const activities = response.data || response;

        const formatted = (activities || []).map((act) => ({
          image: act?.imagen_url || act?.Imagen_url,
          text: `${act?.nombre ?? ""}: ${act?.descripcion ?? ""}`,
        }));

        setActividadesParaCarrusel(formatted);
      } catch {
      } finally {
        setLoadingActividades(false);
      }
    };

    loadActivities();
  }, []);

  const userRole = currentUser?.role || currentUser?.Rol || currentUser?.rol;
  const isAdmin = userRole?.toLowerCase() === "administrador";

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setBannerImg(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("clave", "landing_banner");

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/config/update-config`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) setBannerImg(data.newUrl);
    } catch {
    } finally {
      setUploading(false);
    }
  };

  const savePosition = async (position) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE_URL}/config/update-config-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clave: "landing_banner_position",
          valor: position,
        }),
      });
    } catch {
      // Error guardando posicion
    }
  };

  const handleMouseDown = (e) => {
    if (!isRepositioning) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, pos: bannerPosition };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStart.current || !bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
    const [px, py] = dragStart.current.pos.split(" ").map(parseFloat);
    const newX = Math.min(100, Math.max(0, px - dx));
    const newY = Math.min(100, Math.max(0, py - dy));
    const newPos = `${newX.toFixed(1)}% ${newY.toFixed(1)}%`;
    currentPositionRef.current = newPos;
    setBannerPosition(newPos);
  };

  const handleMouseUp = async () => {
    if (!isDragging) return;
    setIsDragging(false);
    await savePosition(currentPositionRef.current);
  };

  const handleSearchFromLanding = (searchTerm) => {
    navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleCategoryFilterFromLanding = (categoryIds) => {
    if (categoryIds.length > 0) {
      navigate(`/catalog?categories=${categoryIds.join(",")}`);
    } else {
      navigate("/catalog");
    }
  };

  return (
    <>
      <section className="relative flex flex-col items-center text-center px-2 w-full">
        {/* Banner: skeleton mientras carga, luego la imagen real */}
        {loadingBanner ? (
          <img
            src="/assets/loaders/skeleton-banner.svg"
            alt=""
            className="w-full rounded-3xl"
            aria-hidden="true"
          />
        ) : (
          <motion.div
            ref={bannerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`relative w-full rounded-3xl overflow-hidden shadow-md bg-cover bg-no-repeat
              ${isRepositioning ? "cursor-grab active:cursor-grabbing" : ""}`}
            style={{
              backgroundImage: `url(${bannerImg})`,
              backgroundPosition: bannerPosition,
            }}
          >
            <div className="absolute inset-0 bg-zinc-400/50" />
            <img
              src={mercaducaBlanco}
              alt="MercadUCA"
              className="relative mx-auto w-50 h-30 object-contain my-6 md:w-80 md:h-60 lg:w-92 lg:h-60"
            />

            {isAdmin && (
              <div className="absolute top-3 right-3 z-10 flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                  className="bg-white/80 hover:bg-white text-zinc-700 rounded-full p-2 shadow-md transition-all"
                  title="Cambiar imagen del banner"
                >
                  {uploading ? (
                    <span className="text-xs px-1">...</span>
                  ) : (
                    <Pencil size={18} />
                  )}
                </button>
                <button
                  onClick={async () => {
                    if (isRepositioning)
                      await savePosition(currentPositionRef.current);
                    setIsRepositioning(!isRepositioning);
                  }}
                  className={`rounded-full p-2 shadow-md transition-all text-xs font-semibold px-3
                    ${
                      isRepositioning
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-white/80 text-zinc-700 hover:bg-white"
                    }`}
                  title="Reposicionar imagen"
                >
                  {isRepositioning ? "Guardar" : "Mover"}
                </button>
              </div>
            )}

            {isRepositioning && (
              <div className="absolute inset-0 border-4 border-dashed border-white/70 rounded-3xl pointer-events-none flex items-center justify-center">
                <span className="bg-black/40 text-white text-sm px-3 py-1 rounded-full">
                  Arrastra para reposicionar
                </span>
              </div>
            )}
          </motion.div>
        )}

        <div className="-mt-5 w-full flex justify-center pb-12">
          <div className="w-[75%]">
            <SearchBox
              onSearch={handleSearchFromLanding}
              onCategoryFilter={handleCategoryFilterFromLanding}
              enableDebounce={false}
            />
          </div>
        </div>
      </section>

      {/* Actividades */}
      <section className="mb-14">
        <div className="mx-auto max-w-6xl px-6">
          <h3 className="text-xl font-loubag font-bold text-center">
            Algunas de nuestras actividades...
          </h3>
          <p className="mt-1 text-center text-sm text-zinc-500 font-poppins">
            Descubre lo que hacemos en Mercaduca
          </p>

          <div className="relative mt-6 pb-12 font-montserrat">
            <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
              {loadingActividades ? (
                /* Spinner owl mientras cargan actividades */
                <div className="w-full flex justify-center py-10">
                  <img
                    src="/assets/loaders/owl-spinner-circle.svg"
                    alt="Cargando actividades"
                    className="w-20"
                  />
                </div>
              ) : actividadesParaCarrusel.length > 0 ? (
                actividadesParaCarrusel.map((act, i) => (
                  <div
                    key={i}
                    className="snap-start shrink-0 w-64 sm:w-72 md:w-80"
                  >
                    <div className="rounded-2xl overflow-hidden shadow-md bg-zinc-100">
                      <img
                        src={act.image}
                        alt={`actividad-${i}`}
                        className="w-full h-48 object-cover"
                      />
                      {act.text && (
                        <p className="text-xs text-zinc-600 font-montserrat p-3 text-center">
                          {act.text}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full flex flex-col items-center py-10 gap-3">
                  <img
                    src="/assets/loaders/owl-empty-state.svg"
                    alt="Sin actividades"
                    className="w-20 opacity-60"
                  />
                  <p className="text-sm text-zinc-400">
                    No hay actividades disponibles
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Carousel
        title="Nuevos Productos"
        subtitle="Descubre los productos agregados recientemente al catalogo"
        endpoint="/products?ordenar=fecha_desc&limit=15"
      />

      <Carousel
        title="Nuevos Emprendimientos"
        subtitle="Descubre los favoritos de la comunidad"
        endpoint="/entrepreneurship?ordenar=fecha_desc&limit=10"
      />

      <Carousel
        title="Mejores ofertas"
        subtitle="Descubre los productos con los mejores precios"
        endpoint="/products?ordenar=precio_asc&limit=15"
      />
    </>
  );
}

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import SearchBox from "./SearchBox/SearchBox.jsx";
import Carousel from "./Carousel";

import mercaducaBlanco from "../images/mercaducaBlanco.png";
import bgLandingGato from "../images/bgLandingGato.jpg";

import { activityService } from "../services/activity.service.js";

export default function Landing() {
  const navigate = useNavigate();
  const [actividadesParaCarrusel, setActividadesParaCarrusel] = useState([]);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const response = await activityService.getAll();
        const activities = response.data || response;

        const formatted = activities.map((act) => ({
          image: act.imagen_url || act.Imagen_url,
          text: `${act.nombre}: ${act.descripcion}`,
        }));

        setActividadesParaCarrusel(formatted);
      } catch (err) {
        console.error("Error cargando actividades", err);
      }
    };

    loadActivities();
  }, []);

  const handleSearchFromLanding = (searchTerm) => {
    navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleCategoryFilterFromLanding = (categoryIds) => {
    if (categoryIds.length > 0) {
      const categoriesParam = categoryIds.join(",");
      navigate(`/catalog?categories=${categoriesParam}`);
    } else {
      navigate("/catalog");
    }
  };

  return (
    <>
      <section className="relative flex flex-col items-center text-center px-2 w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative w-full rounded-3xl overflow-hidden shadow-md bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgLandingGato})` }}
        >
          <div className="absolute inset-0 bg-zinc-400/50" />
          <img
            src={mercaducaBlanco}
            alt="MercadUCA"
            className="relative mx-auto w-50 h-30 object-contain my-6 md:w-80 md:h-60 lg:w-92 lg:h-60"
          />
        </motion.div>

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
        {actividadesParaCarrusel.length > 0 ? (
          actividadesParaCarrusel.map((act, i) => (
            <div key={i} className="snap-start shrink-0 w-64 sm:w-72 md:w-80">
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
          <div className="py-10 text-zinc-400 w-full text-center">
            Cargando actividades...
          </div>
        )}
      </div>
    </div>
  </div>
</section>

      <Carousel
        title="Nuevos Productos"
        subtitle="Descubre los productos agregados recientemente al catálogo"
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
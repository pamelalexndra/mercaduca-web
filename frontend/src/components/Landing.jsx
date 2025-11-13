import React from "react";
import { motion } from "framer-motion";
import SearchBox from "./SearchBox/SearchBox.jsx";
import Carousel from "./Carousel";
import { useNavigate } from "react-router-dom";
import mercaducaBlanco from "../images/mercaducaBlanco.png";
import bgLandingGato from "../images/bgLandingGato.jpg";

export default function Landing() {
  const navigate = useNavigate();

  const handleSearchFromLanding = (searchTerm) => {
    // Redirigir al catálogo con el término de búsqueda
    navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleCategoryFilterFromLanding = (categoryIds) => {
    // Redirigir al catálogo con las categorías seleccionadas
    if (categoryIds.length > 0) {
      const categoriesParam = categoryIds.join(",");
      navigate(`/catalog?categories=${categoriesParam}`);
    } else {
      // Si no hay categorías seleccionadas, ir al catálogo sin filtros
      navigate('/catalog');
    }
  };

  return (
    <>
      <section className="relative felx flex-col items-center text-center px-2 w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="
            relative w-full w-full
            rounded-3xl overflow-hidden shadow-md
            bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgLandingGato})` }}
        >
          <div className="absolute inset-0 bg-zinc-400/50" />
          <img
            src={mercaducaBlanco}
            alt="MercadUCA"
            className="
              relative mx-auto w-50 h-30 object-contain my-6
              md:w-80 md:h-60
              lg:w-92 lg:h-60
              "
          />
        </motion.div>

        <div className="-mt-5 w-full flex justify-center pb-12">
          <div className="w-[75%]">
            <SearchBox
              onSearch={handleSearchFromLanding}
              onCategoryFilter={handleCategoryFilterFromLanding}
              enableDebounce={false} // deshabilitar debounce en Landing
            />
          </div>
        </div>
      </section>

      <Carousel
        title="Nuevos Productos"
        subtitle="Descubre los productos agregados recientemente al catálogo"
        endpoint="/api/products?ordenar=fecha_desc&limit=15"
      />
      <Carousel
        title="Favoritos"
        subtitle="Descubre los favoritos de la comunidad"
        endpoint="/api/products?ordenar=fecha_desc&limit=10"
      />
      <Carousel
        title="Mejores ofertas"
        subtitle="Descubre los productos con los mejores precios"
        endpoint="/api/products?ordenar=precio_asc&limit=15"
      />
    </>
  );
}

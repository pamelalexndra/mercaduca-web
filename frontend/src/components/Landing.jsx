import React from "react";
import { motion } from "framer-motion";
import SearchBox from "./SearchBox";
import Carousel from "./Carousel";
import mercaducaVerde from "../images/mercaducaBlanco.png";
import bgLanding from "../images/bgLanding.jpg";

export default function Landing({ NEW_PRODUCTS, BEST_SELLERS }) {
  return (
    <>
     <section
        className="relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgLanding})` }}
      >

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative mx-auto max-w-4xl px-6 pt-40 pb-45 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white"
          >
            <img
              src={mercaducaVerde}
              alt="MercadUCA"
              className="mx-auto h-20 w-auto mb-6"
            />
          </motion.h1>

          <div className="mt-6">
            <SearchBox />
          </div>
        </div>
      </section>

      {/* Carruseles */}
      <Carousel
        title="New Products"
        subtitle="Descubre los fresi productos más recientes"
        items={NEW_PRODUCTS}
      />
      <Carousel
        title="Best Sellers"
        subtitle="Descubre los fresi productos más populares"
        items={BEST_SELLERS}
      />
    </>
  );
}

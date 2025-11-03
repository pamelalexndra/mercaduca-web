import React from "react";
import { motion } from "framer-motion";
import SearchBox from "./SearchBox";
import Carousel from "./Carousel";
import mercaducaBlanco from "../images/mercaducaBlanco.png";
import bgLanding from "../images/bgLanding.jpg";
import bgLandingGato from "../images/bgLandingGato.JPG";

export default function Landing({ NEW_PRODUCTS, BEST_SELLERS }) {
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
          <SearchBox />
          </div>
        </div>
      </section>

      <Carousel
        title="Nuevos productos"
        items={NEW_PRODUCTS}
      />
      <Carousel
        title="Favoritos"
        items={BEST_SELLERS}
      />
    </>
  );
}

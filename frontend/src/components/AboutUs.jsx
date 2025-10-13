import { h1 } from "framer-motion/client";
import React from "react";
import mercaducaPerfil from "../images/img_5651.jpg";
import actividad1 from "../images/Actividad1.png";
import Map from "../components/Map";

export default function AboutUS() {
  return (
    <section className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-7 text-center text-sm text-zinc-600"></div>
      <div
        className="mx-auto 
    flex flex-col items-center justify-center text-center
    bg-[#557051] rounded-lg shadow-md
    p-[24px] sm:p-[32px] lg:p-[48px]
    w-[350px] sm:w-[480px] lg:w-[840px]
    h-[460px] sm:h-[420px] lg:h-[420px]"
      >
        <h1 className="text-[#f4f4f2] sm:text-xl lg:text-2x1 font-loubag font-bold">
          Somos Mercaduca
        </h1>
        <p className='text-[#f4f4f2]/80 text-sm sm:text-base lg:text-lg font-montserrat mt-2 text-center max-w-3xl px-4 mx-auto"'>
          Mercaduca nace como un espacio donde los estudiantes podrán dar vida a
          sus proyectos, comercializar sus productos y conocer con la comunidad
          emprendedora dentro de la universidad 
        </p>
        <img
          src={mercaducaPerfil}
          alt="Mercaduca Perfil"
          className="mt-6 w-72 rounded-md"
        ></img>
      </div>
      <section className="py-16 px-6 bg-white text-[#000000] text-center">
        <h2 className="text-2xl lg:text-3xl font-loubag font-bold mb-8">
          Algunas de nuestras actividades...
        </h2>

        <div className="flex flex-col items-center justify-center">
          <img
            src={actividad1}
            alt="Actividad Mercaduca"
            className="w-[280px] sm:w-[320px] md:w-[360px] rounded-lg shadow-md mb-6"
          />

          <p className="text-[#000000]/80 text-base sm:text-lg lg:text-lg font-montserrat max-w-2xl mx-auto leading-relaxed">
            Mercaduca y Almendra Multiespacio se unen en una colaboración única
            al intercambiar de lugar.
          </p>
        </div>
      </section>
      <section className="py-16 bg-white text-center">
        <h2 className="text-2xl font-loubag font-bold mb-6">
          Ubicación de Mercad
        </h2>
        <Map />
      </section>
    </section>
  );
}

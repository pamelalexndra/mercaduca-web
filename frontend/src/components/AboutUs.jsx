import React from "react";
import mercaducaPerfil from "../images/IMG_5651.jpg";
import mercaducaPerfilNoche from "../images/bgLanding.jpg";
import mercaducaPerfilTarde from "../images/IMG_8675.png";
import mercaducaInterior from "../images/PXL_20250408_205803453.png";
import mercaducaInteriorCentral from "../images/Interior.JPG";
import actividad1 from "../images/HalloweenStickers.png";
import actividad2 from "../images/EspecialHalloween.png";
import actividad3 from "../images/StickersCompras.png";
import actividad4 from "../images/GalletasHalloween.png";
import actividad5 from "../images/MercaditoFechas.png";
import Map from "../components/Map";
import CarouselAbout from "../components/CarouselAbout";

export default function AboutUs() {
  return (
    <section className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-7 text-center text-sm text-zinc-600"></div>
      <div
        className="mx-auto flex flex-col items-center justify-center text-center
        bg-[#557051] rounded-lg shadow-md
        p-[24px] sm:p-[32px] lg:p-[48px]
        w-[90%] sm:w-[80%] lg:w-[70%]
        max-w-[900px]
        h-auto"
      >
        <h1 className="text-[#f4f4f2] text-3xl sm:text-4xl lg:text-5xl font-loubag font-bold py-3">
          Somos Mercaduca
        </h1>
        <p className="text-[#f4f4f2]/80 text-sm sm:text-base lg:text-2xl font-montserrat mt-4 text-center max-w-3xl px-4 mx-auto">
          Mercaduca nace como un espacio donde los estudiantes podrán dar vida a
          sus proyectos, comercializar sus productos y conectar con la comunidad
          emprendedora dentro de la universidad.
        </p>

        <div className="w-full mt-8">
          <CarouselAbout
            items={[
              { image: mercaducaPerfil },
              { image: mercaducaPerfilNoche },
              { image: mercaducaPerfilTarde },
              { image: mercaducaInterior },
              { image: mercaducaInteriorCentral },
            ]}
          />
        </div>
      </div>
      <section className="py-16 px-6 bg-white text-[#000000] text-center">
        <h2 className="text-2xl lg:text-5xl font-loubag font-bold mb-8">
          Algunas de nuestras actividades...
        </h2>

        <CarouselAbout
          variant="activities"
          items={[
            {
              image: actividad1,
              text: "Mercaduca alarga su horario este miercoles 29 de Octubre con un NIGHT SHIFT: 5:30 p.m. a 8:00 p.m.",
            },
            {
              image: actividad2,
              text: "Este lunes 20 y martes 21 de octubre te esperamos en nuestro Especial de Halloween, en conjunto con los Emprendedores del Programa Cuscatlán Crece Contigo y Emprendedores UCA de 8:00 a.m. a 11:45 a.m. en las Aulas D  parte baja",
            },
            {
              image: actividad3,
              text: "Por tus compras te llevas un sticker exclusivo de personajes icónicos cada semana ✨💰 ¡Y si encuentras uno con sello dorado ganas una giftcard de $5!",
            },
            {
              image: actividad4,
              text: "🧁🎃 ¡Halloween se vive (y se decora) en el Mercadito UCA! Mascabado te invita a un Crea-Lab de decoración de galletas donde lo terrorífico se vuelve delicioso. 👻🍪. Mas informacion en nuestras redes sociales",
            },
            {
              image: actividad5,
              text: "¡El Mercadito UCA regresa! Este 6 y 7 de octubre ven a descubrir productos únicos, creativos. 🎨👕🍦 📍 Frente a Aulas “D” | Plaza de los Estudiantes por la Paz ⏰ De 8:00 a.m. a 11:45 a.m.",
            },
          ]}
        />
      </section>
      <section className="py-16 bg-white text-center px-6 lg:px-20">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-loubag font-bold mb-6">
          Ubicación de Mercaduca
        </h2>

        <div className="mx-auto w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] h-[400px] rounded-lg overflow-hidden shadow-md">
          <Map />
        </div>
      </section>
    </section>
  );
}

import React, { useState, useEffect } from "react";
import Carousel from "../components/Carousel";
import Map from "../components/Map";

import mercaducaPerfil from "../images/IMG_5651.png";
import mercaducaPerfilNoche from "../images/bgLanding.jpg";
import mercaducaPerfilTarde from "../images/IMG_8675.png";
import mercaducaInterior from "../images/PXL_20250408_205803453.png";
import mercaducaInteriorCentral from "../images/Interior.JPG";

import { activityService } from "../services/activity.service.js";

export default function AboutUs() {
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

  return (
    <section className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-7 text-center text-sm text-zinc-600"></div>
      <div className="mx-auto flex flex-col items-center justify-center text-center bg-[#557051] rounded-lg shadow-md p-[24px] sm:p-[32px] lg:p-[48px] w-[90%] sm:w-[80%] lg:w-[70%] max-w-[900px] h-auto my-10">
        <h1 className="text-[#f4f4f2] text-3xl sm:text-4xl lg:text-5xl font-loubag font-bold py-3">
          Somos Mercaduca
        </h1>
        <p className="text-[#f4f4f2]/80 text-sm sm:text-base lg:text-2xl font-montserrat mt-4 text-center max-w-3xl px-4 mx-auto">
          Mercaduca nace como un espacio donde los estudiantes podrán dar vida a
          sus proyectos, comercializar sus productos y conectar con la comunidad
          emprendedora dentro de la universidad.
        </p>

        <div className="w-full mt-8">
          <Carousel
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
      <section className="py-10 px-6 bg-white text-[#000000] text-center">
        <h2 className="text-2xl lg:text-5xl font-loubag font-bold mb-6">
          Algunas de nuestras actividades...
        </h2>

        {actividadesParaCarrusel.length > 0 ? (
          <Carousel variant="activities" items={actividadesParaCarrusel} />
        ) : (
          <div className="py-10 text-zinc-400">Cargando actividades...</div>
        )}
      </section>
      <section className="py-10 bg-white text-center px-6 lg:px-20">
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

import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map({
  latitude = 13.679553,
  longitude = -89.237342,
  address = "Mercaduca",
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const lat = Number(latitude);
  const lng = Number(longitude);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const isAndroid =
    typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

  const openNavigation = () => {
    let url = "";

    if (isIOS) {
      url = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
    } else if (isAndroid) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    window.open(url, "_blank");
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
      center: [lng, lat],
      zoom: 15,
      attributionControl: false,
    });

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "top-left"
    );

    new maplibregl.Marker().setLngLat([lng, lat]).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="relative">
      <div
        id="map"
        ref={mapContainer}
        className="w-full h-[400px] rounded-xl"
      ></div>

      <button
        onClick={openNavigation}
        className="absolute bottom-4 right-4 
        flex items-center gap-2
        bg-[#557051] hover:bg-[#465e44]
        text-white px-5 py-3 rounded-full
        font-semibold shadow-lg hover:shadow-xl
        backdrop-blur-md bg-opacity-90
        transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 animate-pulse"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2l7 19-7-4-7 4 7-19z"
          />
        </svg>
        Cómo llegar
      </button>
    </div>
  );
}
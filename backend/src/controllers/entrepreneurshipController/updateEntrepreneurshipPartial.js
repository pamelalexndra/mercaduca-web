// src/controllers/entrepreneurship.controller.js
import pool from "../../database/connection.js";
import { buildEntrepreneurshipQueryUpdate } from "../../utils/builders/entrepreneurshipQueryBuilder.js";
import { createAddress } from "../../services/boxful.service.js";
import axios from "axios";

/**
 * Actualiza parcialmente un emprendimiento.
 * Si hay dirección de recolección, geocodifica con Google Maps antes de enviar a Boxful.
 */
export const updateEntrepreneurshipPartial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID de emprendimiento inválido" });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
    }

    // --- Geocodificar si hay dirección ---
    let latitude = null;
    let longitude = null;

    if (updates.direccion_recoleccion?.trim()) {
      try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const addressText = `${updates.direccion_recoleccion}, ${updates.boxful_city_id || ""}`;
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressText)}&key=${apiKey}`;

        const geoResp = await axios.get(geoUrl);
        const geoData = geoResp.data;

        if (geoData.status === "OK" && geoData.results.length > 0) {
          latitude = geoData.results[0].geometry.location.lat;
          longitude = geoData.results[0].geometry.location.lng;
        } else {
          console.warn("Geocoding no devolvió resultados:", geoData.status);
        }
      } catch (geoError) {
        console.error("Error geocoding Google Maps:", geoError.message);
      }
    }

    // --- Registrar en Boxful si hay ciudad y dirección ---
    if (updates.boxful_city_id && updates.direccion_recoleccion?.trim()) {
      try {
        const addressData = await createAddress({
          address: updates.direccion_recoleccion.trim(),
          referencePoint: updates.referencia_recoleccion?.trim() || updates.direccion_recoleccion.trim(),
          cityId: updates.boxful_city_id,
          addressPhone: updates.telefono || "",
          addressAreaCode: "503",
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
        });

        if (!addressData?.id) {
          return res.status(400).json({ error: "No se pudo registrar la dirección en Boxful para envíos" });
        }

        updates.boxful_address_id = addressData.id;
      } catch (boxfulError) {
        console.error("Error al registrar dirección en Boxful:", boxfulError.message);
        return res.status(400).json({ error: "Error al registrar la dirección en Boxful" });
      }
    }

    // --- Construir query de update ---
    const { query, params, count } = buildEntrepreneurshipQueryUpdate(id, updates);

    if (count === 0) {
      return res.status(400).json({ error: "No hay campos válidos para actualizar" });
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Emprendimiento no encontrado" });
    }

    res.json({
      message: "Emprendimiento actualizado exitosamente",
      emprendimiento: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando emprendimiento:", error);

    if (error.code === "23503") {
      return res.status(400).json({ error: "Categoría no válida" });
    }
    if (error.code === "23505") {
      return res.status(400).json({ error: "Ya existe un emprendimiento con ese nombre" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  }
};
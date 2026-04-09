import { createShipByLink } from "../../services/boxful.service.js";
import pool from "../../database/connection.js";

export const handleShipByLink = async (req, res) => {
  const { id_emprendimiento, producto } = req.body;

  if (!id_emprendimiento || !producto) {
    return res.status(400).json({
      error: "Faltan datos del producto o emprendimiento.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT 
         e.boxful_city_id,
         e.boxful_state_id,
         e.direccion_recoleccion,
         e.referencia_recoleccion,
         e.boxful_allows_card_payment,
         e.boxful_courier_id,
         emp.Telefono AS telefono
       FROM Emprendimiento e
       JOIN Emprendedor emp ON emp.id_emprendimiento = e.id_emprendimiento
       WHERE e.id_emprendimiento = $1
         AND emp.Activo = true
       LIMIT 1`,
      [id_emprendimiento]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No se encontró el emprendimiento.",
      });
    }

    const emp = result.rows[0];

    // Validar que tenga dirección configurada antes de llamar a Boxful
    if (!emp.direccion_recoleccion || !emp.boxful_city_id) {
      return res.status(400).json({
        error: "Este emprendedor aún no ha configurado su dirección de recolección. Debe completar su perfil primero.",
      });
    }

    if (!emp.telefono) {
      return res.status(400).json({
        error: "El emprendedor no tiene un teléfono registrado.",
      });
    }

    const parcels = [
      {
        content: producto.nombre,
        weight: producto.peso || 1,
        isFragile: producto.es_fragil || false,
        quantity: 1,
        unitPrice: parseFloat(producto.precio_dolares),
      },
    ];

    const emprendimientoPayload = {
      direccion_recoleccion: emp.direccion_recoleccion,
      referencia_recoleccion: emp.referencia_recoleccion || "",
      boxful_state_id: emp.boxful_state_id,
      boxful_city_id: emp.boxful_city_id,
      boxful_phone_area_code: "503", // El Salvador
      boxful_allows_card_payment: emp.boxful_allows_card_payment ?? true,
      boxful_courier_id: emp.boxful_courier_id || null,
    };

    const data = await createShipByLink(
      emprendimientoPayload,
      { telefono: emp.telefono },
      parcels
    );

    // Boxful puede devolver el link en distintas propiedades según su respuesta
    const link = data?.link || data?.url || data?.shipByLink || data?.shipmentLink;

    if (!link) {
      console.error("Respuesta inesperada de Boxful:", JSON.stringify(data));
      return res.status(502).json({
        error: "Boxful no devolvió un link válido.",
        detalle: data,
      });
    }

    return res.json({ link });
  } catch (err) {
    console.error("Error en handleShipByLink:", err.message);
    return res.status(500).json({
      error: "No se pudo generar el link de envío.",
    });
  }
};
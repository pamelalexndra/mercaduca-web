// src/controllers/handleShipByLink.js (o la ruta donde lo tengas)
import { createShipByLink } from "../../services/boxful.service.js";
import pool from "../../database/connection.js";
import { decrypt } from "../../utils/security/crypto.js"; 

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
         e.boxful_email,
         e.boxful_password,
         e.boxful_address_id,
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

    // 2. Validar que tenga su cuenta de Boxful vinculada
    if (!emp.boxful_email || !emp.boxful_password || !emp.boxful_address_id) {
      return res.status(400).json({
        error: "Este emprendedor aún no ha vinculado su cuenta de Boxful o no ha seleccionado una dirección de recolección.",
      });
    }
    
    if (!emp.telefono) {
      return res.status(400).json({
        error: "El emprendedor no tiene un teléfono registrado.",
      });
    }

    const plainPassword = decrypt(emp.boxful_password);
    
    if (!plainPassword) {
       return res.status(500).json({ 
         error: "Error interno al procesar las credenciales de envío del emprendedor." 
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
      boxful_address_id: emp.boxful_address_id,
      boxful_phone_area_code: "503", 
      boxful_allows_card_payment: emp.boxful_allows_card_payment ?? true,
      boxful_courier_id: emp.boxful_courier_id || null,
    };

    const data = await createShipByLink(
      emprendimientoPayload,
      { telefono: emp.telefono },
      parcels,
      emp.boxful_email,
      plainPassword
    );

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
    console.error("Error en handleShipByLink:", err.response?.data || err);
    return res.status(500).json({
      error: "No se pudo generar el link de envío. Verifica si las credenciales de Boxful del emprendedor siguen siendo válidas.",
    });
  }
};
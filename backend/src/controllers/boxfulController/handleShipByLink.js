import { createShipByLink } from "../../services/boxful.service.js";
import pool from "../../database/connection.js";
import { decrypt } from "../../utils/security/crypto.js"; 

export const handleShipByLink = async (req, res) => {
  const { id_emprendimiento, producto } = req.body;

  if (!id_emprendimiento || !producto) {
    return res.status(400).json({ error: "Faltan datos del producto o emprendimiento." });
  }

  try {
    // 1. Consulta limpia y sin JOINs problemáticos
    const result = await pool.query(
      `SELECT 
         boxful_email,
         boxful_password,
         boxful_address_id,
         boxful_allows_card_payment,
         boxful_courier_id
       FROM Emprendimiento
       WHERE id_emprendimiento = $1
       LIMIT 1`,
      [id_emprendimiento]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No se encontró el emprendimiento." });
    }

    const emp = result.rows[0];

    // 2. Validar que tenga su cuenta de Boxful vinculada
    if (!emp.boxful_email || !emp.boxful_password || !emp.boxful_address_id) {
      return res.status(400).json({
        error: "Este emprendedor aún no ha vinculado su cuenta de Boxful o no ha seleccionado una dirección de recolección.",
      });
    }

    const plainPassword = decrypt(emp.boxful_password);
    
    if (!plainPassword) {
       return res.status(500).json({ 
         error: "Error interno al procesar las credenciales de envío del emprendedor." 
       });
    }

    // 3. Armar los paquetes según el esquema de Boxful
    const parcels = [
      {
        content: producto.nombre,
        weight: producto.peso || 1,
        isFragile: producto.es_fragil || false,
        quantity: 1,
        unitPrice: parseFloat(producto.precio_dolares),
      },
    ];

    // 4. Llamar al servicio solo con los datos necesarios
    const data = await createShipByLink(emp, parcels, emp.boxful_email, plainPassword);

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
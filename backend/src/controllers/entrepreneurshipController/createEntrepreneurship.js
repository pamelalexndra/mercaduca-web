import pool from "../../database/connection.js";

export const createEntrepreneurship = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      nombre,
      descripcion,
      imagen_url,
      instagram,
      id_categoria,
      id_usuario,
    } = req.body;

    await client.query("BEGIN");

    if (!nombre) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "El campo nombre es requerido" });
    }

    if (!id_usuario) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "El ID de usuario es requerido" });
    }

    const emprendedorCheck = await client.query(
      "SELECT id_emprendedor FROM Usuarios WHERE id_usuario = $1",
      [parseInt(id_usuario)]
    );

    const emprendedorData = emprendedorCheck.rows[0];

    if (!emprendedorData || !emprendedorData.id_emprendedor) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "Usuario no es un emprendedor válido o no existe" });
    }

    const idEmprendedor = emprendedorData.id_emprendedor;

    const nuevoEmprendimiento = await client.query(
      `
      INSERT INTO Emprendimiento (
          id_categoria, 
          Nombre, 
          Descripcion, 
          Imagen_URL, 
          Instagram,
          Disponible
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        id_categoria ? parseInt(id_categoria) : null,
        nombre.trim(),
        descripcion?.trim() || "",
        imagen_url?.trim() || "",
        instagram?.trim() || "",
        true,
      ]
    );

    const emprendimientoCreado = nuevoEmprendimiento.rows[0];

    await client.query(
      "UPDATE Emprendedor SET id_emprendimiento = $1 WHERE id_emprendedor = $2",
      [emprendimientoCreado.id_emprendimiento, idEmprendedor]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Emprendimiento creado y vinculado exitosamente",
      emprendimiento: emprendimientoCreado,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creando emprendimiento:", error);

    if (error.code === "23503") {
      return res
        .status(400)
        .json({ error: "Categoría no válida o referencia incorrecta" });
    }

    if (error.code === "23505") {
      return res
        .status(400)
        .json({ error: "Ya existe un emprendimiento con ese nombre" });
    }

    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
};

/**
 * Valida que el alcance sea coherente:
 * - Producto específico: id_producto presente, id_categoria e id_emprendimiento nulos
 * - Categoría completa: id_categoria presente, id_emprendimiento e id_producto nulos
 * - Emprendimiento completo: id_emprendimiento presente, id_categoria e id_producto nulos
 */
export const validarAlcance = (id_emprendimiento, id_categoria, id_producto) => {
  // Contar cuántos IDs están presentes
  const idsPresentes = [
    id_emprendimiento ? 1 : 0,
    id_categoria ? 1 : 0,
    id_producto ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (idsPresentes === 0) {
    return "Debe seleccionar al menos un emprendimiento, categoría o producto para el cupón.";
  }

  if (idsPresentes > 1) {
    return "El cupón solo puede aplicarse a una opción: emprendimiento completo, categoría específica o producto específico.";
  }

  return null;
};
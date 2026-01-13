import React, { useState, useEffect } from "react";
import CategoriesPanel from "./CategoriesPanel";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/categories");
        console.log("Status del servidor: ", response.status);
        const result = await response.json();

        console.log("Respuesta completa del server:", result);
        console.log("Dentro del objeto:", result);

        if (result.success && Array.isArray(result.data)) {
          setCategories(result.data);
        } else {
          console.error("La respuesta no tiene el formato esperado:", result);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error cargando categorías:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData(); 
  }, []); 

  return (
    <CategoriesPanel
      categories={categories}
      loading={loading}
      onEditCategory={(c) => console.log("Editar", c)}
      onDeleteCategory={(c) => console.log("Borrar", c)}
    />
  );
}
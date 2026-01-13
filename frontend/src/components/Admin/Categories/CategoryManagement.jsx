import React, { useState, useEffect } from "react";
import CategoriesPanel from "./CategoriesPanel";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // CAMBIA ESTA URL a la ruta real de tu API de categorías
        const response = await fetch("http://localhost:3000/api/categorias"); 
        const data = await response.json();
        
        // Mapeamos los datos si los nombres de las columnas en SQL son distintos a los que espera el componente
        const formattedData = data.map(cat => ({
          id: cat.id_categoria,
          nombre: cat.Categoria,
          productCount: 0 // O el conteo si lo traes desde el backend
        }));

        setCategories(formattedData);
      } catch (error) {
        console.error("Error cargando categorías:", error);
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
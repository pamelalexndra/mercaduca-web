import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import CategoriesPanel from "./CategoriesPanel";
import CategoryForm from "./CategoryForm";
import SuccessDialog from "../../SuccessDialog";
import ConfirmationDialog from "../../ConfirmationDialog";
import { API_BASE_URL } from "../../../utils/api";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories`);
      const result = await response.json();

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

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No estás autenticado");
      }

      const response = await fetch(
        `${API_BASE_URL}/categories/${categoryToDelete.id_categoria || categoryToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la categoría");
      }

      // Actualizar la lista de categorías
      setCategories(
        categories.filter(
          (cat) => cat.id_categoria !== categoryToDelete.id_categoria
        )
      );

      // Mostrar mensaje de éxito
      setSuccessMessage("La categoría se ha eliminado correctamente.");
      setShowSuccess(true);
      setShowConfirm(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      alert(error.message || "Hubo un problema al eliminar la categoría.");
    }
  };

  const handleFormSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setShowForm(false);
    setSelectedCategory(null);
    // Recargar las categorías
    loadCategories();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedCategory(null);
  };

  return (
    <div className="bg-cream font-montserrat text-gray-800 min-h-screen p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="bg-white rounded-3xl shadow-xl p-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-poppins text-3xl text-[#557051] font-bold">
                Gestión de categorías
              </h1>
              <p className="font-montserrat text-gray-500 mt-1">
                Administra las categorías de productos de{" "}
                <strong>MercadUCA</strong>
              </p>
            </div>
            <button
              onClick={handleAddCategory}
              className="bg-[#557051] text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:bg-[#455a42] transition-transform active:scale-95 flex items-center gap-2"
            >
              <PlusCircle size={20} />
              Agregar categoría
            </button>
          </div>
        </header>

        <section className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="font-loubag text-xl text-[#557051] mb-6">
            Categorías existentes
          </h2>
          <CategoriesPanel
            categories={categories}
            loading={loading}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </section>
      </div>

      {showForm && (
        <CategoryForm
          category={selectedCategory}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      <SuccessDialog
        show={showSuccess}
        message={successMessage}
        onConfirm={() => setShowSuccess(false)}
      />

      <ConfirmationDialog
        show={showConfirm}
        message={`¿Estás seguro de eliminar la categoría "${categoryToDelete?.categoria || categoryToDelete?.Categoria || categoryToDelete?.nombre}"?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowConfirm(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}

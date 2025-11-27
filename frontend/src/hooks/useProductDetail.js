import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getProductById, 
  getEntrepreneurshipById, 
  updateProductAPI, 
  deleteProductAPI 
} from "../services/productService";

export const useProductDetail = (productId) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState("");

  const token = localStorage.getItem("token");
  const storedUserStr = localStorage.getItem("user");
  let myEntrepreneurshipId = null;

  if (storedUserStr) {
    try {
      const userObj = JSON.parse(storedUserStr);
      const emp = userObj?.profile?.emprendimiento;
      myEntrepreneurshipId = emp?.id_emprendimiento || emp?.id;
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Producto
        const prodData = await getProductById(productId);
        setProduct(prodData.producto);

        // 2. Emprendimiento
        if (prodData.producto.id_emprendimiento) {
          const empData = await getEntrepreneurshipById(prodData.producto.id_emprendimiento);
          setEmprendimiento(empData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchData();
  }, [productId]);

  const esDueno = product && myEntrepreneurshipId && String(product.id_emprendimiento) === String(myEntrepreneurshipId);

  const handleUpdate = async (formData) => {
    setModalError("");
    try {
      const payload = { ...formData, id_categoria: product.id_categoria, disponible: true };
      const result = await updateProductAPI(product.id, payload, token);
      
      setProduct(result.producto); 
      setShowModal(false);
      alert("Producto actualizado");
    } catch (err) {
      setModalError(err.message);
    }
  };

  const handleDelete = async () => {
    if(!window.confirm("¿Eliminar producto?")) return;
    try {
      await deleteProductAPI(product.id, token);
      navigate("/perfil");
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  return {
    product,
    emprendimiento,
    loading,
    error,
    esDueno,
    modalState: {
      visible: showModal,
      open: () => setShowModal(true),
      close: () => setShowModal(false),
      error: modalError
    },
    actions: {
      update: handleUpdate,
      remove: handleDelete
    }
  };
};
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Clock,
  Calendar,
  Tag,
  Package,
  Store,
  Layers,
  Pencil,
  Trash2,
} from "lucide-react";
import productPlaceholder from "../../../images/productPlaceholder.jpg";
import CouponForm from "./CouponsForm";
import ConfirmationDialog from "../../ConfirmationDialog.jsx";
import SuccessDialog from "../../SuccessDialog.jsx";
import { API_BASE_URL } from "../../../utils/api.js";

export default function CouponDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [cupon, setCupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState("");
  const [fromAdmin, setFromAdmin] = useState(false);

  useEffect(() => {
    const isAdminRoute = location.pathname.includes("/admin/");
    setFromAdmin(isAdminRoute);

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role || payload.rol);
      } catch (error) {}
    }

    cargarCupon();
  }, [id, location.pathname]);

  const cargarCupon = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cupones/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Cupón no encontrado");
        } else {
          throw new Error("Error al cargar el cupón");
        }
      } else {
        const data = await response.json();
        setCupon(data.cupon);
      }
    } catch (error) {
      setError("Error al cargar el cupón");
    } finally {
      setLoading(false);
    }
  };

  const calcularTiempoRestante = (fechaLimite) => {
    if (!fechaLimite) return "Sin fecha límite";

    const limite = new Date(fechaLimite);
    const ahora = new Date();

    if (limite <= ahora) return "Expirado";

    const diff = limite - ahora;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    if (dias > 0) {
      return `${dias} días ${horas} horas ${minutos} minutos ${segundos} segundos`;
    } else {
      return `${horas} horas ${minutos} minutos ${segundos} segundos`;
    }
  };

  useEffect(() => {
    if (cupon?.fecha_limite) {
      const actualizarTiempo = () => {
        setTiempoRestante(calcularTiempoRestante(cupon.fecha_limite));
      };

      actualizarTiempo();
      const intervalo = setInterval(actualizarTiempo, 1000);

      return () => clearInterval(intervalo);
    }
  }, [cupon?.fecha_limite]);

  const getAlcanceInfo = () => {
    if (cupon.id_producto) {
      return {
        tipo: "Producto específico",
        icon: Package,
        nombre: cupon.producto_nombre || "Producto",
        tipoLabel: "Producto seleccionado:",
      };
    }
    if (cupon.id_categoria) {
      return {
        tipo: "Categoría completa",
        icon: Layers,
        nombre: cupon.categoria_nombre || "Categoría",
        tipoLabel: "Categoría seleccionada:",
      };
    }
    return {
      tipo: "Emprendimiento específico",
      icon: Store,
      nombre: cupon.emprendimiento_nombre || "Emprendimiento",
      tipoLabel: "Emprendimiento seleccionado:",
    };
  };

  const handleEdit = () => {
    setSubmitError(null);
    setShowEditForm(true);
  };

  const handleDelete = () => {
    setSubmitError(null);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setSubmitError(null);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/cupones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar el cupón");
      }

      setSuccessMessage("El cupón se ha eliminado correctamente.");
      setShowSuccess(true);
      setShowConfirm(false);

      setTimeout(() => {
        if (fromAdmin) {
          navigate(-1);
        } else {
          navigate(-1);
        }
      }, 2000);
    } catch (error) {
      setSubmitError(error.message || "Error al eliminar el cupón");
      setShowConfirm(false);
    }
  };

  const handleFormSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setShowEditForm(false);
    cargarCupon();
  };

  const isAdmin =
    userRole === "Administrador" ||
    userRole === "administrador" ||
    userRole === "Adm";

  const handleGoBack = () => {
    if (fromAdmin) {
      navigate(-1);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#557051] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cupón...</p>
        </div>
      </div>
    );
  }

  if (error || !cupon) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Cupón no encontrado"}</p>
          <button
            onClick={handleGoBack}
            className="bg-[#557051] text-white px-6 py-2 rounded-lg hover:bg-[#455a42] transition"
          >
            Volver a {fromAdmin ? "administración" : "cupones"}
          </button>
        </div>
      </div>
    );
  }

  const alcance = getAlcanceInfo();
  const AlcanceIcon = alcance.icon;

  return (
    <div className="min-h-screen bg-cream font-montserrat">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <button
          onClick={handleGoBack}
          className="mb-6 text-[#557051] hover:text-[#455a42] font-semibold flex items-center gap-2 transition"
        >
          ← Volver a {fromAdmin ? "administración" : "cupones"}
        </button>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
          <div className="relative">
            <div className="w-full h-64 md:h-96 overflow-hidden">
              <img
                src={cupon.imagen_url || productPlaceholder}
                alt={cupon.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10">
            <h1 className="font-loubag text-2xl md:text-3xl lg:text-4xl text-[#557051] mb-4">
              {cupon.nombre}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Descripción
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {cupon.descripcion || "Sin descripción disponible"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Detalles del cupón
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Tag size={20} className="text-[#557051]" />
                      <div>
                        <p className="text-sm text-gray-500">Descuento</p>
                        <p className="font-bold text-xl text-[#557051]">
                          {parseFloat(cupon.descuento).toFixed(0)}% OFF
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-[#557051]" />
                      <div>
                        <p className="text-sm text-gray-500">Fecha límite</p>
                        <p className="font-semibold">
                          {new Date(cupon.fecha_limite).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-[#557051]" />
                      <div>
                        <p className="text-sm text-gray-500">Tiempo restante</p>
                        <p
                          className={`font-semibold ${tiempoRestante.includes("Expirado") ? "text-red-600" : "text-[#557051]"}`}
                        >
                          {tiempoRestante}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#557051]/5 rounded-xl p-6 border border-[#557051]/20">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Tipo de cupón
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlcanceIcon size={18} className="text-[#557051]" />
                        <p className="font-semibold">{alcance.tipo}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {alcance.tipoLabel}
                      </p>
                      <p className="font-medium text-gray-800">
                        {alcance.nombre}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mostrar errores */}
            {submitError && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {submitError}
              </div>
            )}

            {isAdmin && (
              <div className="mt-8 flex justify-end gap-4 border-t pt-6">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#557051] text-white rounded-lg hover:bg-[#455a42] transition-colors font-medium"
                >
                  <Pencil size={18} />
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Trash2 size={18} />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditForm && (
        <CouponForm
          cupon={cupon}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      <ConfirmationDialog
        show={showConfirm}
        message="¿Estás seguro de eliminar este cupón? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />

      <SuccessDialog
        show={showSuccess}
        message={successMessage}
        onConfirm={() => {
          setShowSuccess(false);
        }}
      />
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";
import ConfirmationDialog from "./ConfirmationDialog";
import SuccessDialog from "./SuccessDialog";
import ActivityForm from "./AdminPanel/Activities/ActivityForm";
import CategoryForm from "./AdminPanel/Categories/CategoryForm";
import RequestPanel from "./AdminPanel/Requests/RequestPanel";
import ActivitiesPanel from "./AdminPanel/Activities/ActivitiesPanel";
import CategoriesPanel from "./AdminPanel/Categories/CategoriesPanel";
import EntrepreneursPanel from "./AdminPanel/Entrepreneurs/EntrepreneursPanel";
import AdminPanel from "./AdminPanel/Administrators/AdminPanel";
import AdminForm from "./AdminPanel/Administrators/AdminForm";

const AdminProfile = ({ onUpdateUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const userRole = user?.Role || user?.role;

      if (userRole !== "Administrador" && userRole !== "administrador") {
        navigate("/perfil");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (onUpdateUser) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          onUpdateUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error updating user in AdminProfile:", error);
        }
      }
    }
  }, [onUpdateUser]);

  const [activeSection, setActiveSection] = useState("solicitudes");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [solicitudes, setSolicitudes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [emprendedores, setEmprendedores] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEmprendedorForEdit, setSelectedEmprendedorForEdit] =
    useState(null);
  const [adminToEdit, setAdminToEdit] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [confirmationData, setConfirmationData] = useState({
    type: "",
    id: null,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [globalError, setGlobalError] = useState("");

  const [loading, setLoading] = useState({
    solicitudes: false,
    activities: false,
    categories: false,
    emprendedores: false,
    admins: false,
  });

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  };

  const getAuthHeaders = () => {
    const token = getToken();
    return token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  const loadSectionData = async () => {
    const token = getToken();
    if (!token) return;

    setLoading((prev) => ({ ...prev, [activeSection]: true }));
    setGlobalError("");

    try {
      switch (activeSection) {
        case "solicitudes":
          await loadSolicitudes();
          break;
        case "activities":
          await loadActivities();
          break;
        case "categories":
          await loadCategories();
          break;
        case "emprendedores":
          await loadEmprendedores();
          break;
        case "admins":
          await loadAdmins();
          break;
      }
    } catch (error) {
      setGlobalError(`Error al cargar ${activeSection}: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, [activeSection]: false }));
    }
  };

  const loadSolicitudes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/request`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Error al cargar solicitudes");

      const data = await response.json();
      setSolicitudes(
        Array.isArray(data) ? data : data.data || data.solicitudes || []
      );
    } catch (error) {
      setSolicitudes([]);
      throw error;
    }
  };

  const loadActivities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/activities`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Error al cargar actividades");

      const data = await response.json();
      setActivities(
        Array.isArray(data) ? data : data.data || data.activities || []
      );
    } catch (error) {
      setActivities([]);
      throw error;
    }
  };

  const loadCategories = async () => {
    try {
      const url = `${API_BASE_URL}/api/products/product-category`;
      const headers = getAuthHeaders();

      const response = await fetch(url, {
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error("Formato de datos inválido");
      }

      const categoriesWithCount = result.data.map((item) => ({
        id: item.id_categoria || item.id,
        id_categoria: item.id_categoria || item.id,
        Categoria:
          item.Categoria || item.categoria || item.nombre || "Sin nombre",
        productCount: item.cantidad_productos || 0,
        cantidad_productos: item.cantidad_productos || 0,
        ...item,
      }));

      categoriesWithCount.sort((a, b) => {
        const nameA = a.Categoria.toLowerCase();
        const nameB = b.Categoria.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setCategories(categoriesWithCount);
    } catch (error) {
      setGlobalError("Error al cargar las categorías con conteo de productos");
      await loadBasicCategories();
    }
  };

  const loadBasicCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const categoriesData = Array.isArray(data)
          ? data
          : data.categories || data.data || [];

        const categoriesWithZeroCount = categoriesData.map((cat) => ({
          ...cat,
          productCount: 0,
          cantidad_productos: 0,
        }));

        categoriesWithZeroCount.sort((a, b) => {
          const nameA = (
            a.Categoria ||
            a.categoria ||
            a.nombre ||
            ""
          ).toLowerCase();
          const nameB = (
            b.Categoria ||
            b.categoria ||
            b.nombre ||
            ""
          ).toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setCategories(categoriesWithZeroCount);
      } else {
        setCategories([]);
      }
    } catch (error) {
      setCategories([]);
    }
  };

  const loadEmprendedores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profiles`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al cargar emprendedores: ${response.status}`);
      }

      const data = await response.json();

      let perfiles = [];

      if (data && Array.isArray(data.perfiles)) {
        perfiles = data.perfiles;
      } else if (Array.isArray(data)) {
        perfiles = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        perfiles = data.data;
      } else if (data && data.rows && Array.isArray(data.rows)) {
        perfiles = data.rows;
      }

      const vendedores = perfiles.filter((user) => {
        const rol = user.Rol || user.rol || user.role || "";
        return rol.toLowerCase().includes("vendedor");
      });

      vendedores.sort((a, b) => {
        const nombreA = (a.Nombres || a.nombres || "").toLowerCase();
        const nombreB = (b.Nombres || b.nombres || "").toLowerCase();
        return nombreA.localeCompare(nombreB);
      });

      setEmprendedores(vendedores);
      return vendedores;
    } catch (error) {
      setEmprendedores([]);
      throw error;
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Error al cargar administradores");

      const data = await response.json();
      const adminsData = Array.isArray(data) ? data : data.data || [];

      if (adminsData.length >= 3) {
        setShowAdminForm(false);
      }

      setAdmins(adminsData);
    } catch (error) {
      setAdmins([]);
      throw error;
    }
  };

  useEffect(() => {
    if (getToken()) {
      loadSectionData();
    }
  }, [activeSection]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleAcceptSolicitud = async (solicitudId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/request/accept/${solicitudId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al aceptar solicitud");
      }

      setSuccessMessage("Solicitud aceptada correctamente");
      setShowSuccessDialog(true);

      loadSolicitudes();
      setSelectedSolicitud(null);

      setShowConfirmationDialog(false);
    } catch (error) {
      setGlobalError(`Error: ${error.message}`);
      setShowConfirmationDialog(false);
    }
  };

  const handleRejectSolicitud = async (solicitudId, razon) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/request/deny/${solicitudId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
          body: JSON.stringify({ razon }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al rechazar solicitud");
      }

      setSuccessMessage("Solicitud rechazada correctamente");
      setShowSuccessDialog(true);

      loadSolicitudes();
      setSelectedSolicitud(null);

      setShowConfirmationDialog(false);
    } catch (error) {
      setGlobalError(`Error: ${error.message}`);
      setShowConfirmationDialog(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/activities/${activityId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) throw new Error("Error al eliminar actividad");

      setSuccessMessage("Actividad eliminada correctamente");
      setShowSuccessDialog(true);

      loadActivities();
      setSelectedActivity(null);
    } catch (error) {
      setGlobalError(`Error: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) throw new Error("Error al eliminar categoría");

      setSuccessMessage("Categoría eliminada correctamente");
      setShowSuccessDialog(true);

      loadCategories();
    } catch (error) {
      setGlobalError(`Error: ${error.message}`);
    }
  };

  const handleEditAdmin = (admin) => {
    setAdminToEdit(admin);
    setShowAdminForm(true);
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/profile/${adminId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) throw new Error("Error al eliminar administrador");

      setSuccessMessage(`Administrador "${adminName}" eliminado correctamente`);
      setShowSuccessDialog(true);
      loadAdmins();
    } catch (error) {
      setGlobalError(`Error: ${error.message}`);
    }
  };

  const showConfirmation = (type, id, title, message, onConfirm) => {
    setConfirmationData({
      type,
      id,
      title,
      message,
      onConfirm,
    });
    setShowConfirmationDialog(true);
  };

  const handleConfirm = () => {
    confirmationData.onConfirm();
    setShowConfirmationDialog(false);
  };

  const handleAdminSuccess = (adminData) => {
    setSuccessMessage(
      adminToEdit
        ? "Administrador actualizado exitosamente"
        : "Administrador creado exitosamente"
    );
    setShowSuccessDialog(true);
    setShowAdminForm(false);
    setAdminToEdit(null);
    loadAdmins();
  };

  const handleCloseAdminForm = () => {
    setShowAdminForm(false);
    setAdminToEdit(null);
  };

  const handleCategoryDeleteClick = (category) => {
    const categoryName =
      category.Categoria || category.categoria || category.nombre;
    const categoryId = category.id_categoria || category.id;

    showConfirmation(
      "delete_category",
      categoryId,
      "Eliminar Categoría",
      `¿Estás seguro de que deseas eliminar la categoría "${categoryName}"?`,
      () => handleDeleteCategory(categoryId)
    );
  };

  const handleCategoryEditClick = (category) => {
    setSelectedCategory(category);
    setShowCategoryForm(true);
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setShowActivityForm(true);
  };

  const handleCloseActivityForm = () => {
    setShowActivityForm(false);
  };

  const handleActivitySuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessDialog(true);
    setShowActivityForm(false);
    loadActivities().then(() => {
      if (selectedActivity) {
        const id = selectedActivity.id_actividad || selectedActivity.id;
        const updatedActivity = activities.find(
          (a) => (a.id_actividad || a.id) === id
        );
        if (updatedActivity) {
          setSelectedActivity(updatedActivity);
        }
      }
    });
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "solicitudes":
        return (
          <RequestPanel
            solicitudes={solicitudes}
            selectedSolicitud={selectedSolicitud}
            setSelectedSolicitud={setSelectedSolicitud}
            showConfirmation={showConfirmation}
            loading={loading.solicitudes}
            handleAcceptSolicitud={handleAcceptSolicitud}
            handleRejectSolicitud={handleRejectSolicitud}
          />
        );
      case "activities":
        return (
          <ActivitiesPanel
            activities={activities}
            selectedActivity={selectedActivity}
            setSelectedActivity={setSelectedActivity}
            showConfirmation={showConfirmation}
            loading={loading.activities}
            handleDeleteActivity={handleDeleteActivity}
            handleEditActivity={handleEditActivity}
          />
        );
      case "categories":
        return (
          <CategoriesPanel
            categories={categories}
            loading={loading.categories}
            onEditCategory={handleCategoryEditClick}
            onDeleteCategory={handleCategoryDeleteClick}
          />
        );
      case "emprendedores":
        return (
          <EntrepreneursPanel
            emprendedores={emprendedores}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedEmprendedorForEdit={selectedEmprendedorForEdit}
            setSelectedEmprendedorForEdit={setSelectedEmprendedorForEdit}
            loading={loading.emprendedores}
          />
        );
      case "admins":
        return (
          <AdminPanel
            admins={admins}
            loading={loading.admins}
            onEditAdmin={handleEditAdmin}
            onDeleteAdmin={handleDeleteAdmin}
            showConfirmation={showConfirmation}
          />
        );
      default:
        return <div>Sección no encontrada</div>;
    }
  };

  const renderActionButton = () => {
    const buttonClass =
      "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold";

    switch (activeSection) {
      case "activities":
        return (
          <button
            onClick={() => {
              setSelectedActivity(null);
              setShowActivityForm(true);
            }}
            className={`${buttonClass} bg-gradient-to-r from-[#557051] to-[#6a8a62] text-white hover:from-[#445a3f] hover:to-[#557051]`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar actividad
          </button>
        );
      case "categories":
        return (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setShowCategoryForm(true);
            }}
            className={`${buttonClass} bg-gradient-to-r from-[#557051] to-[#6a8a62] text-white hover:from-[#445a3f] hover:to-[#557051]`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar Categoría
          </button>
        );
      case "admins":
        return (
          admins.length < 3 && (
            <button
              onClick={() => setShowAdminForm(true)}
              className={`${buttonClass} bg-gradient-to-r from-[#557051] to-[#6a8a62] text-white hover:from-[#445a3f] hover:to-[#557051]`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Agregar administrador
            </button>
          )
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-montserrat">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Administración mercaduca
            </h1>
          </div>
          <div className="flex items-center gap-3">{renderActionButton()}</div>
        </div>
      </div>

      <div className="flex">
        <div
          className={`
            ${isMobileMenuOpen ? "block" : "hidden"} 
            md:block md:w-64 bg-white border-r border-gray-200
            fixed md:static inset-y-0 left-0 z-20
            w-64 h-full overflow-y-auto shadow-lg md:shadow-none
          `}
        >
          <div className="p-4">
            <nav className="space-y-1">
              {[
                { id: "solicitudes", label: "Solicitudes", icon: "📨" },
                { id: "activities", label: "Actividades", icon: "📅" },
                { id: "categories", label: "Categorías", icon: "🏷️" },
                { id: "emprendedores", label: "Emprendedores", icon: "👥" },
                { id: "admins", label: "Administradores", icon: "🔧" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors
                    ${
                      activeSection === item.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {activeSection === item.id && (
                    <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm min-h-[calc(100vh-120px)]">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeSection === "solicitudes" && "Solicitudes de registro"}
                {activeSection === "activities" && "Actividades"}
                {activeSection === "categories" && "Categorías"}
                {activeSection === "emprendedores" && "Emprendedores"}
                {activeSection === "admins" && "Administradores"}
              </h2>
              {activeSection === "solicitudes" &&
                solicitudes.length > 0 &&
                !selectedSolicitud && (
                  <p className="text-sm text-gray-500 mt-1">
                    {solicitudes.length} solicitud
                    {solicitudes.length !== 1 ? "es" : ""} pendiente
                    {solicitudes.length !== 1 ? "s" : ""}
                  </p>
                )}
              {activeSection === "categories" && categories.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {categories.length} categoría
                  {categories.length !== 1 ? "s" : ""} con conteo de productos
                </p>
              )}
            </div>

            {globalError && (
              <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {globalError}
              </div>
            )}

            <div className="p-4 md:p-6">{renderActiveSection()}</div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        show={showConfirmationDialog}
        message={confirmationData.message}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmationDialog(false)}
      />

      <SuccessDialog
        show={showSuccessDialog}
        message={successMessage}
        onConfirm={() => {
          setShowSuccessDialog(false);
          setSuccessMessage("");
          setGlobalError("");
        }}
      />

      {showActivityForm && (
        <ActivityForm
          activity={selectedActivity}
          onClose={handleCloseActivityForm}
          onSuccess={handleActivitySuccess}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          category={selectedCategory}
          onClose={() => {
            setShowCategoryForm(false);
            setSelectedCategory(null);
          }}
          onSuccess={(message) => {
            setSuccessMessage(message);
            setShowSuccessDialog(true);
            setShowCategoryForm(false);
            setSelectedCategory(null);
            loadCategories();
          }}
        />
      )}

      {showAdminForm && (
        <AdminForm
          adminToEdit={adminToEdit}
          onClose={handleCloseAdminForm}
          onSuccess={handleAdminSuccess}
          loadingAdmins={loading.admins}
        />
      )}

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
export default AdminProfile;

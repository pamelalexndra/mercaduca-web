import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Componentes de Navegación y Estructura
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import AdminLayout from "./components/Admin/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas Públicas
import Landing from "./components/Landing";
import Catalog from "./components/Catalog";
import Sellers from "./components/Entrepreneurship";
import AboutUs from "./components/AboutUs";
import ProductDetailPage from "./components/ProductDetail/ProductDetailPage";
import PublicProfile from "./components/PublicProfile";
import Login from "./components/Login";
import Register from "./components/Register";

// Páginas Privadas (Usuario)
import Profile from "./components/Profile";
import CategoriesPanel from "./components/Admin/Categories/CategoriesPanel";

// Páginas de Administración
import EntrepreneurshipApplications from "./components/Admin/Requests/EntrepreneurshipApplications";
import ActivityManagement from "./components/Admin/Activities/ActivityManagement.jsx";
import CategoryManagement from "./components/Admin/Categories/CategoryManagement.jsx";

// Páginas de Error
import NotFound from "./components/ErrorPages/NotFound";
import Forbidden from "./components/ErrorPages/Forbidden";
import InternalServerError from "./components/ErrorPages/InternalServerError";
import BadRequest from "./components/ErrorPages/BadRequest";

// Utilidad para volver al inicio al cambiar de página
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  // 1. Estado Inicial con Persistencia
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });

  // 2. Lógica de Actualización de Usuario (V1)
  const updateCurrentUser = useCallback((userData) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setCurrentUser(userData);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("emprendimientoCache");
      setCurrentUser(null);
    }
  }, []);

  const handleLogout = useCallback(() => {
    updateCurrentUser(null);
  }, [updateCurrentUser]);

  // 3. Sincronización entre Pestañas y Limpieza (V1)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Verificación de seguridad cada segundo
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <TopBar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onUpdateUser={updateCurrentUser} 
      />

      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={<Landing />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/emprendimientos" element={<Sellers />} />
        <Route path="/emprendimiento/:id" element={<PublicProfile />} />
        <Route path="/sobreNosotros" element={<AboutUs />} />
        <Route path="/detalle/:id" element={<ProductDetailPage />} />
        <Route path="/registrar" element={<Register />} />
        <Route path="/vender" element={<Login onLoginSuccess={updateCurrentUser} />} />

        {/* --- RUTAS PROTEGIDAS (USUARIO) --- */}
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <Profile 
                user={currentUser} 
                onUpdateUser={updateCurrentUser} 
              />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/perfil/producto/nuevo" 
          element={
            <ProtectedRoute>
              <Profile user={currentUser} onUpdateUser={updateCurrentUser} />
            </ProtectedRoute>
          } 
        />

        {/* --- RUTAS PROTEGIDAS (ADMIN) - Estructura V2 --- */}
        <Route 
          path="/Admin" 
          element={
            <ProtectedRoute requiredRole="Administrador">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Sub-rutas que se renderizan dentro AdminLayout */}
          <Route path="entrepreneurship-applications" element={<EntrepreneurshipApplications />} />
          <Route path="activity-management" element={<ActivityManagement />} />
          <Route path="categories" element={<CategoryManagement/>} />
        </Route>

        {/* --- RUTAS DE ERROR --- */}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/bad-request" element={<BadRequest />} />
        <Route path="/internal-server-error" element={<InternalServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </Router>
  );
}
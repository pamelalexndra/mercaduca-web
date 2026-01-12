import React, { useEffect, useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Navigate } from "react-router-dom";
import TopBar from "./components/TopBar";
import Landing from "./components/Landing";
import Catalog from "./components/Catalog";
import Sellers from "./components/Entrepreneurship";
import AboutUs from "./components/AboutUs";
import ProductDetailPage from "./components/ProductDetail/ProductDetailPage";
import Login from "./components/Login";
import Footer from "./components/Footer";
import Profile from "./components/Profile";
import PublicProfile from "./components/PublicProfile";
import NotFound from "./components/ErrorPages/NotFound";
import Forbidden from "./components/ErrorPages/Forbidden";
import InternalServerError from "./components/ErrorPages/InternalServerError";
import BadRequest from "./components/ErrorPages/BadRequest";
import Register from "./components/Register";
import AdminProfile from "./components/AdminProfile";
import ProtectedRoute from "./components/ProtectedRoute";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const updateCurrentUser = useCallback((userData) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setCurrentUser(userData);
    } else {
      localStorage.removeItem("user");
      setCurrentUser(null);
    }
  }, []);

  const handleLoginSuccess = useCallback(
    (userData) => {
      updateCurrentUser(userData);
    },
    [updateCurrentUser]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("emprendimientoCache");
    updateCurrentUser(null);
  }, [updateCurrentUser]);

  const handleProfileLoaded = useCallback(
    (profileData) => {
      if (profileData) {
        updateCurrentUser(profileData);
      }
    },
    [updateCurrentUser]
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

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
        <Route path="/" element={<Landing />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/emprendimientos" element={<Sellers />} />
        <Route path="/emprendimiento/:id" element={<PublicProfile />} />
        <Route path="/sobreNosotros" element={<AboutUs />} />
        <Route path="/detalle/:id" element={<ProductDetailPage />} />
        <Route
          path="/vender"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Profile
                user={currentUser}
                onProfileLoaded={handleProfileLoaded}
                onUpdateUser={updateCurrentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil/producto/nuevo"
          element={
            <ProtectedRoute>
              <Profile
                user={currentUser}
                onProfileLoaded={handleProfileLoaded}
                onUpdateUser={updateCurrentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="Administrador">
              <AdminProfile onUpdateUser={updateCurrentUser} />
            </ProtectedRoute>
          }
        />
        <Route path="/registrar" element={<Register />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/bad-request" element={<BadRequest />} />
        <Route
          path="/internal-server-error"
          element={<InternalServerError />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

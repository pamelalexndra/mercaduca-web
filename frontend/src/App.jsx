import React, { useEffect, useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
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

  const handleLoginSuccess = useCallback((userData) => {
    setCurrentUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    setCurrentUser(null);
  }, []);

  const handleProfileLoaded = useCallback((profileData) => {
    if (profileData) {
      setCurrentUser(profileData);
    }
  }, []);
  return (
    <Router>
      <ScrollToTop />
      <TopBar user={currentUser} onLogout={handleLogout} />

      <Routes>
        {" "}
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
            <Profile user={currentUser} onProfileLoader={handleProfileLoaded} />
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
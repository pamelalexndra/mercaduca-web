import React, { useState, useEffect } from "react";
import { Users, Search } from "lucide-react";
import EntrepreneursPanel from "./EntrepreneursPanel";
import { API_BASE_URL } from "../../../utils/api";

export default function EntrepreneursManagement() {
  const [emprendedores, setEmprendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmprendedorForEdit, setSelectedEmprendedorForEdit] =
    useState(null);
  const [error, setError] = useState("");

  // Obtener token de autenticación
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Headers de autenticación
  const getAuthHeaders = () => {
    const token = getToken();
    return token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  // Cargar todos los emprendedores
  const loadEmprendedores = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/user/profiles`, {
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
    } catch (error) {
      setError(`Error al cargar emprendedores: ${error.message}`);
      setEmprendedores([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar emprendedores al montar el componente
  useEffect(() => {
    const token = getToken();
    if (token) {
      loadEmprendedores();
    } else {
      setError("No estás autenticado. Por favor, inicia sesión.");
      setLoading(false);
    }
  }, []);

  // Filtrar emprendedores por búsqueda
  const filteredEmprendedores = emprendedores.filter((emprendedor) => {
    const searchLower = searchTerm.toLowerCase();
    const nombre = (emprendedor.nombres || "").toLowerCase();
    const apellidos = (emprendedor.apellidos || "").toLowerCase();
    const correo = (emprendedor.correo || "").toLowerCase();
    const usuario = (emprendedor.usuario || "").toLowerCase();

    return (
      nombre.includes(searchLower) ||
      apellidos.includes(searchLower) ||
      correo.includes(searchLower) ||
      usuario.includes(searchLower)
    );
  });

  // Estadísticas
  const totalEmprendedores = emprendedores.length;

  return (
    <div className="bg-gray-50 font-montserrat text-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header - solo se muestra si no estamos viendo un perfil individual */}
        {!selectedEmprendedorForEdit && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Desktop layout */}
              <div className="hidden lg:flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="font-poppins text-3xl text-[#557051] font-bold mb-2">
                    Gestión de emprendedores
                  </h1>
                  <p className="text-gray-600 mb-6 max-w-2xl">
                    Administra los emprendedores registrados en{" "}
                    <span className="font-semibold text-[#557051]">
                      MercadUCA
                    </span>
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-100">
                      <p className="text-sm text-gray-600 mb-1">
                        Total registrados
                      </p>
                      <p className="text-2xl font-bold text-[#557051]">
                        {totalEmprendedores}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile & Tablet layout */}
              <div className="lg:hidden">
                <div className="mb-6">
                  <h1 className="font-poppins text-2xl text-[#557051] font-bold mb-2">
                    Gestión de emprendedores
                  </h1>
                  <p className="text-gray-600">
                    Administra los emprendedores registrados en{" "}
                    <strong> MercadUCA</strong>
                  </p>
                </div>

                {/* Stats */}
                <div className="mb-6">
                  <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-100 inline-block">
                    <p className="text-sm text-gray-600 mb-1">
                      Total registrados
                    </p>
                    <p className="text-2xl font-bold text-[#557051]">
                      {totalEmprendedores}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <EntrepreneursPanel
            emprendedores={filteredEmprendedores}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedEmprendedorForEdit={selectedEmprendedorForEdit}
            setSelectedEmprendedorForEdit={setSelectedEmprendedorForEdit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import Profile from "../../Profile";

const EntrepreneusPanel = ({
  emprendedores,
  searchTerm,
  setSearchTerm,
  selectedEmprendedorForEdit,
  setSelectedEmprendedorForEdit,
  loading,
}) => {
  const [error, setError] = useState("");

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

  if (selectedEmprendedorForEdit) {
    const emprendedorSeleccionado = emprendedores.find(
      (e) => (e.id_usuario || e.id) === selectedEmprendedorForEdit
    );

    if (!emprendedorSeleccionado) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Emprendedor no encontrado</p>
          <button
            onClick={() => setSelectedEmprendedorForEdit(null)}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Volver a la lista
          </button>
        </div>
      );
    }

    const adminUserData = {
      ...emprendedorSeleccionado,
      isAdminView: true,
      profile: {
        ...emprendedorSeleccionado,
        nombres: emprendedorSeleccionado.nombres,
        apellidos: emprendedorSeleccionado.apellidos,
        correo: emprendedorSeleccionado.correo,
        telefono: emprendedorSeleccionado.telefono,
        usuario: emprendedorSeleccionado.usuario,
        Rol: "Vendedor",
        id_usuario:
          emprendedorSeleccionado.id_usuario || emprendedorSeleccionado.id,
      },
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedEmprendedorForEdit(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver
            </button>
            <span className="text-gray-400">|</span>
            <span className="text-gray-700">
              Vista de administrador:{" "}
              <span className="font-medium">
                {emprendedorSeleccionado.nombres}{" "}
                {emprendedorSeleccionado.apellidos}
              </span>
            </span>
          </div>
        </div>

        <div className="p-0">
          <Profile
            user={adminUserData}
            onProfileLoaded={() => {}}
            disableActions={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-500">Cargando emprendedores...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar emprendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-4 top-3.5">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {filteredEmprendedores.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-500">
                {searchTerm
                  ? "No se encontraron emprendedores con ese nombre"
                  : "No hay emprendedores registrados"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmprendedores.map((emprendedor) => {
                const emprendedorId = emprendedor.id_usuario || emprendedor.id;
                const nombres = emprendedor.nombres || "Sin nombre";
                const apellidos = emprendedor.apellidos || "";
                const correo = emprendedor.correo || "Sin correo";
                const usuario = emprendedor.usuario || "sin_usuario";

                return (
                  <div
                    key={emprendedorId}
                    onClick={() => setSelectedEmprendedorForEdit(emprendedorId)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white cursor-pointer hover:border-gray-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-700 font-medium text-lg">
                          {nombres[0]?.toUpperCase() || "E"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {nombres} {apellidos}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {correo}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Usuario: {usuario}
                        </p>
                      </div>
                      <div className="text-gray-400">
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EntrepreneusPanel;

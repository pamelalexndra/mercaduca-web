import React, { useState } from "react";
import Profile from "../../Profile";

export default function EntrepreneursPanel({
  emprendedores,
  searchTerm,
  setSearchTerm,
  selectedEmprendedorForEdit,
  setSelectedEmprendedorForEdit,
  loading,
}) {
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
      (e) => (e.id_usuario || e.id) === selectedEmprendedorForEdit,
    );

    if (!emprendedorSeleccionado) {
      return (
        <div className="p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Emprendedor no encontrado
          </h3>
          <p className="text-gray-500 mb-6">
            El emprendedor que buscas no está disponible.
          </p>
          <button
            onClick={() => setSelectedEmprendedorForEdit(null)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#557051] hover:bg-[#455a42] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#557051] transition-colors duration-200"
          >
            <svg
              className="mr-2 h-4 w-4"
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
            Volver a la lista
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
      <div className="bg-white">
        {/* Back button for mobile */}
        <div className="lg:hidden border-b border-gray-200">
          <div className="px-4 py-3">
            <button
              onClick={() => setSelectedEmprendedorForEdit(null)}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <svg
                className="mr-2 h-4 w-4"
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
          </div>
        </div>

        {/* Profile view */}
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

  const handleViewProfile = (emprendedorId) => {
    if (setSelectedEmprendedorForEdit) {
      setSelectedEmprendedorForEdit(emprendedorId);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-flex flex-col items-center">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-[#557051] border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600">Cargando emprendedores...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Search for small screens */}
          <div className="lg:hidden mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
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
              <input
                type="text"
                placeholder="Buscar emprendedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#557051] focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Clear search</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {filteredEmprendedores.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto max-w-md">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {searchTerm
                    ? "No se encontraron resultados"
                    : "No hay emprendedores registrados"}
                </h3>
                <p className="mt-2 text-gray-500">
                  {searchTerm
                    ? "No hay emprendedores que coincidan con tu búsqueda."
                    : "Aún no hay emprendedores registrados en el sistema."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredEmprendedores.map((emprendedor) => {
                  const emprendedorId =
                    emprendedor.id_usuario || emprendedor.id;
                  const nombres = emprendedor.nombres || "Sin nombre";
                  const apellidos = emprendedor.apellidos || "";
                  const correo = emprendedor.correo || "Sin correo";
                  const usuario = emprendedor.usuario || "sin_usuario";
                  const telefono = emprendedor.telefono || "";
                  const inicial = nombres[0]?.toUpperCase() || "E";

                  return (
                    <div
                      key={emprendedorId}
                      className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-[#557051] hover:shadow-lg transition-all duration-200 cursor-pointer"
                      onClick={() => handleViewProfile(emprendedorId)}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center border border-gray-200 group-hover:border-[#557051] transition-colors">
                            <span className="text-xl font-semibold text-gray-700">
                              {inicial}
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {nombres} {apellidos}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="truncate">{correo}</span>
                            </div>
                            {telefono && (
                              <div className="flex items-center text-sm text-gray-600">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                                <span>{telefono}</span>
                              </div>
                            )}
                            <div className="flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span className="truncate">
                                Usuario: {usuario}
                              </span>
                            </div>
                          </div>

                          {/* View profile button */}
                          <div className="mt-4">
                            <span className="inline-flex items-center text-sm font-medium text-[#557051] group-hover:text-[#455a42]">
                              Ver perfil
                              <svg
                                className="ml-1.5 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Results count */}
              <div className="mt-8 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  Mostrando{" "}
                  <span className="font-medium">
                    {filteredEmprendedores.length}
                  </span>{" "}
                  de <span className="font-medium">{emprendedores.length}</span>{" "}
                  emprendedores
                  {searchTerm && (
                    <span>
                      {" "}
                      para "<span className="font-medium">{searchTerm}</span>"
                    </span>
                  )}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

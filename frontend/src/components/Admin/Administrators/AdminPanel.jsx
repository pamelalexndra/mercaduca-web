import React, { useState, useEffect } from "react";

const AdminItem = ({ admin, onEdit, onDelete, showConfirmation }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adminId = admin.id_usuario || admin.id;
  const nombres = admin.nombres || "";
  const apellidos = admin.apellidos || "";
  const correo = admin.correo || "";
  const usuario = admin.usuario || "";
  const telefono = admin.telefono || "";
  const inicial = nombres[0]?.toUpperCase() || "A";

  return (
    <div className="border border-gray-200 rounded-lg p-4 relative hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-[#557051]/20 to-[#6a8a62]/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-[#557051] font-medium text-lg">{inicial}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 truncate">
              {nombres} {apellidos}
            </h3>
          </div>
          <p className="text-sm text-gray-600 truncate">{correo}</p>
          <p className="text-xs text-gray-500 truncate">Usuario: {usuario}</p>
        </div>

        {/* Botón de menú de tres puntos */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Opciones"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onEdit(admin);
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Editar
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  showConfirmation(
                    "delete_admin",
                    adminId,
                    "Eliminar Administrador",
                    `¿Estás seguro de que deseas eliminar al administrador ${nombres} ${apellidos}?`,
                    () => onDelete(adminId, `${nombres} ${apellidos}`)
                  );
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({
  admins,
  loading,
  onEditAdmin,
  onDeleteAdmin,
  showConfirmation,
}) => {
  const [error, setError] = useState("");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="animate-spin h-8 w-8 text-[#557051]"
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
          <p className="text-gray-500">Cargando administradores...</p>
        </div>
      </div>
    );
  }

  // Validar que admins sea un array
  if (!admins || !Array.isArray(admins)) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos de administradores disponibles
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

      {admins.length >= 3 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm">
              Se ha alcanzado el límite máximo de 3 administradores.
            </p>
          </div>
        </div>
      )}

      {admins.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay administradores registrados
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => (
            <AdminItem
              key={admin.id_usuario || admin.id}
              admin={admin}
              onEdit={onEditAdmin}
              onDelete={onDeleteAdmin}
              showConfirmation={showConfirmation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

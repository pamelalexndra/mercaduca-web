import React from "react";
import RegisterAdmin from "./RegisterAdmin";

const AdminForm = ({ adminToEdit, onClose, onSuccess, loadingAdmins }) => {
  const [error, setError] = React.useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {adminToEdit ? "Editar administrador" : "Agregar administrador"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mx-6 mt-4">
              {error}
            </div>
          )}

          <RegisterAdmin
            initialData={adminToEdit || null}
            onRegisterSuccess={(adminData) => {
              onSuccess(adminData);
            }}
            switchToLogin={() => onClose()}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminForm;
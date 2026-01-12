import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../utils/api.js";
import ActivityDetail from "./ActivityDetail";

const ActivitiesPanel = ({
  activities,
  selectedActivity,
  setSelectedActivity,
  showConfirmation,
  loading,
  handleDeleteActivity, // Recibir esta función del padre
  handleEditActivity, // Recibir esta función del padre (para abrir el formulario)
}) => {
  const [error, setError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchActivityDetail = async (id) => {
    try {
      setDetailLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/activities/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar los detalles de la actividad");
      }

      const activityData = await response.json();
      setSelectedActivity(activityData);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleActivityClick = (activity) => {
    // Si ya tenemos todos los datos de la actividad, usarlos directamente
    if (activity.descripcion || activity.Descripcion) {
      setSelectedActivity(activity);
    } else {
      // Si no tenemos los detalles completos, hacer fetch
      const id = activity.id_actividad || activity.id;
      fetchActivityDetail(id);
    }
  };

  const handleDeleteClick = (activity) => {
    const id = activity.id_actividad || activity.id;
    const name = activity.nombre || activity.Nombre || "esta actividad";

    showConfirmation(
      "delete_activity",
      id,
      "Eliminar Actividad",
      `¿Estás seguro de que deseas eliminar la actividad "${name}"?`,
      () => {
        if (handleDeleteActivity) {
          handleDeleteActivity(id);
        }
      }
    );
  };

  const handleEditClick = (activity) => {
    if (handleEditActivity) {
      handleEditActivity(activity);
    }
  };

  if (selectedActivity) {
    return (
      <ActivityDetail
        activity={selectedActivity}
        onBack={() => setSelectedActivity(null)}
        onEdit={() => handleEditClick(selectedActivity)}
        onDelete={() => handleDeleteClick(selectedActivity)}
        loading={detailLoading}
      />
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
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
            <p className="text-gray-500">Cargando actividades...</p>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay actividades
          </h3>
          <p className="text-gray-500">
            Comienza agregando una nueva actividad
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <div
              key={activity.id_actividad || activity.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md cursor-pointer transition-shadow group"
              onClick={() => handleActivityClick(activity)}
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {activity.imagen_url ? (
                  <img
                    src={activity.imagen_url}
                    alt={activity.nombre || activity.Nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">
                  {activity.nombre || activity.Nombre}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {activity.descripcion ||
                    activity.Descripcion ||
                    "Sin descripción"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivitiesPanel;

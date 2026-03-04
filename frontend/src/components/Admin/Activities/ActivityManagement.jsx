import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle } from "lucide-react";
import SuccessDialog from "../../SuccessDialog";
import ConfirmationDialog from "../../ConfirmationDialog";
import { activityService } from "../../../services/activity.service";

export default function ActivityManagement() {
  const [actividades, setActividades] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actividadAEliminar, setActividadAEliminar] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await activityService.getAll();
        setActividades(data);
      } catch (err) {
        setError("Error al cargar las actividades");
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const datosParaEnviar = {
        nombre: nombre,
        descripcion: descripcion,
        imagen_url: imagenUrl,
      };

      const res = await activityService.create(datosParaEnviar);

      if (res && res.data) {
        setActividades((prev) => [res.data, ...prev]);
        setSuccessMessage("Actividad publicada con éxito.");
        setShowSuccess(true);
        resetForm();
      } else {
        setError(res?.message || "Error al crear la actividad");
      }
    } catch (err) {
      setError(err.message || "Error al publicar la actividad");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setImagenUrl("");
  };

  const confirmarEliminacion = (actividad) => {
    setActividadAEliminar(actividad);
    setShowConfirm(true);
  };

  const handleEliminar = async () => {
    setError("");

    try {
      await activityService.delete(actividadAEliminar.id_actividad);

      setActividades((prevActividades) =>
        prevActividades.filter(
          (a) => a.id_actividad !== actividadAEliminar.id_actividad,
        ),
      );

      setSuccessMessage("Actividad eliminada con éxito.");
      setShowSuccess(true);

      setShowConfirm(false);
      setActividadAEliminar(null);
    } catch (err) {
      setError(err.message || "Error al eliminar la actividad");
      setShowConfirm(false);
      setActividadAEliminar(null);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccess(false);
    setSuccessMessage("");
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setActividadAEliminar(null);
  };

  return (
    <div className="bg-cream font-montserrat text-gray-800 min-h-screen p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="bg-white rounded-3xl shadow-xl p-10">
          <h1 className="font-poppins text-3xl text-[#557051] font-bold">
            Gestión de Actividades UCA
          </h1>
          <p className="font-montserrat text-gray-500 mt-1">
            Administra los eventos de <strong>MercadUCA</strong>
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* LISTADO */}
          <section className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <h2 className="font-loubag text-xl text-[#557051]">
              Actividades programadas
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {actividades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay actividades programadas
                </div>
              ) : (
                actividades.map(
                  (act) =>
                    act && (
                      <div
                        key={act.id_actividad}
                        className="bg-white rounded-3xl shadow-md p-6 border border-gray-100 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-4">
                          {act.imagen_url && (
                            <img
                              src={act.imagen_url}
                              alt="preview"
                              className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
                            />
                          )}
                          <div>
                            <h3 className="font-poppins text-lg font-bold text-gray-800">
                              {act.nombre}
                            </h3>
                            <p className="text-sm text-gray-500 max-w-lg">
                              {act.descripcion}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => confirmarEliminacion(act)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 size={20} className="text-red-500" />
                        </button>
                      </div>
                    ),
                )
              )}
            </div>
          </section>

          {/* FORMULARIO */}
          <section className="lg:col-span-1 order-1 lg:order-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl shadow-xl p-8 sticky top-10 border border-gray-50"
            >
              <h2 className="font-loubag text-xl text-[#557051] mb-6 flex items-center gap-2">
                <PlusCircle size={20} /> Nueva actividad
              </h2>
              <div className="space-y-5">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#f4f4f2] rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#557051] focus:outline-none"
                  placeholder="Nombre del evento"
                  required
                />
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-[#f4f4f2] rounded-2xl px-4 py-3 text-sm h-32 resize-none focus:ring-2 focus:ring-[#557051] focus:outline-none"
                  placeholder="Descripción"
                  required
                />

                <div className="space-y-2">
                  <input
                    type="text"
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    className="w-full bg-[#f4f4f2] rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#557051] focus:outline-none"
                    placeholder="Agregar enlace de imagen"
                    required
                  />

                  <div className="bg-[#f4f4f2] border border-blue-100 rounded-xl p-3">
                    <p className="text-xs text-gray-600 flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Para generar el enlace de tu imagen se recomienda usar{" "}
                        <a
                          href="https://imgbb.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#557051] hover:text-[#3a4d36] underline font-medium transition-colors"
                        >
                          imgbb.com
                        </a>{" "}
                        para continuar con el proceso de creación.
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#557051] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#455a42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
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
                        />
                      </svg>
                      Publicando...
                    </>
                  ) : (
                    "Publicar actividad"
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <SuccessDialog
        show={showSuccess}
        message={successMessage}
        onConfirm={handleCloseSuccessDialog}
      />

      <ConfirmationDialog
        show={showConfirm}
        message={`¿Estás seguro de eliminar "${actividadAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleEliminar}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

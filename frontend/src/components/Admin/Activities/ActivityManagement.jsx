import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle, Upload, X, Loader2 } from "lucide-react";
import SuccessDialog from "../../SuccessDialog";
import ConfirmationDialog from "../../ConfirmationDialog";
import { activityService } from "../../../services/activity.service";

export default function ActivityManagement() {
  const [actividades, setActividades] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actividadAEliminar, setActividadAEliminar] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await activityService.getAll();
        setActividades(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Error al cargar las actividades");
      }
    };
    load();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona un archivo de imagen válido");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen no puede superar los 10MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setSelectedImage(file);
    setError("");
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setSelectedImage(null);
  };

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setImagePreview(null);
    setSelectedImage(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);

      if (selectedImage) {
        formData.append("imagen", selectedImage);
      } else if (!imagePreview && !editingId) {
        setError("La imagen es obligatoria");
        setLoading(false);
        return;
      }

      let res;
      if (editingId) {
        res = await activityService.update(editingId, formData);
      } else {
        res = await activityService.create(formData);
      }

      if (res && res.data) {
        const updatedActivities = await activityService.getAll();
        setActividades(
          Array.isArray(updatedActivities) ? updatedActivities : [],
        );
        setSuccessMessage(
          editingId
            ? "Actividad actualizada con éxito."
            : "Actividad publicada con éxito.",
        );
        setShowSuccess(true);
        resetForm();
      } else {
        setError(res?.error || "Error al guardar la actividad");
      }
    } catch (err) {
      setError(err.message || "Error al guardar la actividad");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (actividad) => {
    setEditingId(actividad.id_actividad);
    setNombre(actividad.nombre);
    setDescripcion(actividad.descripcion || "");
    if (actividad.imagen_url) {
      setImagePreview(actividad.imagen_url);
    }
    setSelectedImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmarEliminacion = (actividad) => {
    setActividadAEliminar(actividad);
    setShowConfirm(true);
  };

  const handleEliminar = async () => {
    setError("");

    try {
      await activityService.delete(actividadAEliminar.id_actividad);

      const updatedActivities = await activityService.getAll();
      setActividades(Array.isArray(updatedActivities) ? updatedActivities : []);

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

  const handleCancelEdit = () => {
    resetForm();
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
                        <div className="flex items-center gap-4 flex-1">
                          {act.imagen_url && (
                            <img
                              src={act.imagen_url}
                              alt="preview"
                              className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-poppins text-lg font-bold text-gray-800">
                              {act.nombre}
                            </h3>
                            <p className="text-sm text-gray-500 max-w-lg">
                              {act.descripcion}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(act)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <svg
                              className="w-5 h-5 text-[#557051]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => confirmarEliminacion(act)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Trash2 size={20} className="text-red-500" />
                          </button>
                        </div>
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
                <PlusCircle size={20} />
                {editingId ? "Editar actividad" : "Nueva actividad"}
              </h2>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="mb-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X size={14} /> Cancelar edición
                </button>
              )}

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

                {/* Sección de carga de imagen */}
                <div className="space-y-2">
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#557051] transition-colors">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="w-12 h-12 text-gray-400" />
                        <span className="text-gray-600">
                          Haz clic para seleccionar una imagen
                        </span>
                        <span className="text-gray-400 text-sm">
                          Formatos permitidos: JPG, PNG, GIF, WebP (Máx. 10MB)
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Vista previa"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleClearImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                        className="mt-3 w-full px-4 py-2 border border-[#557051] text-[#557051] rounded-lg hover:bg-[#557051] hover:text-white transition"
                      >
                        Cambiar imagen
                      </button>
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#557051] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#455a42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2 text-white" />
                      {editingId ? "Actualizando..." : "Publicando..."}
                    </>
                  ) : editingId ? (
                    "Actualizar actividad"
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
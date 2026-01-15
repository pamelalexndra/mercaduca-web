import React, { useEffect, useState } from "react";
import { Trash2, Calendar, PlusCircle, ImageIcon } from "lucide-react";
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

  useEffect(() => {
    const load = async () => {
      try {
        const data = await activityService.getAll();
        setActividades(data);
      } catch (err) { console.error("Error al cargar:", err); }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Enviando datos:", { nombre, descripcion, imagen_url: imagenUrl });

      const datosParaEnviar = {
        nombre: nombre,
        descripcion: descripcion,
        imagen_url: imagenUrl
      };
      const res = await activityService.create(datosParaEnviar);

      console.log("Respuesta del servidor:", res);

      if (res && res.data) {
        setActividades((prev) => [res.data, ...prev]);
        setShowSuccess(true);
        resetForm();
      } else {
        console.error("El servidor no devolvió 'data':", res);
      }
    } catch (err) {
      console.error("Error en la petición: ", err);
      alert("Error al publicar la actividad");
    }
  };

  const resetForm = () => {
    setNombre(""); setDescripcion(""); setImagenUrl("");
  };

  const confirmarEliminacion = (actividad) => {
    setActividadAEliminar(actividad);
    setShowConfirm(true);
  };

 const handleEliminar = async () => {
  try {
    console.log("Intentando eliminar actividad con ID:", actividadAEliminar.id_actividad);
    
    const res = await activityService.delete(actividadAEliminar.id_actividad);
    
    console.log("Respuesta del servidor al eliminar:", res);

    setActividades((prevActividades) => 
      prevActividades.filter(a => a.id_actividad !== actividadAEliminar.id_actividad)
    );

    setShowConfirm(false);
    setActividadAEliminar(null);

  } catch (err) {
    console.error("Error al eliminar:", err);
    alert("Hubo un problema al eliminar la actividad de la base de datos.");
  }
};

  return (
    <div className="bg-cream font-montserrat text-gray-800 min-h-screen p-10">
      <div className="max-w-6xl mx-auto space-y-10">

        <header className="bg-white rounded-3xl shadow-xl p-10">
          <h1 className="font-poppins text-3xl text-[#557051] font-bold">Gestión de Actividades UCA</h1>
          <p className="font-montserrat text-gray-500 mt-1">Administra los eventos de <strong>MercadUCA</strong></p>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* LISTADO */}
          <section className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <h2 className="font-loubag text-xl text-[#557051]">Actividades Programadas</h2>
            <div className="grid gap-4">
              {actividades.map((act) => (
                act && (
                  <div key={act.id_actividad} className="bg-white rounded-3xl shadow-md p-6 border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {act.imagen_url && (
                        <img
                          src={act.imagen_url}
                          alt="preview"
                          className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
                        />
                      )}
                      <div>
                        <h3 className="font-poppins text-lg font-bold text-gray-800">{act.nombre}</h3>
                        <p className="text-sm text-gray-500 max-w-lg">{act.descripcion}</p>
                      </div>
                    </div>
                    <button onClick={() => confirmarEliminacion(act)} className="...">
                      <Trash2 size={20} />
                    </button>
                  </div>
                )
              ))}
            </div>
          </section>

          {/* FORMULARIO */}
          <section className="lg:col-span-1 order-1 lg:order-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 sticky top-10 border border-gray-50">
              <h2 className="font-loubag text-xl text-[#557051] mb-6 flex items-center gap-2"><PlusCircle size={20} /> Nueva Actividad</h2>
              <div className="space-y-5">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#f4f4f2] rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#557051]"
                  placeholder="Nombre del evento"
                  required
                />
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-[#f4f4f2] rounded-2xl px-4 py-3 text-sm h-32 resize-none"
                  placeholder="Descripción"
                  required
                />
                <div className="relative">
                  <input
                    type="text"
                    value={imagenUrl} 
                    onChange={(e) => setImagenUrl(e.target.value)} 
                    className="w-full bg-[#f4f4f2] rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#557051]"
                    placeholder="Agregar enlace de imagen"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-[#557051] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#455a42] transition-transform active:scale-95">
                  Publicar Actividad
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <SuccessDialog show={showSuccess} message="La actividad se ha publicado correctamente." onConfirm={() => setShowSuccess(false)} />
      <ConfirmationDialog
        show={showConfirm}
        message={`¿Estás seguro de eliminar "${actividadAEliminar?.nombre}"?`}
        onConfirm={handleEliminar}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  getEntrepreneurshipApplications,
  approveEntrepreneurshipApplication,
  rejectEntrepreneurshipApplication,
} from "../../services/entrepreneurship.service";

export default function EntrepreneurshipApplications() {

  const [solicitudes, setSolicitudes] = useState([]);

  const [actual, setActual] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [comentarioCOP, setComentarioCOP] = useState("");
  const [resultados, setResultados] = useState([]);

  const [mostrarError, setMostrarError] = useState(false);
  const [cargando, setCargando] = useState(false);
  useEffect(() => {
    const cargarSolicitudes = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setCargando(true);
        const data = await getEntrepreneurshipApplications(token);

        setSolicitudes(
          data.data.map((s) => ({
            id: s.id_solicitud,
            nombre: `${s.nombres} ${s.apellidos}`,
            usuario: s.usuario,
            telefono: s.telefono,
            producto: "Emprendimiento en revisión",
            categoria: "Pendiente",
            razon: s.descripcion_solicitud,
          }))
        );
      } catch (error) {
        console.error("Error cargando solicitudes:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarSolicitudes();
  }, []);

  const verDetalle = (solicitud) => {
    setActual(solicitud);
    setComentarioCOP("");
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setActual(null);
  };

  const procesar = async (estado) => {
    if (!comentarioCOP.trim()) {
      setMostrarError(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      if (estado === "Aprobado") {
        await approveEntrepreneurshipApplication(
          actual.id,
          comentarioCOP,
          token
        );
      } else {
        await rejectEntrepreneurshipApplication(
          actual.id,
          comentarioCOP,
          token
        );
      }

      setResultados([
        ...resultados,
        {
          estado,
          nombre: actual.nombre,
          comentario: comentarioCOP,
          fecha: new Date().toLocaleDateString(),
        },
      ]);

      setSolicitudes(solicitudes.filter((s) => s.id !== actual.id));
      cerrarModal();
    } catch (error) {
      alert("Ocurrió un error al procesar la solicitud.");
    }
  };

  return (
    <div className="bg-cream font-montserrat text-gray-800 min-h-screen p-10">
      <form className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        <header className="mb-10">
          <h1 className="font-poppins text-3xl text-[#557051] font-bold">
            Centro de Orientación Profesional
          </h1>
          <p className="font-montserrat text-gray-500 mt-1">
            Gestión de solicitudes para vendedores en <strong>MercadUCA</strong>
          </p>
        </header>

        <section className="mb-14">
          <h2 className="font-loubag text-xl text-[#557051] mb-4">
            Solicitudes pendientes
          </h2>

          {cargando && (
            <p className="font-montserrat text-sm text-gray-500 mb-4">
              Cargando solicitudes...
            </p>
          )}

          {!cargando && solicitudes.length === 0 && (
            <p className="font-montserrat text-sm text-gray-500">
              No hay solicitudes pendientes.
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-6 max-h-[420px] overflow-y-auto pr-2">
            {solicitudes.map((s) => (
              <div
                key={s.id}
                className="bg-[#f4f4f2] border border-gray-200 rounded-2xl p-5"
              >
                <p className="font-loubag text-lg font-bold">{s.nombre}</p>

                <p className="font-montserrat text-xs text-gray-500">
                  Categoría: {s.categoria}
                </p>

                <p className="font-montserrat text-sm font-bold mt-2">
                  {s.producto}
                </p>

                <p className="font-montserrat text-sm text-gray-600 mt-1">
                  {s.razon.slice(0, 60)}...
                </p>

                <button
                  type="button"
                  onClick={() => verDetalle(s)}
                  className="mt-4 px-4 py-2 bg-[#557051] text-white rounded-xl text-sm font-montserrat"
                >
                  Ver detalle
                </button>
              </div>
            ))}
          </div>
        </section>
      </form>

      {mostrarModal && actual && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl relative">
            <button
              type="button"
              onClick={cerrarModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-montserrat"
            >
              ✕
            </button>

            <h3 className="font-poppins text-2xl text-[#557051] font-bold">
              {actual.nombre}
            </h3>

            <p className="font-montserrat text-sm text-gray-600 mb-6">
              Emprendimiento:{" "}
              <span className="font-bold">{actual.producto}</span>
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-[#f4f4f2] p-4 rounded-xl">
                <p className="font-montserrat text-xs text-gray-500">Usuario</p>
                <p className="font-montserrat font-medium">
                  {actual.usuario}
                </p>
              </div>
              <div className="bg-[#f4f4f2] p-4 rounded-xl">
                <p className="font-montserrat text-xs text-gray-500">
                  Teléfono
                </p>
                <p className="font-montserrat font-medium">
                  {actual.telefono}
                </p>
              </div>
            </div>

            <div className="bg-[#f4f4f2] p-4 rounded-xl mb-4">
              <p className="font-montserrat text-xs text-gray-500">
                Razón para vender
              </p>
              <p className="font-montserrat text-sm mt-1">{actual.razon}</p>
            </div>

            <div className="mb-6">
              <label className="font-montserrat text-sm font-medium block mb-1">
                Comentario del COP
              </label>
              <textarea
                value={comentarioCOP}
                onChange={(e) => setComentarioCOP(e.target.value)}
                className="w-full bg-[#f4f4f2] border border-gray-300 rounded-xl p-3 text-sm font-montserrat"
                placeholder="Escriba el motivo de su decisión..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => procesar("Rechazado")}
                className="px-5 py-2 rounded-xl bg-[#C94A4A] text-white font-montserrat"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => procesar("Aprobado")}
                className="px-5 py-2 rounded-xl bg-[#557051] text-white font-montserrat"
              >
                Aprobar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarError && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            <h3 className="font-poppins text-lg font-bold text-[#557051] mb-3">
              Acción no permitida
            </h3>
            <p className="font-montserrat text-sm text-gray-600 mb-6">
              Para aprobar o rechazar una solicitud es obligatorio ingresar un
              comentario.
            </p>
            <button
              onClick={() => setMostrarError(false)}
              className="px-6 py-2 bg-[#557051] text-white rounded-xl font-montserrat"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
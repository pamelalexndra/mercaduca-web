let solicitudes = [];
let idCounter = 1;

export const getSolicitudes = () => solicitudes;

export const addSolicitud = (data) => {
  const nuevaSolicitud = {
    id: idCounter++,
    ...data,
    estado: "PENDIENTE",
    fecha: new Date(),
  };

  solicitudes.push(nuevaSolicitud);
  return nuevaSolicitud;
};

export const removeSolicitud = (id) => {
  solicitudes = solicitudes.filter((s) => s.id !== id);
};

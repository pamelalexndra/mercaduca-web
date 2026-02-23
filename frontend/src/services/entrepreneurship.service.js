const BASE_URL = import.meta.env.VITE_API_URL;

export const deleteEntrepreneurshipService = async (id, token) => {
  try {
    const response = await fetch(`${BASE_URL}/entrepreneurship/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar el emprendimiento");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getEntrepreneurshipApplications = async (token) => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/entrepreneurship-applications`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Error al obtener solicitudes de emprendimiento"
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const approveEntrepreneurshipApplication = async (
  id,
  comentario,
  token
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/entrepreneurship-applications/${id}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comentario }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Error al aprobar la solicitud de emprendimiento"
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const rejectEntrepreneurshipApplication = async (
  id,
  comentario,
  token
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/entrepreneurship-applications/${id}/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comentario }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Error al rechazar la solicitud de emprendimiento"
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
};

const BASE_URL = import.meta.env.VITE_API_URL;

export const deleteUserProfile = async (userId, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/profile/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, 
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al eliminar el perfil");
    }

    return data; 
  } catch (error) {
    throw error; 
  }
};
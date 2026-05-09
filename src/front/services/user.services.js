const API_URL = `${import.meta.env.VITE_BACKEND_URL}`;

export const registerUser = async (data) => {
  try {
    const response = await fetch(`${API_URL}/api/users`, {
      method: "POST",
      body: data,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || response?.message || "Failed to register user",
      );
    }

    return result;
  } catch (error) {
    throw error;
  }
};

export const activateAccount = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/activate-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || result?.message || "Failed to activate account",
      );
    }

    return result;
  } catch (error) {
    console.error("Error activating account:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || result?.message || "Failed to login");
    }

    return result;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const updatePasswordWithToken = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/api/update-pwd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ new_password: newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || result?.message || "Failed to update password",
      );
    }

    return result;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_URL}/api/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || result?.message || "Failed to request password reset",
      );
    }

    return result;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
};

export const getUserReservas = async (userId, token) => {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}/reservas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || result?.message || "Failed to fetch reservas",
      );
    }

    return result;
  } catch (error) {
    console.error("Error fetching user reservas:", error);
    throw error;
  }
};

// ============ SERVICIOS PARA ADMINISTRADORES ============

export const getAdminReportes = async (token, params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.complejo_id)
      queryParams.append("complejo_id", params.complejo_id);
    if (params.cancha_id) queryParams.append("cancha_id", params.cancha_id);
    if (params.fecha) queryParams.append("fecha", params.fecha);
    if (params.fecha_inicio)
      queryParams.append("fecha_inicio", params.fecha_inicio);
    if (params.fecha_fin) queryParams.append("fecha_fin", params.fecha_fin);
    if (params.estado) queryParams.append("estado", params.estado);

    const url = `${API_URL}/api/admin/reportes${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || result?.message || "Failed to fetch admin reports",
      );
    }

    return result;
  } catch (error) {
    console.error("Error fetching admin reports:", error);
    throw error;
  }
};

export const getAdminEstadisticas = async (token, fecha_inicio, fecha_fin) => {
  try {
    const queryParams = new URLSearchParams();

    if (fecha_inicio) queryParams.append("fecha_inicio", fecha_inicio);
    if (fecha_fin) queryParams.append("fecha_fin", fecha_fin);

    const url = `${API_URL}/api/admin/reportes/estadisticas${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || result?.message || "Failed to fetch admin statistics",
      );
    }

    return result;
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    throw error;
  }
};

export const getAdminComplejos = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/complejos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error || result?.message || "Failed to fetch admin complejos",
      );
    }

    return result;
  } catch (error) {
    console.error("Error fetching admin complejos:", error);
    throw error;
  }
};

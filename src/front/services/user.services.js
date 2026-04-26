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

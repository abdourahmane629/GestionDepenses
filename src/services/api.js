const API_URL = "https://gestiondepenses-backend-production.up.railway.app/api";

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const register = async (nom, email, password, role = "user") => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nom, email, password, role }),
  });
  return response.json();
};

export const loginWithGoogle = async (idToken) => {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  return response.json();
};

export const getExpenses = async (token) => {
  const response = await fetch(`${API_URL}/expenses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const addExpenseAPI = async (token, expense) => {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expense),
  });
  return response.json();
};

export const deleteExpenseAPI = async (token, id) => {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const getAllUsers = async (token) => {
  const response = await fetch(`${API_URL}/expenses/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const deleteUser = async (token, id) => {
  const response = await fetch(`${API_URL}/expenses/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const toggleBlockUser = async (token, id) => {
  const response = await fetch(`${API_URL}/expenses/users/${id}/toggle`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const getGlobalStats = async (token) => {
  const response = await fetch(`${API_URL}/expenses/stats/global`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const setPassword = async (token, password) => {
  const response = await fetch(`${API_URL}/auth/set-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });
  return response.json();
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

export const resetPassword = async (email, code, newPassword) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, newPassword }),
  });
  return response.json();
};

export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const updateProfile = async (token, data) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const changePassword = async (token, oldPassword, newPassword) => {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return response.json();
};

export const updateExpenseAPI = async (token, id, expense) => {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(expense),
  });
  return response.json();
};

export const getCategories = async (token) => {
  const response = await fetch(`${API_URL}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const addCategoryAPI = async (token, label, color) => {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ label, color }),
  });
  return response.json();
};

export const deleteCategoryAPI = async (token, id) => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
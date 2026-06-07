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
const API_URL = "/api/v1";


function getToken() {
  return localStorage.getItem("token");
}

async function apiFetch(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers,
    ...options,
  });

  return res.json();
}

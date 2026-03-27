const API_URL = "/api/v1";

export function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(endpoint, options = {}) {
  const headers = {
    ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
    ...options.headers,
  };

  // Only force application/json if it's not FormData.
  // The browser automatically sets Content-Type boundary for FormData.
  if (!options.isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type");
  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = { msg: await res.text() };
  }
  
  if (!res.ok) {
    throw new Error(data.msg || data.message || "An error occurred");
  }

  return data;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error");

  errorBox.textContent = "";

  if (!email || !password) {
    errorBox.textContent = "Email and password are required";
    return;
  }

  if (!isValidEmail(email)) {
    errorBox.textContent = "Please enter a valid email address";
    return;
  }

  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    errorBox.textContent = data.msg || "Invalid email or password";
    return;
  }

  localStorage.setItem("token", data.token);

  let role = "user";
  if (data.user && data.user.role) role = data.user.role;
  if (data.role) role = data.role;

  localStorage.setItem("role", role);
  localStorage.setItem("userId", data.user?._id || "");

  window.location.href = "/index.html";
}

async function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error");

  errorBox.textContent = "";

  if (!name || !email || !password) {
    errorBox.textContent = "All fields are required";
    return;
  }

  if (!isValidEmail(email)) {
    errorBox.textContent = "Please enter a valid email address";
    return;
  }

  if (password.length < 6) {
    errorBox.textContent = "Password must be at least 6 characters";
    return;
  }

  const res = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    errorBox.textContent = data.msg || "Registration failed";
    return;
  }

  window.location.href = "/login.html";
}

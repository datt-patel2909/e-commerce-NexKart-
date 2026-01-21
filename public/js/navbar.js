const navbar = document.getElementById("navbar");

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

let links = `
  <a href="/index.html" class="nav-link">Products</a>
`;

if (token && role === "user") {
  links += `
    <a href="/cart.html" class="nav-link cart-link">
      <span class="cart-icon">🛒</span>
      <span id="cartCount" class="cart-badge">0</span>
    </a>
    <a href="/orders.html" class="nav-link">Orders</a>
  `;
}

if (token && role === "admin") {
  links += `
    <a href="/admin.html" class="nav-link">Manage Products</a>
    <a href="/admin-orders.html" class="nav-link">Manage Orders</a>
  `;
}

let action = token
  ? `<button id="themeToggle" class="theme-toggle" onclick="toggleTheme()">
      <span id="themeIcon">🌙</span>
      </button>

     <button class="nav-btn" onclick="logout()">Logout</button>`
  : `<button id="themeToggle" class="theme-toggle" onclick="toggleTheme()">
     <span id="themeIcon">🌙</span>
     </button>
    <a href="/login.html" class="nav-btn">Login</a>`;

navbar.innerHTML = `
  <div class="nav-container">
    <div class="nav-logo">NexKart</div>

    <div class="nav-links" id="navLinks">
      ${links}
    </div>

    <div class="nav-actions">
      ${action}
      <button class="hamburger" onclick="toggleMenu()">☰</button>
    </div>
  </div>
`;

async function loadCartCount() {
  if (!token || role !== "user") return;

  try {
    const res = await fetch("/api/v1/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    const count = data.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
    const badge = document.getElementById("cartCount");
    if (badge) badge.textContent = count;
  } catch (e) {}
}

function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("show");
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");

  localStorage.setItem("theme", isDark ? "dark" : "light");

  document.getElementById("themeIcon").textContent = isDark ? "☀️" : "🌙";
}

(function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
    const icon = document.getElementById("themeIcon");
    if (icon) icon.textContent = "☀️";
  }
})();


if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}
function logout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.replace("/login.html");
}


loadCartCount();

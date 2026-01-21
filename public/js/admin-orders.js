if (!localStorage.getItem("token") || localStorage.getItem("role") !== "admin") {
  window.location.href = "/login.html";
}

let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const pageSize = 6;

async function loadOrders() {
  const res = await fetch("/api/v1/order", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
const data = await res.json();
allOrders = Array.isArray(data.order) ? data.order : [];
allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
filteredOrders = [...allOrders];
applyOrderSort();
currentPage = 1;
}

function applyOrderSort() {
  const sortValue = document.getElementById("orderSort").value;

  if (sortValue === "latest") {
    filteredOrders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  if (sortValue === "oldest") {
    filteredOrders.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  currentPage = 1;
  renderOrders();
}


function renderOrders() {
  const container = document.getElementById("orders");

  const start = (currentPage - 1) * pageSize;
  const pageOrders = filteredOrders.slice(start, start + pageSize);

  if (!pageOrders.length) {
    container.innerHTML = "<p>No orders found</p>";
    return;
  }
function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

  container.innerHTML = pageOrders.map(order => `
    <div class="card">
      
      <h3>Order ID: ORD-${order._id.slice(-6).toUpperCase()}</h3>
      <p>
  <b>Ordered On:</b>
  ${formatDateTime(order.createdAt)}
</p>
      <p><b>User:</b>
        ${order.user?.name ?? "Deleted User"}
        (${order.user?.email ?? "N/A"})
      </p>

      <p><b>Total:</b> ₹${order.totalPrice ?? order.totalprice ?? 0}</p>

      <p>
        <b>Status:</b>
        <span class="status ${order.status}">${order.status}</span>
      </p>

      <label>
        <b>Change:</b>
        <select onchange="updateStatus('${order._id}', this.value)">
          ${renderStatusOptions(order.status)}
        </select>
      </label>

      <ul>
        ${order.items.map(item => `
          <li>
            ${item.product?.name ?? "Deleted Product"} × ${item.quantity}
            (₹${item.product?.price ?? 0})
          </li>
        `).join("")}
      </ul>
    </div>
  `).join("");

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const pagination = document.getElementById("pagination");

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  pagination.innerHTML = `
    <button ${currentPage === 1 ? "disabled" : ""} onclick="changePage(-1)">Prev</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(1)">Next</button>
  `;
}

function changePage(step) {
  currentPage += step;
  renderOrders();
}

function renderStatusOptions(current) {
  const statuses = ["pending", "shipped", "delivered", "cancelled"];
  return statuses
    .map(s => `<option value="${s}" ${s === current ? "selected" : ""}>${s}</option>`)
    .join("");
}

async function updateStatus(orderId, status) {
  await fetch(`/api/v1/order/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ status }),
  });

  loadOrders();
}

function filterOrders() {
  const value = document.getElementById("filter").value;
  const q = document.getElementById("search").value.toLowerCase();

  filteredOrders = allOrders.filter(o => {
    const statusMatch = value === "all" || o.status === value;
    const searchMatch =
      o._id.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q);

    return statusMatch && searchMatch;
  });

  currentPage = 1;
  renderOrders();
}

function searchOrders() {
  filterOrders();
}



loadOrders();
document.getElementById("search").addEventListener("input", filterOrders);
document.getElementById("filter").addEventListener("change", filterOrders);

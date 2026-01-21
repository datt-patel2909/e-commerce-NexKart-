if (!localStorage.getItem("token")) {
  window.location.href = "/login.html";
}

let allOrders = [];

function formatOrderId(id) {
  return "ORD-" + id.slice(-6).toUpperCase();
}

async function loadOrders() {
  const res = await fetch("/api/v1/order/my", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

const data = await res.json();
allOrders = Array.isArray(data.order) ? data.order : [];

allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

renderOrders(allOrders);
}

function applyOrderSort() {
  const sortValue = document.getElementById("orderSort").value;

  let sorted = [...allOrders];

  if (sortValue === "latest") {
    sorted.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  if (sortValue === "oldest") {
    sorted.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  renderOrders(sorted);
}

function renderOrders(orders) {
  const container = document.getElementById("orders");

  if (!orders.length) {
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
  container.innerHTML = orders.map(order => `
    <div class="card">
      <h3>Order ID: ${formatOrderId(order._id)}</h3>
      <p>
        <b>Ordered On:</b>
        ${formatDateTime(order.createdAt)}
      </p>
      <p><b>Status:</b> ${order.status}</p>
      <p><b>Total:</b> ₹${order.totalPrice ?? 0}</p>
      <ul>
        ${order.items.map(item => `
          <li>
            ${item.product?.name ?? "Deleted Product"} × ${item.quantity}
            (₹${item.price ?? item.product?.price ?? 0})
          </li>
        `).join("")}
      </ul>

    </div>
  `).join("");
}

function searchOrders() {
  const q = document.getElementById("orderSearch").value.toLowerCase();

  const filtered = allOrders.filter(order => {
    const displayId = formatOrderId(order._id).toLowerCase();
    const status = order.status.toLowerCase();

    const productMatch = order.items.some(i =>
      i.product?.name?.toLowerCase().includes(q)
    );

    return (
      displayId.includes(q) ||
      status.includes(q) ||
      productMatch
    );
  });

  renderOrders(filtered);
}

loadOrders();

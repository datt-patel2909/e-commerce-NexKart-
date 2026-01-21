if (!localStorage.getItem("token")) {
  window.location.replace("/login.html");
}

let undoTimeout = null;
let lastRemoved = null;

async function loadCart() {
  const res = await fetch("/api/v1/cart", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  const cart = await res.json();
  const container = document.getElementById("cart");
  const btn = document.getElementById("placeOrderBtn");

  if (!cart.items || cart.items.length === 0) {
    container.innerHTML = "<p>Cart is empty</p>";
    updateCartBadge(0);
    if (btn) btn.style.display = "none";
    return;
  }

  if (btn) btn.style.display = "inline-block";

  const totalCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  updateCartBadge(totalCount);

  container.innerHTML = cart.items.map(item => `
    <div class="card qty-animate" id="item-${item.product._id}">
      <h3>${item.product.name}</h3>
      <p>₹${item.product.price}</p>

      <div>
        <button ${item.quantity === 1 ? "disabled" : ""} onclick="decreaseQty('${item.product._id}')">−</button>
        <span class="qty">${item.quantity}</span>
        <button onclick="increaseQty('${item.product._id}')">+</button>
      </div>

      <button onclick="removeItem('${item.product._id}', ${item.quantity})">Remove</button>
    </div>
  `).join("");
}

function updateCartBadge(count) {
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  const safeCount = Math.max(0, Number(count));
  badge.textContent = safeCount;

  badge.classList.remove("cart-badge");
  void badge.offsetWidth;
  badge.classList.add("cart-badge");

  localStorage.setItem("cartCount", safeCount);
}

async function increaseQty(productId) {
  const qtyEl = document.querySelector(`#item-${productId} .qty`);
  if (!qtyEl) return;

  const currentQty = Number(qtyEl.textContent);
  const newQty = currentQty + 1;

  await fetch(`/api/v1/cart/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ quantity: newQty }),
  });

  loadCart();
}


async function decreaseQty(productId) {
  const qtyEl = document.querySelector(`#item-${productId} .qty`);
  if (!qtyEl) return;

  const currentQty = Number(qtyEl.textContent);
  const newQty = currentQty - 1;

  if (newQty < 1) {
    await fetch(`/api/v1/cart/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  } else {
    await fetch(`/api/v1/cart/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ quantity: newQty }),
    });
  }

  loadCart();
}


async function removeItem(productId, removedQty) {
  lastRemoved = { productId, quantity: removedQty };

  updateCartBadge(
    Number(localStorage.getItem("cartCount") || 0) - removedQty
  );

  await fetch(`/api/v1/cart/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  showUndoToast();
  loadCart();
}

function showUndoToast() {
  let toast = document.getElementById("undoToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "undoToast";
    toast.style.cssText =
      "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:12px 18px;border-radius:8px;z-index:9999;";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `Item removed <button onclick="undoRemove()" style="margin-left:12px;">Undo</button>`;
  toast.style.display = "block";

  clearTimeout(undoTimeout);
  undoTimeout = setTimeout(() => {
    toast.style.display = "none";
    lastRemoved = null;
  }, 4000);
}

async function undoRemove() {
  if (!lastRemoved) return;

  updateCartBadge(
    Number(localStorage.getItem("cartCount") || 0) + lastRemoved.quantity
  );

  await fetch("/api/v1/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(lastRemoved),
  });

  lastRemoved = null;
  document.getElementById("undoToast").style.display = "none";
  loadCart();
}

async function placeOrder() {
  await fetch("/api/v1/order", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  updateCartBadge(0);
  window.location.href = "/orders.html";
}

window.addEventListener("storage", e => {
  if (e.key === "cartCount") {
    updateCartBadge(e.newValue || 0);
  }
});

loadCart();

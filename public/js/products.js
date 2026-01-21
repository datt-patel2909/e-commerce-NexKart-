let currentPage = 1;
let currentSearch = "";
let currentCategory = "";
let currentSort = "";
let minPrice = "";
let maxPrice = "";

async function loadProducts() {
  const params = new URLSearchParams();

  if (currentSearch) params.append("search", currentSearch);
  if (currentCategory) params.append("category", currentCategory);
  if (currentSort) params.append("sort", currentSort);
  if (minPrice) params.append("minPrice", minPrice);
  if (maxPrice) params.append("maxPrice", maxPrice);

  params.append("page", currentPage);
  params.append("limit", 8);

  const res = await fetch(`/api/v1/product?${params.toString()}`);
  const result = await res.json();
  const products = result.products;

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const container = document.getElementById("products");

  if (!products || products.length === 0) {
    container.innerHTML = "<p>No products found</p>";
    renderPagination(1);
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-image">
        ${
          p.bestSeller
            ? `<span class="badge">Best Seller</span>`
            : ""
        }
  <img src="${p.image}" onerror="this.src='/fallback.png'" />
    </div>
      <div class="product-info">
        <h3>${p.name}</h3>
           <p class="desc" id="desc-${p._id}">
            ${p.description}
          </p>
          <span class="read-toggle" onclick="toggleDesc('${p._id}', this)">
            Read more
          </span>

        <div class="price-row">
          <span class="price">₹${p.price}</span>
          <span class="stock">${p.stock > 0 ? "In Stock" : "Out of Stock"}</span>
          
        </div>

        ${
          token && role === "user"
            ? `
              <button class="primary-btn" onclick="addToCart('${p._id}')">Add to Cart</button>
              <button class="primary-btn buy-btn" onclick="buyNow('${p._id}')">Buy Now</button>
            `
            : ""
        }
      </div>
    </div>
  `).join("");

  renderPagination(result.totalPages || 1);
}

loadProducts();

window.addToCart = async function (productId) {
  if (!localStorage.getItem("token")) {
    window.location.href = "/login.html";
    return;
  }

  await fetch("/api/v1/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ productId, quantity: 1 }),
  });

  const badge = document.getElementById("cartCount");
  if (badge) {
    const count = Number(badge.textContent || 0) + 1;
    badge.textContent = count;
    localStorage.setItem("cartCount", count);
  }
};

window.buyNow = async function (productId) {
  if (!localStorage.getItem("token")) {
    window.location.href = "/login.html";
    return;
  }

  const qty = prompt("Enter quantity", "1");
  const quantity = Number(qty);

  if (!quantity || quantity < 1) {
    alert("Invalid quantity");
    return;
  }

  const res = await fetch("/api/v1/order/buy-now", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.msg || "Order failed");
    return;
  }

  window.location.href = "/orders.html";
};

const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", e => {
    currentSearch = e.target.value;
    currentPage = 1;
    loadProducts();
  });
}

const minRange = document.getElementById("minPrice");
const maxRange = document.getElementById("maxPrice");

function applyPriceFilter() {
  minPrice = minRange.value;
  maxPrice = maxRange.value;
  currentPage = 1;
  loadProducts();
}

function setCategory(cat) {
  currentCategory = cat;
  currentPage = 1;
  loadProducts();

  document.querySelectorAll(".category-pill").forEach(btn => {
    btn.classList.remove("active");
  });

  const activeBtn = document.getElementById(`cat-${cat || "all"}`);
  if (activeBtn) activeBtn.classList.add("active");
}


function renderPagination(totalPages) {
  const pag = document.getElementById("pagination");
  if (!pag) return;

  let html = "";

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button onclick="goToPage(${i})" ${i === currentPage ? "disabled" : ""}>
        ${i}
      </button>
    `;
  }

  pag.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  loadProducts();
}
function toggleDesc(id, btn) {
  const desc = document.getElementById(`desc-${id}`);
  const expanded = desc.classList.toggle("expanded");

  btn.textContent = expanded ? "Read less" : "Read more";
}
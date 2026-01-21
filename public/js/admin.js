if (!localStorage.getItem("token") || localStorage.getItem("role") !== "admin") {
  window.location.href = "/login.html";
}

let editId = null;
let isSaving = false;

async function loadProducts() {
  const res = await fetch("/api/v1/product");
  const data = await res.json();

  document.getElementById("products").innerHTML =
    data.products.map(p => `
      <div class="card">
        <b>${p.name}</b> – ₹${p.price}
        <br>
      <div class="edit-delete-btn">
          <button onclick="editProduct(
            '${p._id}',
            '${p.name}',
            '${p.description}',
            ${p.price},
            ${p.stock},
            '${p.category}',
            '${p.image || ""}',
            ${p.bestSeller}
          )">Edit</button>
          <button onclick="deleteProduct('${p._id}')">Delete</button>
      </div>
    </div>
    `).join("");
}

function editProduct(id, name, desc, price, stock, category, image, bestSeller) {
  editId = id;

  nameInput.value = name;
  description.value = desc;
  priceInput.value = price;
  stockInput.value = stock;
  categoryInput.value = category;
  imageInput.value = image;
  bestSellerCheckbox.checked = !!bestSeller;

  nameInput.disabled = true;
}

async function saveProduct() {
  if (isSaving) return;
  errorBox.textContent = "";

  const name = nameInput.value.trim();
  const desc = description.value.trim();
  const price = Number(priceInput.value);
  const stock = Number(stockInput.value);
  const category = categoryInput.value;
  const image = imageInput.value.trim();
  const bestSeller = bestSellerCheckbox.checked;

  if (!name) return showError("Product name is required", nameInput);
  if (!desc) return showError("Product description is required", description);
  if (priceInput.value === "" || isNaN(price)) return showError("Product price is required", priceInput);
  if (price < 0) return showError("Price cannot be negative", priceInput);
  if (stockInput.value === "" || isNaN(stock)) return showError("Stock is required", stockInput);
  if (stock < 0) return showError("Stock cannot be negative", stockInput);

  const allowedCategories = ["electroincs", "fashion", "home", "books", "other"];
  if (!allowedCategories.includes(category)) {
    return showError("Please select valid category", categoryInput);
  }

  if (!image) return showError("Product image URL is required", imageInput);

  if (editId && !confirm("Save changes to this product?")) return;

  const product = {
    name,
    description: desc,
    price,
    stock,
    category,
    image,
    bestSeller
  };

  const url = editId
    ? `/api/v1/product/${editId}`
    : "/api/v1/product";

  const method = editId ? "PUT" : "POST";

  isSaving = true;
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(product)
  });

  const data = await res.json();

  isSaving = false;
  saveBtn.disabled = false;
  saveBtn.textContent = "Save";

  if (!res.ok) {
    errorBox.textContent = data.msg || "Error saving product";
    return;
  }

  resetForm();
  loadProducts();
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  editId = null;
  isSaving = false;

  nameInput.disabled = false;
  nameInput.value = "";
  description.value = "";
  priceInput.value = "";
  stockInput.value = "";
  categoryInput.value = "other";
  imageInput.value = "";
  bestSellerCheckbox.checked = false;
  errorBox.textContent = "";
  saveBtn.textContent = "Save";
}

function showError(msg, el) {
  errorBox.textContent = msg;
  el.focus();
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  await fetch(`/api/v1/product/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  loadProducts();
}

const nameInput = document.getElementById("name");
const description = document.getElementById("description");
const priceInput = document.getElementById("price");
const stockInput = document.getElementById("stock");
const categoryInput = document.getElementById("category");
const imageInput = document.getElementById("image");
const bestSellerCheckbox = document.getElementById("bestSeller");
const saveBtn = document.getElementById("saveBtn");
const errorBox = document.getElementById("error");

loadProducts();

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let adminVisible = false;
let cartVisible = false;

async function loadProducts() {
  const res = await fetch("products.json");
  products = await res.json();
  saveData();
  renderProducts();
}

function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";

  products.forEach((p, i) => {
    const defaultVariant = Object.keys(p.variant)[0];
    const defaultImage = p.variant[defaultVariant];

    list.innerHTML += `
      <div class="product-card" id="product-${i}">
        <img src="${defaultImage}" alt="${
      p.name
    }" class="product-img" id="img-${i}" />
        <div class="product-info">
          <h3>${p.name}</h3>
          <p>⭐ ${p.rating}</p>
          <p>$${p.price}</p>
          <div class="variant-buttons">
            ${Object.entries(p.variant)
              .map(
                ([color, imgUrl]) => `
              <button onclick="changeVariant(${i}, '${imgUrl}')">${color}</button>`
              )
              .join("")}
          </div>
          <button onclick="addToCart(${i})">Add to Cart</button>
        </div>
        ${
          adminVisible
            ? `<button class="delete-btn" onclick="deleteProduct(${i})">🗑 Delete</button>`
            : ""
        }
      </div>
    `;
  });
}
function changeVariant(productIndex, newImageUrl) {
  const img = document.getElementById(`img-${productIndex}`);
  img.src = newImageUrl;
}

function renderCart() {
  const cartBox = document.getElementById("cart-items");
  cartBox.innerHTML = cart
    .map(
      (item, i) => `
    <div class="cart-item">
      <span>${item.name}</span>
      <div class="qty-controls">
        <button onclick="updateQty(${i}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="updateQty(${i}, 1)">+</button>
      </div>
      <span>$${item.price * item.qty}</span>
    </div>`
    )
    .join("");
}

function updateQty(index, change) {
  if (cart[index].qty + change <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].qty += change;
  }
  saveData();
  renderCart();
}

function addToCart(index) {
  const prod = products[index];
  const found = cart.find((p) => p.name === prod.name);
  if (found) {
    found.qty++;
  } else {
    cart.push({ ...prod, qty: 1 });
  }
  saveData();
  renderCart();
  toggleCart();
}

function checkout() {
  if (cart.length === 0) return alert("Cart is empty!");
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  alert(`Order placed! Total: $${total}`);
  cart = [];
  saveData();
  renderCart();
}

function deleteProduct(index) {
  if (confirm("Are you sure you want to delete this product?")) {
    products.splice(index, 1);
    saveData();
    renderProducts();
  }
}

function toggleAdmin() {
  adminVisible = !adminVisible;
  cartVisible = false;

  document.getElementById("admin-panel").style.display = adminVisible
    ? "block"
    : "none";
  document.getElementById("product-list").style.display = adminVisible
    ? "flex"
    : "flex";
  document.getElementById("cart-section").style.display = "none";

  document.getElementById("admin-toggle-btn").innerText = adminVisible
    ? "📦 Products"
    : "⚙️ Admin Panel";
  renderProducts();
}

function toggleCart() {
  cartVisible = !cartVisible;
  adminVisible = false;

  document.getElementById("cart-section").style.display = cartVisible
    ? "block"
    : "none";
  document.getElementById("admin-panel").style.display = "none";
  document.getElementById("product-list").style.display = cartVisible
    ? "none"
    : "flex";

  document.getElementById("admin-toggle-btn").innerText = "⚙️ Admin Panel";
}

document.getElementById("admin-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const price = parseFloat(document.getElementById("price").value);
  const rating = document.getElementById("rating").value;
  const image = document.getElementById("image").value;
  const variant = document.getElementById("variant").value;
  products.push({ name, price, rating, image, variant });
  saveData();
  renderProducts();
  this.reset();
});

window.onload = () => {
  loadProducts();
  renderCart();
};

// ---------- GLOBAL VARIABLES ----------
let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function resetView() {
  document.getElementById("highlighted-products").style.display = "none";
  document.getElementById("product-list").style.display = "none";
  document.getElementById("cart-section").style.display = "none";
  document.getElementById("admin-panel").style.display = "none";

  // Reset flags
  adminVisible = false;
  cartVisible = false;

  // Reset active nav button
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));
}

// ---------- INITIALIZATION ----------
window.onload = () => {
  loadProducts();
  renderCart();
  renderHottestPicks();
  renderLuxuryCarousel();
  updateCartCount();
  showHome(); // default to home
};

// ---------- PRODUCT LOGIC ----------
async function loadProducts() {
  const res = await fetch("products.json");
  products = await res.json();
  saveData();
  renderProducts();
  renderHottestPicks();
  renderLuxuryCarousel();
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

// ---------- CART LOGIC ----------
function renderCart() {
  const cartBox = document.getElementById("cart-items");
  if (cart.length === 0) {
    cartBox.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

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
      <button onclick="removeFromCart(${i})">❌</button>
    </div>
  `
    )
    .join("");
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartBox.innerHTML += `<div><strong>Total: $${total.toFixed(
    2
  )}</strong></div>`;

  updateCartCount();
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
  updateCartCount();
  showPopup(`${prod.name} added to cart!`);
  toggleCart();
}

function updateQty(index, change) {
  if (cart[index].qty + change <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].qty += change;
  }
  saveData();
  renderCart();
  updateCartCount();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveData();
  renderCart();
  updateCartCount();
}

function clearCart() {
  if (confirm("Are you sure you want to clear the entire cart?")) {
    cart = [];
    saveData();
    renderCart();
    updateCartCount();
    showPopup("Cart has been emptied.");
  }
}

function updateCartCount() {
  const cartCountEl = document.getElementById("cart-count");
  let totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  cartCountEl.textContent = totalItems;
  cartCountEl.classList.add("animate");
  setTimeout(() => cartCountEl.classList.remove("animate"), 300);
}

function checkout() {
  if (cart.length === 0) return alert("Cart is empty!");
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  showPopup(`Order placed! Total: $${total}`);
  cart = [];
  saveData();
  renderCart();
  updateCartCount();
}

// ---------- SEARCH / FILTER ----------
function searchProducts() {
  const searchValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(searchValue)
  );
  renderFilteredProducts(filtered);
}

function renderFilteredProducts(filteredProducts) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  filteredProducts.forEach((p, i) => {
    const defaultVariant = Object.keys(p.variant)[0];
    const defaultImage = p.variant[defaultVariant];

    productList.innerHTML += `
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
                ([color, imgUrl]) =>
                  `<button onclick="changeVariant(${i}, '${imgUrl}')">${color}</button>`
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

// ---------- ADMIN / UI TOGGLE ----------
function toggleAdmin() {
  resetView();
  adminVisible = true;
  document.getElementById("product-list").style.display = "flex";
  document.getElementById("admin-panel").style.display = "block";
  document.getElementById("admin-toggle-btn").innerText = " Products";
  document.getElementById("admin-btn").classList.add("active");
}
function toggleCart() {
  resetView();
  document.getElementById("cart-section").style.display = "block";
  document.getElementById("cart-btn").classList.add("active");
}

function showHome() {
  resetView();
  document.getElementById("highlighted-products").style.display = "block";
  document.getElementById("product-list").style.display = "flex";
  document.getElementById("admin-toggle-btn").innerText = " Admin Panel";
  document.getElementById("home-btn").classList.add("active");
}

function showAllProducts() {
  resetView();
  document.getElementById("product-list").style.display = "flex";
  document.getElementById("admin-toggle-btn").innerText = " Admin Panel";
  document.getElementById("products-btn").classList.add("active");
}

// ---------- ADMIN PRODUCT FORM ----------
document.getElementById("admin-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const price = parseFloat(document.getElementById("price").value);
  const rating = document.getElementById("rating").value;

  const colorInputs = document.querySelectorAll(".variant-color");
  const urlInputs = document.querySelectorAll(".variant-url");

  const variant = {};
  colorInputs.forEach((input, index) => {
    const color = input.value.trim();
    const url = urlInputs[index].value.trim();
    if (color && url) {
      variant[color] = url;
    }
  });

  products.push({ name, price, rating, variant });
  saveData();
  renderProducts();
  this.reset();
  document.getElementById("variant-container").innerHTML = `
    <div class="variant-input">
      <input type="text" placeholder="Variant Color" class="variant-color" required />
      <input type="url" placeholder="Image URL" class="variant-url" required />
    </div>
  `;
});

function addVariantField() {
  const container = document.getElementById("variant-container");
  const fieldHTML = `
    <div class="variant-input">
      <input type="text" placeholder="Variant Color" class="variant-color" required />
      <input type="url" placeholder="Image URL" class="variant-url" required />
    </div>
  `;
  container.insertAdjacentHTML("beforeend", fieldHTML);
}

function deleteProduct(index) {
  products.splice(index, 1);
  saveData();
  renderProducts();
  showPopup("Product deleted successfully!");
}

// ---------- SPECIAL RENDERING (Hottest + Carousel) ----------
function renderHottestPicks() {
  const hottest = [...products].sort((a, b) => b.price - a.price).slice(0, 3);
  const container = document.getElementById("hottest-picks");
  container.innerHTML = hottest
    .map((p) => {
      const defaultColor = Object.keys(p.variant)[0];
      const defaultImage = p.variant[defaultColor];
      return `
        <div class="product-card">
          <img src="${defaultImage}" class="product-img" alt="${p.name}" />
          <div class="product-info">
            <h3>${p.name}</h3>
            <p>⭐ ${p.rating}</p>
            <p>$${p.price}</p>
            <button onclick="addToCart(${products.indexOf(
              p
            )})">Add to Cart</button>
          </div>
        </div>`;
    })
    .join("");
}

function renderLuxuryCarousel() {
  const luxury = products.filter((p) => p.price >= 1000);
  const track = document.getElementById("luxury-carousel");
  track.innerHTML = luxury
    .map((p) => {
      const defaultColor = Object.keys(p.variant)[0];
      const defaultImage = p.variant[defaultColor];
      return `
        <div class="product-card">
          <img src="${defaultImage}" class="product-img" alt="${p.name}" />
          <div class="product-info">
            <h3>${p.name}</h3>
            <p>⭐ ${p.rating}</p>
            <p>$${p.price}</p>
            <button onclick="addToCart(${products.indexOf(
              p
            )})">Add to Cart</button>
          </div>
        </div>`;
    })
    .join("");
}

// ---------- UI HELPERS ----------
function showSection(sectionId) {
  document
    .querySelectorAll(".main-section")
    .forEach((sec) => sec.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");

  document.getElementById("highlighted-products").style.display =
    sectionId === "product-list" ? "block" : "none";

  adminVisible = sectionId === "admin-panel";
  cartVisible = sectionId === "cart-section";
  document.getElementById("admin-toggle-btn").innerText = adminVisible
    ? " Products"
    : " Admin Panel";
  renderProducts();
  renderCart();
}

function setActive(buttonId) {
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.getElementById(buttonId);
  if (activeBtn) activeBtn.classList.add("active");
}

function showPopup(message) {
  const popup = document.getElementById("custom-popup");
  document.getElementById("popup-message").innerText = message;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 3000);
}

function closePopup() {
  document.getElementById("custom-popup").classList.remove("show");
}

// ---------- CAROUSEL SCROLL ----------
const carousel = document.getElementById("luxury-carousel");
if (carousel) {
  document.querySelector(".left-btn").addEventListener("click", () => {
    carousel.scrollLeft -= 300;
  });
  document.querySelector(".right-btn").addEventListener("click", () => {
    carousel.scrollLeft += 300;
  });
}

// ---------- Password Check ----------
function promptPassword() {
  document.getElementById("password-popup").style.display = "flex";
}

function checkPassword() {
  const input = document.getElementById("admin-password").value;
  if (input === "admin123") {
    document.getElementById("password-popup").style.display = "none";
    toggleAdmin();
    showPopup("Welcome Admin! 👑");
  } else {
    showPopup("Incorrect password!");
  }
}

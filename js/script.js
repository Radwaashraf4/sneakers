/* ==============================================
   PRODUCT DATA
   In a real project this would come from a server/API,
   here we just keep it as a plain JS array.
   ============================================== */
const products = [
  { id: 1, name: "Air Runner Pro", category: "running", price: 89.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" },
  { id: 2, name: "Court Slam X", category: "basketball", price: 119.99, image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500" },
  { id: 3, name: "Urban Walker", category: "casual", price: 64.99, image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500" },
  { id: 4, name: "Flex Trainer", category: "training", price: 74.99, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500" },
  { id: 5, name: "Sprint Edge", category: "running", price: 99.99, image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500" },
  { id: 6, name: "Hoop Master", category: "basketball", price: 129.99, image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=500" },
  { id: 7, name: "Classic Street", category: "casual", price: 59.99, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500" },
  { id: 8, name: "Power Grip", category: "training", price: 84.99, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500" },
];

/* Cart data lives in localStorage so it survives a page refresh.
   We keep it as an array of { id, qty } objects. */
let cart = JSON.parse(localStorage.getItem("stride_cart")) || [];

/* Track the current filter state so search + category work together */
let activeCategory = "all";
let searchTerm = "";

/* ==============================================
   RENDER PRODUCTS
   ============================================== */
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  const noResults = document.getElementById("noResults");

  // Filter the products list based on category + search text
  const filtered = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  grid.innerHTML = "";

  if (filtered.length === 0) {
    noResults.classList.remove("d-none");
  } else {
    noResults.classList.add("d-none");
  }

  filtered.forEach((product) => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-lg-3";

    col.innerHTML = `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-body">
          <p class="product-category">${product.category}</p>
          <h6 class="product-name">${product.name}</h6>
          <p class="product-price">$${product.price.toFixed(2)}</p>
          <button class="btn btn-add-cart" data-id="${product.id}">Add to cart</button>
        </div>
      </div>
    `;

    grid.appendChild(col);
  });

  // Attach click events to the "Add to cart" buttons we just created
  document.querySelectorAll(".btn-add-cart").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
  });
}

/* ==============================================
   CART LOGIC
   ============================================== */
function saveCart() {
  localStorage.setItem("stride_cart", JSON.stringify(cart));
}

function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart();
  renderCart();
}

function changeQty(productId, amount) {
  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  item.qty += amount;

  // Remove the item completely once its quantity hits 0
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== productId);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
}

function renderCart() {
  const cartItemsBox = document.getElementById("cartItems");
  const emptyMsg = document.getElementById("emptyCartMsg");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  cartItemsBox.innerHTML = "";

  if (cart.length === 0) {
    emptyMsg.classList.remove("d-none");
  } else {
    emptyMsg.classList.add("d-none");
  }

  let total = 0;
  let totalItems = 0;

  cart.forEach((cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);
    if (!product) return;

    const lineTotal = product.price * cartItem.qty;
    total += lineTotal;
    totalItems += cartItem.qty;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="cart-item-info">
        <p class="mb-1 fw-semibold">${product.name}</p>
        <p class="mb-1 text-muted">$${product.price.toFixed(2)}</p>
        <div class="d-flex align-items-center qty-controls">
          <button data-action="minus" data-id="${product.id}">-</button>
          <span class="mx-2">${cartItem.qty}</span>
          <button data-action="plus" data-id="${product.id}">+</button>
          <span class="remove-item ms-3" data-id="${product.id}">Remove</span>
        </div>
      </div>
    `;

    cartItemsBox.appendChild(row);
  });

  cartTotal.textContent = `$${total.toFixed(2)}`;
  cartCount.textContent = totalItems;

  // Hook up the +/- and remove buttons for every row we just built
  cartItemsBox.querySelectorAll("[data-action='plus']").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(Number(btn.dataset.id), 1));
  });
  cartItemsBox.querySelectorAll("[data-action='minus']").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(Number(btn.dataset.id), -1));
  });
  cartItemsBox.querySelectorAll(".remove-item").forEach((el) => {
    el.addEventListener("click", () => removeFromCart(Number(el.dataset.id)));
  });
}

/* ==============================================
   CHECKOUT
   ============================================== */
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty. Add a few sneakers first!");
    return;
  }

  alert("Thank you! Your order has been placed.");
  cart = [];
  saveCart();
  renderCart();
});

/* ==============================================
   SEARCH + CATEGORY FILTERS
   ============================================== */
document.getElementById("searchInput").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderProducts();
});

document.querySelectorAll("#categoryFilters .btn-filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Reset the "active" style on every button, then highlight the clicked one
    document.querySelectorAll("#categoryFilters .btn-filter").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    activeCategory = btn.dataset.category;
    renderProducts();
  });
});

/* ==============================================
   NEWSLETTER FORM (just a small UX touch, no real backend)
   ============================================== */
document.getElementById("newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("newsletterEmail").value;
  document.getElementById("newsletterMsg").textContent = `Thanks! We'll send updates to ${email}.`;
  e.target.reset();
});

/* ==============================================
   INITIAL PAGE LOAD
   ============================================== */
renderProducts();
renderCart();

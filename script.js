/* ============================================================
   Sora Sushi — menu data + cart logic
   All client-side. No server, no real payment.
   ============================================================ */

// 1) The menu. Add/edit dishes here and the page updates itself.
const MENU = [
  { id: "salmon-nigiri",  name: "Salmon Nigiri",   price: 6.0,  tag: "2 pcs",      desc: "Buttery salmon over hand-pressed rice." },
  { id: "tuna-nigiri",    name: "Bluefin Tuna",    price: 8.0,  tag: "2 pcs",      desc: "Lean bluefin, brushed with house soy." },
  { id: "dragon-roll",    name: "Dragon Roll",     price: 16.0, tag: "8 pcs",      desc: "Eel and cucumber, draped in avocado." },
  { id: "spicy-tuna",     name: "Spicy Tuna Roll", price: 12.0, tag: "6 pcs",      desc: "Chopped tuna, chili oil, scallion." },
  { id: "chirashi",       name: "Chirashi Bowl",   price: 22.0, tag: "Chef's cut", desc: "Assorted sashimi over seasoned rice." },
  { id: "tonkotsu",       name: "Tonkotsu Ramen",  price: 17.0, tag: "Bowl",       desc: "12-hour pork broth, chashu, soft egg." },
  { id: "edamame",        name: "Edamame",         price: 5.0,  tag: "Starter",    desc: "Steamed soybeans, sea salt." },
  { id: "miso-soup",      name: "Miso Soup",       price: 4.0,  tag: "Starter",    desc: "Dashi, tofu, wakame, scallion." },
];

// 2) The cart: a map of dish id -> quantity.
const cart = {};

/* ---------- Render the menu ---------- */
const menuGrid = document.getElementById("menuGrid");

function renderMenu() {
  menuGrid.innerHTML = MENU.map((dish) => `
    <article class="dish">
      <div class="dish__top">
        <h3 class="dish__name">${dish.name}</h3>
        <span class="dish__price">$${dish.price.toFixed(2)}</span>
      </div>
      <span class="dish__tag">${dish.tag}</span>
      <p class="dish__desc">${dish.desc}</p>
      <button class="dish__add" data-id="${dish.id}">Add to order</button>
    </article>
  `).join("");
}

/* ---------- Cart helpers ---------- */
function findDish(id) {
  return MENU.find((d) => d.id === id);
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCart();
  openCart();
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  updateCart();
}

function cartCount() {
  return Object.values(cart).reduce((sum, q) => sum + q, 0);
}

function cartTotal() {
  return Object.entries(cart).reduce(
    (sum, [id, qty]) => sum + findDish(id).price * qty,
    0
  );
}

/* ---------- Render the cart ---------- */
const cartItems = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

function updateCart() {
  const ids = Object.keys(cart);

  if (ids.length === 0) {
    cartItems.innerHTML = `<p class="cart__empty">Your order is empty.<br />Add something delicious from the menu.</p>`;
  } else {
    cartItems.innerHTML = ids.map((id) => {
      const dish = findDish(id);
      const qty = cart[id];
      return `
        <div class="cart-row">
          <div class="cart-row__info">
            <div class="cart-row__name">${dish.name}</div>
            <div class="cart-row__price">$${dish.price.toFixed(2)} each</div>
          </div>
          <div class="qty">
            <button data-id="${id}" data-delta="-1" aria-label="Decrease">&minus;</button>
            <span>${qty}</span>
            <button data-id="${id}" data-delta="1" aria-label="Increase">+</button>
          </div>
        </div>
      `;
    }).join("");
  }

  cartCountEl.textContent = cartCount();
  cartTotalEl.textContent = "$" + cartTotal().toFixed(2);
  checkoutBtn.disabled = ids.length === 0;
}

/* ---------- Open / close drawer ---------- */
const drawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("cartOverlay");

function openCart() {
  drawer.classList.add("open");
  overlay.classList.add("open");
}
function closeCart() {
  drawer.classList.remove("open");
  overlay.classList.remove("open");
}

/* ---------- Wire up events ---------- */
document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

// "Add to order" buttons (event delegation on the menu grid)
menuGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".dish__add");
  if (btn) addToCart(btn.dataset.id);
});

// +/- buttons inside the cart (event delegation)
cartItems.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-delta]");
  if (btn) changeQty(btn.dataset.id, Number(btn.dataset.delta));
});

checkoutBtn.addEventListener("click", () => {
  alert(
    "Thanks! This is a demo checkout — no payment was taken.\n\n" +
    "Order total: $" + cartTotal().toFixed(2)
  );
});

// Close the drawer with the Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});

/* ---------- Go ---------- */
renderMenu();
updateCart();

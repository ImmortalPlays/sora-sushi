/* ============================================================
   Sora Sushi — menu data + cart logic
   All client-side. No server, no real payment.
   ============================================================ */

// 1) The menu, grouped into categories. Add/edit dishes here and the page
//    updates itself. The category order is set by CATEGORIES below.
const CATEGORIES = ["Sushi & Rolls", "Ramen & Soup", "Dumplings & Starters", "Drinks"];

const MENU = [
  // Sushi & Rolls
  { cat: "Sushi & Rolls", id: "salmon-nigiri", name: "Salmon Nigiri",   price: 6.0,  tag: "2 pcs",      desc: "Buttery salmon over hand-pressed rice." },
  { cat: "Sushi & Rolls", id: "tuna-nigiri",   name: "Bluefin Tuna",    price: 8.0,  tag: "2 pcs",      desc: "Lean bluefin, brushed with house soy." },
  { cat: "Sushi & Rolls", id: "dragon-roll",   name: "Dragon Roll",     price: 16.0, tag: "8 pcs",      desc: "Eel and cucumber, draped in avocado." },
  { cat: "Sushi & Rolls", id: "spicy-tuna",    name: "Spicy Tuna Roll", price: 12.0, tag: "6 pcs",      desc: "Chopped tuna, chili oil, scallion." },
  { cat: "Sushi & Rolls", id: "chirashi",      name: "Chirashi Bowl",   price: 22.0, tag: "Chef's cut", desc: "Assorted sashimi over seasoned rice." },

  // Ramen & Soup
  { cat: "Ramen & Soup", id: "tonkotsu",  name: "Tonkotsu Ramen", price: 17.0, tag: "Bowl",    desc: "12-hour pork broth, chashu, soft egg." },
  { cat: "Ramen & Soup", id: "miso-soup", name: "Miso Soup",      price: 4.0,  tag: "Starter", desc: "Dashi, tofu, wakame, scallion." },

  // Dumplings & Starters
  { cat: "Dumplings & Starters", id: "gyoza",   name: "Pork Gyoza",    price: 7.0, tag: "5 pcs",   desc: "Pan-seared pork dumplings, ponzu." },
  { cat: "Dumplings & Starters", id: "shumai",  name: "Shrimp Shumai", price: 7.0, tag: "4 pcs",   desc: "Steamed shrimp dumplings." },
  { cat: "Dumplings & Starters", id: "edamame", name: "Edamame",       price: 5.0, tag: "Starter", desc: "Steamed soybeans, sea salt." },

  // Drinks
  { cat: "Drinks", id: "green-tea", name: "Green Tea",   price: 3.0, tag: "Hot",    desc: "Sencha, served by the pot." },
  { cat: "Drinks", id: "sake",      name: "Junmai Sake", price: 9.0, tag: "Glass",  desc: "Smooth, dry rice wine." },
  { cat: "Drinks", id: "ramune",    name: "Ramune Soda", price: 4.0, tag: "Bottle", desc: "Classic marble-top soda." },
];

// 2) The cart: a map of dish id -> quantity.
const cart = {};

/* ---------- Render the menu ---------- */
const menuGrid = document.getElementById("menuGrid");

function dishCard(dish) {
  return `
    <article class="dish">
      <div class="dish__media" aria-hidden="true"></div>
      <div class="dish__top">
        <h3 class="dish__name">${dish.name}</h3>
        <span class="dish__price">$${dish.price.toFixed(2)}</span>
      </div>
      <span class="dish__tag">${dish.tag}</span>
      <p class="dish__desc">${dish.desc}</p>
      <div class="dish__foot">
        <button class="dish__add" data-id="${dish.id}">Add to order</button>
        <span class="dish__caption">${dish.name}</span>
      </div>
    </article>
  `;
}

// Find each dish's photo in images/menu/ no matter the file type OR name.
// We try a few extensions (jpg, webp, png...) and BOTH the dish id and a
// slug of its name (so "tuna-nigiri" OR "bluefin-tuna" both work). The first
// file that actually exists is used; a missing photo keeps the fallback.
const IMG_EXTS = ["jpg", "jpeg", "webp", "png"];
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function loadDishImages() {
  document.querySelectorAll("#menuGrid .dish").forEach((card) => {
    const btn = card.querySelector(".dish__add");
    const id = btn && btn.dataset.id;
    if (!id) return;
    const dish = findDish(id);
    const names = [id];
    if (dish) {
      const ns = slugify(dish.name);
      if (ns && ns !== id) names.push(ns);
    }
    const urls = [];
    names.forEach((n) => IMG_EXTS.forEach((ext) => urls.push("images/menu/" + n + "." + ext)));
    let i = 0;
    (function tryNext() {
      if (i >= urls.length) return;
      const url = urls[i++];
      const probe = new Image();
      probe.onload = () => card.style.setProperty("--img", "url('" + url + "')");
      probe.onerror = tryNext;
      probe.src = url;
    })();
  });
}

function renderMenu() {
  menuGrid.innerHTML = CATEGORIES.map((cat) => {
    const items = MENU.filter((d) => d.cat === cat);
    return `
      <div class="menu-group">
        <h3 class="menu-cat">${cat}</h3>
        <div class="menu">${items.map(dishCard).join("")}</div>
      </div>
    `;
  }).join("");
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

// Menu clicks: the "Add" button adds to the cart; clicking anywhere else
// on a card flips it to show (or hide) the food photo.
menuGrid.addEventListener("click", (e) => {
  const add = e.target.closest(".dish__add");
  if (add) {
    addToCart(add.dataset.id);
    return;
  }
  const dish = e.target.closest(".dish");
  if (dish) dish.classList.toggle("dish--show");
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

/* ---------- Mobile nav (hamburger) ---------- */
const navBurger = document.getElementById("navBurger");
const navLinks = document.getElementById("navLinks");

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  navBurger.classList.toggle("open", open);
  navBurger.setAttribute("aria-expanded", open ? "true" : "false");
}
navBurger.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
// Close the menu after tapping a link.
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

/* ---------- Style switcher (DEVELOPER-ONLY — no visible UI) ----------
   Visitors never see a toggle. To switch the look, a developer can:
     • Add a URL param:  ?style=traditional   or   ?style=modern
     • Press the shortcut:  Shift + Alt + S   (flips between the two)
   The choice is remembered in this browser via localStorage.
*/
const STYLES = { modern: "styles.css", traditional: "styles-traditional.css" };
const themeCss = document.getElementById("themeCss");

function applyStyle(name) {
  if (!STYLES[name]) name = "modern";
  themeCss.setAttribute("href", STYLES[name]);
  localStorage.setItem("soraStyle", name);
}

function currentStyle() {
  return localStorage.getItem("soraStyle") === "traditional" ? "traditional" : "modern";
}

// A ?style= URL param wins on load; otherwise use the saved choice.
const urlStyle = new URLSearchParams(location.search).get("style");
applyStyle(urlStyle && STYLES[urlStyle] ? urlStyle : currentStyle());

// Secret dev shortcut: Shift + Alt + S toggles styles.
document.addEventListener("keydown", (e) => {
  if (e.shiftKey && e.altKey && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    applyStyle(currentStyle() === "modern" ? "traditional" : "modern");
  }
});

/* ---------- Go ---------- */
renderMenu();
loadDishImages();
updateCart();

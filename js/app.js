(function () {
  const DATA = window.OG;
  const ART = window.OGArt;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const stage = $("#stage");
  const toast = $("#toast");
  let chosenSize = null;
  let chosenColor = "black";
  let chosenQty = 1;
  let filter = "all";
  let pendingWall = null;
  let toastTimer = null;

  const cart = load("og.cart", []);
  const letters = load("og.letters", []);
  const orders = load("og.orders", []);
  let seeker = load("og.seeker", "");

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }
  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }
  function verseBlock(ru, ref, en, tag, cls) {
    const el = tag || "p";
    return (
      "<" +
      el +
      ' class="' +
      (cls || "verse") +
      '">«' +
      esc(ru) +
      "»" +
      (en ? '<span class="verse-en">' + esc(en) + "</span>" : "") +
      (ref ? "<cite>" + esc(ref) + "</cite>" : "") +
      "</" +
      el +
      ">"
    );
  }
  function money(n) {
    return "€" + n;
  }
  function product(id) {
    return DATA.products.find((p) => p.id === id);
  }
  function count() {
    return cart.reduce((sum, line) => sum + line.qty, 0);
  }
  function total() {
    return cart.reduce((sum, line) => {
      const p = product(line.id);
      return sum + (p ? p.price * line.qty : 0);
    }, 0);
  }
  function say(text) {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }
  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  function rememberLetter(email) {
    const clean = email.trim().toLowerCase();
    if (!validEmail(clean)) return { ok: false, reason: "bad" };
    if (letters.some((row) => row.email === clean)) return { ok: true, fresh: false, email: clean };
    letters.push({ email: clean, at: new Date().toISOString() });
    save("og.letters", letters);
    return { ok: true, fresh: true, email: clean };
  }
  function parseRoute() {
    const raw = (location.hash || "#/home").replace(/^#\/?/, "");
    const bits = raw.split("/").filter(Boolean);
    const aliases = { cave: "home", walls: "wallpapers" };
    const name = aliases[bits[0]] || bits[0] || "home";
    return { name: name, arg: bits[1] || "" };
  }
  function setNav(name) {
    const key = name === "piece" ? "cloth" : name === "vigil" || name === "seal" ? "basket" : name;
    document.querySelectorAll("nav a").forEach((a) => {
      const on = a.getAttribute("href") === "#/" + key;
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const map = {
      home: "Главная",
      cloth: "Одежды",
      piece: "Print",
      wallpapers: "Обои",
      cell: "О нас",
      basket: "Корзина",
      vigil: "Заказ",
      seal: "Заказ",
    };
    document.title = "Ortho Graphica — " + (map[name] || "Свет во тьме светит");
  }
  function updateCount() {
    const el = $("#cart-count");
    el.textContent = String(count());
    el.classList.remove("pulse");
    void el.offsetWidth;
    el.classList.add("pulse");
  }

  function preview(p, full, color) {
    if (!p.mock) return ART.garment(p);
    const black = full && p.mock.fullBlack ? p.mock.fullBlack : p.mock.black;
    const white = full && p.mock.fullWhite ? p.mock.fullWhite : p.mock.white;
    return (
      '<span class="shots' +
      (color === "white" ? " is-white" : "") +
      '">' +
      '<img class="shot shot-black" src="' +
      esc(black) +
      '" alt="' +
      esc(p.name) +
      '">' +
      '<img class="shot shot-white" src="' +
      esc(white) +
      '" alt="">' +
      "</span>"
    );
  }

  function card(p) {
    const visual =
      '<div class="mark">' +
      preview(p) +
      (p.soon ? '<span class="soon">soon · скоро</span>' : "") +
      "</div>";
    const meta =
      '<div class="meta"><p class="kicker">' +
      esc(p.kindLabel) +
      "</p><h3>" +
      esc(p.name) +
      '</h3><p class="ru">' +
      esc(p.ru) +
      "</p>" +
      (p.soon ? "" : '<p class="price">' + money(p.price) + "</p>") +
      '<p class="card-verse">«' +
      esc(p.verse) +
      "»" +
      (p.verseEn ? '<span class="verse-en">' + esc(p.verseEn) + "</span>" : "") +
      '</p><p class="ref">' +
      esc(p.ref) +
      "</p></div>";
    if (p.soon) return '<article class="card">' + visual + meta + "</article>";
    return '<article class="card"><a href="#/piece/' + p.id + '">' + visual + meta + "</a></article>";
  }

  function renderCave() {
    const featured = DATA.products.filter((p) => p.featured);
    stage.innerHTML =
      '<div class="crown" aria-hidden="true"><img src="crown-white.png" alt=""></div>' +
      '<section class="wrap hero"><div><p class="kicker">prints · православные</p><h1>Свет<br>во тьме<br>светит</h1>' +
      '<p class="en">And the light shines in the darkness, and the darkness did not overcome it.</p>' +
      '<p class="fine">Designs are 100% handmade. Merch is 100% cotton.<br>Рисунки — ручная работа. Вещи — 100% хлопок.</p>' +
      verseBlock(DATA.house.verse, DATA.house.ref, DATA.house.verseEn) +
      '<div class="row"><a class="btn solid" href="#/cloth">shop · одежды</a><a class="btn" href="#/wallpapers">wallpapers · обои</a></div></div></section>' +
      '<section class="wrap band">' +
      verseBlock(
        "Я свет миру; кто последует за Мною, тот не будет ходить во тьме, но будет иметь свет жизни.",
        "От Иоанна 8:12",
        "I am the light of the world. He who follows Me shall not walk in darkness, but have the light of life."
      ) +
      '<p class="ru">' +
      esc(DATA.prayer) +
      ".</p></section>" +
      '<section class="wrap drop"><header class="drop-head"><p class="kicker">01 — drop / дроп</p><p class="drop-stamp">new</p><h2>New Collection</h2><p class="drop-ru">Новая коллекция</p><p class="fine">Hoodies and tees in 100% cotton. Designs drawn by hand. Рисунки вручную.</p></header><div class="grid">' +
      featured.map(card).join("") +
      "</div></section>" +
      '<section class="wrap"><header class="page-title"><p class="kicker">02 — wallpapers / обои</p><h2>Glorify Him</h2>' +
      '<p class="fine">Change the wallpaper on your phone. Glorify Him every time you unlock.<br>Прославь Его каждым экраном.</p></header>' +
      wallsGrid() +
      '<div class="row"><a class="btn" href="#/wallpapers">all wallpapers · все обои</a></div></section>' +
      '<section class="wrap band">' +
      verseBlock(
        "если кто хочет идти за Мною, отвергнись себя, и возьми крест свой, и следуй за Мною.",
        "Матфея 16:24",
        "If anyone desires to come after Me, let him deny himself, and take up his cross, and follow Me."
      ) +
      '<p class="ru">Господь пасет мя, и ничтоже мя лишит.</p></section>';
  }

  function letterFields() {
    return (
      '<label><span>Email <b>для лампады</b></span><input name="email" type="email" autocomplete="email" required placeholder="name@domain"></label>' +
      '<p class="form-error" data-err></p><button class="wax" type="submit">зажечь</button>'
    );
  }

  function shownProducts() {
    return DATA.products.filter((p) => {
      if (filter === "all") return true;
      if (filter === "soon") return !!p.soon;
      if (filter === "hoodie") return p.kind === "hoodie";
      if (filter === "tee") return p.kind === "tee";
      return true;
    });
  }

  function renderCloth() {
    const chips = [
      ["all", "всё"],
      ["hoodie", "худи"],
      ["tee", "футболки"],
    ];
    stage.innerHTML =
      '<section class="wrap"><header class="page-title"><p class="kicker">shop · одежды</p><h1>Prints</h1>' +
      '<p class="fine">Black cloth, white ink. Designs 100% handmade. Garments 100% cotton.</p>' +
      verseBlock("Вы — свет мира.", "Матфея 5:14", "You are the light of the world.") +
      "</header>" +
      '<div class="filters">' +
      chips
        .map(
          ([id, label]) =>
            '<button type="button" class="ghost" data-filter="' +
            id +
            '" aria-pressed="' +
            (filter === id) +
            '">' +
            label +
            "</button>"
        )
        .join("") +
      '</div><div class="grid">' +
      shownProducts().map(card).join("") +
      "</div></section>";
  }

  function renderPiece(id) {
    const p = product(id);
    if (!p || p.soon) {
      stage.innerHTML =
        '<section class="wrap empty"><h1>Empty</h1>' +
        verseBlock(DATA.house.verse, DATA.house.ref, DATA.house.verseEn) +
        '<a class="btn solid" href="#/cloth">shop · одежды</a></section>';
      return;
    }
    chosenSize = null;
    chosenColor = "black";
    chosenQty = 1;
    const others = DATA.products.filter((item) => !item.soon && item.id !== p.id).slice(0, 3);
    stage.innerHTML =
      '<article class="wrap piece"><div class="piece-stage" id="piece-stage">' +
      preview(p, true, "black") +
      '</div><div class="piece-copy"><p class="kicker">' +
      esc(p.kindLabel) +
      " · " +
      esc(p.clothName) +
      "</p><h1>" +
      esc(p.name) +
      '</h1><p class="ru">' +
      esc(p.ru) +
      '</p><p class="price">' +
      money(p.price) +
      "</p><p>" +
      esc(p.blurb) +
      '</p><p class="fine">Design 100% handmade. / Рисунок вручную. Cloth 100% cotton. / 100% хлопок.</p>' +
      verseBlock(p.verse, p.ref, p.verseEn, "blockquote", "scripture verse") +
      (p.mock
        ? '<p class="kicker">color · цвет</p><div class="sizes"><button type="button" data-color="black" aria-pressed="true">black</button><button type="button" data-color="white" aria-pressed="false">white</button></div>'
        : "") +
      '<p class="kicker">size · мера</p><div class="sizes">' +
      DATA.sizes
        .map((size) => '<button type="button" data-size="' + size + '" aria-pressed="false">' + size + "</button>")
        .join("") +
      '</div><p class="kicker">qty · число</p><div class="qty"><button type="button" data-qty="-1">−</button><span id="qty-n">1</span><button type="button" data-qty="1">+</button></div>' +
      '<div class="row"><button class="btn solid" type="button" data-add="' +
      p.id +
      '">add · в корзину</button><a class="btn" href="#/basket">cart · корзина</a></div>' +
      '<p class="fine">Prototype. Nothing is charged. The size stays in this browser.</p></div></article>' +
      (others.length
        ? '<section class="wrap"><header class="page-title"><p class="kicker">Более</p><h2>More</h2></header><div class="grid">' +
          others.map(card).join("") +
          "</div></section>"
        : "");
  }

  function wallFace(w) {
    return (
      '<img class="wall-shot" src="' +
      esc(w.file) +
      '" alt="' +
      esc(w.name) +
      '">' +
      '<div class="wall-art"><strong>' +
      esc(w.name) +
      '</strong><p class="ru">' +
      esc(w.ru) +
      "</p><p>" +
      esc(w.blurb) +
      "</p></div>"
    );
  }

  function wallsGrid() {
    return (
      '<div class="walls">' +
      DATA.walls
        .map(
          (w) =>
            '<button class="wall reveal" type="button" data-wall="' +
            w.id +
            '">' +
            wallFace(w) +
            '<span class="lock-note">' +
            (seeker ? "download · скачать" : "free · оставь email") +
            "</span></button>"
        )
        .join("") +
      "</div>"
    );
  }

  function renderWalls() {
    stage.innerHTML =
      '<section class="wrap"><header class="page-title"><p class="kicker">wallpapers · обои на телефон</p><h1>Glorify Him</h1>' +
      '<p class="fine">Change the wallpaper on your phone. Glorify Him every time you unlock. Прославь Его каждым экраном. Hover to preview. Leave an email and download.</p>' +
      verseBlock(
        "Живущий под кровом Всевышнего под сенью Всемогущего покоится.",
        "Псалом 90:1",
        "He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty."
      ) +
      (seeker
        ? '<p class="ok-note">On the list · ' + esc(seeker) + "</p>"
        : "") +
      wallsGrid() +
      "</section>";
  }

  function renderCell() {
    const margin = letters.length
      ? "<ul>" + letters.map((row) => "<li>" + esc(row.email) + "</li>").join("") + "</ul>"
      : '<p class="fine">Empty. The form is at the bottom of the page.</p>';
    const diptych = orders.length
      ? orders
          .map(
            (order) =>
              '<p><a href="#/seal/' +
              esc(order.id) +
              '">' +
              esc(order.id) +
              "</a> — " +
              esc(order.name) +
              " · " +
              money(order.total) +
              "</p>"
          )
          .join("")
      : '<p class="fine">No orders yet.</p>';
    stage.innerHTML =
      '<section class="wrap page-title"><p class="kicker">about · о нас</p><h1>Marks</h1>' +
      '<p class="fine">Ortho Graphica prints the Orthodox marks: the three-bar cross, ІС ХС, НИКА, and the cruciform halo that belongs to Christ. The designs are 100% handmade. The hoodies and tees are 100% cotton.</p></section>' +
      '<section class="wrap split"><div class="panel">' +
      verseBlock(
        "Господь — свет мой и спасение мое: кого мне бояться?",
        "Псалом 26:1",
        "The Lord is my light and my salvation; whom shall I fear?"
      ) +
      "<p>The lower bar is a footrest. In the Russian cross it rises toward Christ’s right hand, the side of the repentant thief, and falls toward the other. Under it is the skull of Adam. Golgotha means the place of the skull.</p>" +
      verseBlock(
        "Трезвитесь, бодрствуйте, потому что противник ваш диавол ходит, как рыкающий лев, ища, кого поглотить.",
        "1 Петра 5:8",
        "Be sober, be vigilant; because your adversary the devil walks about like a roaring lion, seeking whom he may devour."
      ) +
      '<p class="ru">' +
      esc(DATA.pascha) +
      '.</p></div><dl class="glossary panel">' +
      "<div><dt>ІС ХС</dt><dd>Jesus Christ, the name written on the icon.</dd></div>" +
      "<div><dt>НИКА</dt><dd>He conquers.</dd></div>" +
      "<div><dt>Ό ών</dt><dd>«The One who is», inside Christ’s halo.</dd></div>" +
      "<div><dt>Молитва</dt><dd>" +
      esc(DATA.prayer) +
      ".</dd></div>" +
      "</dl></section>" +
      '<section class="wrap split"><div class="panel"><h2>List · список</h2><p class="fine">Stored only in this browser.</p>' +
      margin +
      '</div><div class="panel"><h2>Orders · заказы</h2>' +
      diptych +
      verseBlock(
        "Придите ко Мне все труждающиеся и обремененные, и Я успокою вас.",
        "Матфея 11:28",
        "Come to Me, all you who labor and are heavy laden, and I will give you rest."
      ) +
      "</div></section>";
  }

  function renderBasket() {
    if (!cart.length) {
      stage.innerHTML =
        '<section class="wrap empty"><p class="kicker">cart · корзина</p><h1>Empty</h1>' +
        verseBlock(
          "Придите ко Мне все труждающиеся и обремененные, и Я успокою вас.",
          "Матфея 11:28",
          "Come to Me, all you who labor and are heavy laden, and I will give you rest."
        ) +
        '<a class="btn solid" href="#/cloth">shop · одежды</a></section>';
      return;
    }
    stage.innerHTML =
      '<section class="wrap"><header class="page-title"><p class="kicker">cart · корзина</p><h1>Cart</h1>' +
      verseBlock(
        "потому что Ты со мной; Твой жезл и Твой посох — они успокаивают меня.",
        "Псалом 22:4",
        "for You are with me; Your rod and Your staff, they comfort me."
      ) +
      "</header>" +
      '<div class="basket-table">' +
      cart
        .map((line) => {
          const p = product(line.id);
          if (!p) return "";
          const key = esc(line.id) + "|" + esc(line.size) + "|" + esc(line.color || "");
          return (
            '<div class="basket-line"><div>' +
            preview(p, false, line.color || "black") +
            "</div><div><strong>" +
            esc(p.name) +
            '</strong><p class="ru">' +
            esc(p.ru) +
            '</p><p class="fine">' +
            esc(line.size) +
            (line.color ? " · " + esc(line.color) : "") +
            " · " +
            money(p.price) +
            '</p></div><div class="line-actions"><button class="icon-btn" type="button" data-line="' +
            key +
            '" data-step="-1">−</button><span>' +
            line.qty +
            '</span><button class="icon-btn" type="button" data-line="' +
            key +
            '" data-step="1">+</button><button class="icon-btn" type="button" data-remove="' +
            key +
            '">×</button><span>' +
            money(p.price * line.qty) +
            "</span></div></div>"
          );
        })
        .join("") +
      '<div class="totals"><span>total · итого</span><strong>' +
      money(total()) +
      '</strong></div><div class="row"><a class="btn solid" href="#/vigil">checkout · заказ</a><button class="btn" type="button" id="clear-cart">clear · очистить</button></div>' +
      '<p class="fine">A prototype record. Nothing is charged and nothing is shipped.</p></div></section>';
  }

  function renderVigil() {
    if (!cart.length) {
      location.hash = "/basket";
      return;
    }
    const lines = cart
      .map((line) => {
        const p = product(line.id);
        return (
          "<li>" +
          esc(p.ru) +
          " · " +
          esc(line.size) +
          (line.color ? " · " + esc(line.color) : "") +
          " × " +
          line.qty +
          "</li>"
        );
      })
      .join("");
    stage.innerHTML =
      '<section class="wrap vigil"><div><p class="kicker">order · заказ</p><h1>Checkout</h1>' +
      verseBlock(
        "и се, Я с вами во все дни до скончания века.",
        "Матфея 28:20",
        "and lo, I am with you always, even to the end of the age."
      ) +
      "<ul>" +
      lines +
      "</ul><p class=\"order-no\">" +
      money(total()) +
      '</p><p class="fine">No payment is taken. The seal is a local prototype of an order.</p></div>' +
      '<form class="ledger" id="vigil-form"><label><span>Name <b>имя</b></span><input name="name" required autocomplete="name"></label>' +
      '<label><span>Email</span><input name="email" type="email" required autocomplete="email"></label>' +
      '<label><span>Street · улица</span><input name="street" required autocomplete="street-address"></label>' +
      '<label><span>City · город</span><input name="city" required autocomplete="address-level2"></label>' +
      '<label><span>Country · страна</span><input name="country" required autocomplete="country-name"></label>' +
      '<label><span>Note · пометка</span><textarea name="note" maxlength="240"></textarea></label>' +
      '<p class="form-error" data-err></p><button class="btn solid" type="submit">place order · оформить</button></form></section>';
  }

  function renderSeal(id) {
    const order = orders.find((row) => row.id === id);
    if (!order) {
      stage.innerHTML =
        '<section class="wrap empty"><h1>No order</h1><a class="btn" href="#/cell">about · о нас</a></section>';
      return;
    }
    const items = order.items
      .map(
        (item) =>
          "<li>" +
          esc(item.ru) +
          " · " +
          esc(item.size) +
          (item.color ? " · " + esc(item.color) : "") +
          " × " +
          item.qty +
          " — " +
          money(item.price * item.qty) +
          "</li>"
      )
      .join("");
    stage.innerHTML =
      '<section class="wrap seal-card"><div class="cross-block">' +
      ART.cross({ width: 48, stroke: "#f4f4f4", sw: 2.4 }) +
      '</div><p class="kicker">order placed · заказ принят</p><p class="order-no">' +
      esc(order.id) +
      "</p>" +
      verseBlock(DATA.house.verse, DATA.house.ref, DATA.house.verseEn) +
      "<p>" +
      esc(order.name) +
      "<br>" +
      esc(order.email) +
      "<br>" +
      esc(order.street) +
      ", " +
      esc(order.city) +
      ", " +
      esc(order.country) +
      "</p><ul>" +
      items +
      "</ul><p class=\"order-no\">" +
      money(order.total) +
      "</p>" +
      (order.note ? "<p class=\"slavonic\">" + esc(order.note) + "</p>" : "") +
      '<p class="fine">Kept on this device only. Payment was not taken.</p>' +
      '<div class="row"><a class="btn solid" href="#/cloth">shop · одежды</a><a class="btn" href="#/cell">orders · заказы</a></div></section>';
  }

  function render() {
    const route = parseRoute();
    const views = {
      home: renderCave,
      cloth: renderCloth,
      wallpapers: renderWalls,
      cell: renderCell,
      basket: renderBasket,
      vigil: renderVigil,
    };
    if (route.name === "piece") renderPiece(route.arg);
    else if (route.name === "seal") renderSeal(route.arg);
    else if (views[route.name]) views[route.name]();
    else {
      stage.innerHTML =
        '<section class="wrap empty"><h1>Missing</h1>' +
        verseBlock(DATA.house.verse, DATA.house.ref, DATA.house.verseEn) +
        '<a class="btn" href="#/home">home · главная</a></section>';
    }
    setNav(route.name);
    updateCount();
    window.scrollTo(0, 0);
    watchReveal(stage.querySelectorAll(".band, .page-title, .drop, .card, .wall, .panel, .piece-stage, .piece-copy, .basket-line, .seal-card, .empty, .ledger"));
    playHome();
  }

  function playHome() {
    const nodes = stage.querySelectorAll(".hero, .crown");
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    nodes.forEach((node) => node.classList.add("reveal"));
    const start = () => nodes.forEach((node) => node.classList.add("in"));
    const intro = $("#intro");
    if (intro && document.documentElement.classList.contains("locked")) playHome.pending = start;
    else requestAnimationFrame(start);
  }

  function watchReveal(nodes) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!watchReveal.obs) {
      watchReveal.obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            watchReveal.obs.unobserve(entry.target);
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
      );
    }
    nodes.forEach((node) => {
      if (node.classList.contains("in")) return;
      node.classList.add("reveal");
      watchReveal.obs.observe(node);
    });
  }

  function addToCart(id) {
    if (!chosenSize) {
      say("Pick a size. / Выбери размер.");
      return;
    }
    const p = product(id);
    const color = p && p.mock ? chosenColor || "black" : "";
    const found = cart.find(
      (line) => line.id === id && line.size === chosenSize && (line.color || "") === color
    );
    if (found) {
      if (found.qty + chosenQty > 6) {
        say("Six is the limit. / Не больше шести.");
        return;
      }
      found.qty += chosenQty;
    } else {
      const line = { id: id, size: chosenSize, qty: chosenQty };
      if (color) line.color = color;
      cart.push(line);
    }
    save("og.cart", cart);
    updateCount();
    say(p.ru + " · " + chosenSize + (color ? " · " + color : "") + " — in the cart.");
  }

  function mutateLine(key, delta) {
    const parts = key.split("|");
    const id = parts[0];
    const size = parts[1];
    const color = parts[2] || "";
    const line = cart.find((row) => row.id === id && row.size === size && (row.color || "") === color);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart.splice(cart.indexOf(line), 1);
    save("og.cart", cart);
    render();
  }

  function downloadWall(id) {
    const wall = DATA.walls.find((w) => w.id === id);
    if (!wall || !wall.file) return;
    const a = document.createElement("a");
    a.href = wall.file;
    a.download = wall.file.split("/").pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
    say("Saved. / «" + wall.name + "»");
  }

  function openGate(id) {
    pendingWall = id;
    const gate = $("#gate");
    gate.hidden = false;
    const input = gate.querySelector("input");
    input.value = seeker || "";
    input.focus();
  }
  function closeGate() {
    $("#gate").hidden = true;
    pendingWall = null;
  }

  document.addEventListener("click", (e) => {
    const colorBtn = e.target.closest("[data-color]");
    if (colorBtn) {
      chosenColor = colorBtn.dataset.color;
      document.querySelectorAll("[data-color]").forEach((btn) => {
        btn.setAttribute("aria-pressed", btn === colorBtn ? "true" : "false");
      });
      const photo = $("#piece-stage");
      if (photo) {
        photo.classList.toggle("is-white", chosenColor === "white");
        const shots = photo.querySelector(".shots");
        if (shots) shots.classList.toggle("is-white", chosenColor === "white");
      }
      return;
    }
    const sizeBtn = e.target.closest("[data-size]");
    if (sizeBtn) {
      chosenSize = sizeBtn.dataset.size;
      document.querySelectorAll("[data-size]").forEach((btn) => {
        btn.setAttribute("aria-pressed", btn === sizeBtn ? "true" : "false");
      });
      return;
    }
    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn && !qtyBtn.closest(".basket-line") && qtyBtn.dataset.qty) {
      chosenQty = Math.min(6, Math.max(1, chosenQty + Number(qtyBtn.dataset.qty)));
      const n = $("#qty-n");
      if (n) n.textContent = String(chosenQty);
      return;
    }
    const add = e.target.closest("[data-add]");
    if (add) {
      addToCart(add.dataset.add);
      return;
    }
    const step = e.target.closest("[data-step]");
    if (step) {
      mutateLine(step.dataset.line, Number(step.dataset.step));
      return;
    }
    const remove = e.target.closest("[data-remove]");
    if (remove) {
      mutateLine(remove.dataset.remove, -99);
      say("Removed. / Снято.");
      return;
    }
    if (e.target.closest("#clear-cart")) {
      cart.splice(0, cart.length);
      save("og.cart", cart);
      render();
      say("Cart cleared.");
      return;
    }
    const filt = e.target.closest("[data-filter]");
    if (filt) {
      filter = filt.dataset.filter;
      renderCloth();
      setNav("cloth");
      return;
    }
    const wall = e.target.closest("[data-wall]");
    if (wall) {
      if (seeker) downloadWall(wall.dataset.wall);
      else openGate(wall.dataset.wall);
      return;
    }
    if (e.target.closest("[data-close]")) closeGate();
    const toggle = e.target.closest(".nav-toggle");
    if (toggle) {
      const nav = $("#nav");
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    if (e.target.closest("#nav a")) $("#nav").classList.remove("open");
  });

  document.addEventListener("submit", (e) => {
    const letter = e.target.closest(".js-letter");
    if (letter) {
      e.preventDefault();
      const email = new FormData(letter).get("email");
      const result = rememberLetter(email);
      const err = letter.querySelector("[data-err]");
      if (!result.ok) {
        err.textContent = "Need a real email. / Нужна почта.";
        return;
      }
      err.textContent = "";
      letter.innerHTML =
        '<p class="ok-note">You’re on the list. / Ты в списке.</p>' +
        verseBlock(
          "Восстань, светись, ибо пришел свет твой.",
          "Исаии 60:1",
          "Arise, shine; for your light has come."
        );
      say(result.fresh ? "Subscribed. / Подписан." : "Already on the list.");
      return;
    }
    if (e.target.id === "gate-form") {
      e.preventDefault();
      const email = new FormData(e.target).get("email");
      const result = rememberLetter(email);
      const err = e.target.querySelector("[data-err]");
      if (!result.ok) {
        err.textContent = "Need a real email. / Нужна почта.";
        return;
      }
      seeker = result.email;
      save("og.seeker", seeker);
      const id = pendingWall;
      closeGate();
      render();
      downloadWall(id);
      return;
    }
    if (e.target.id === "vigil-form") {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      const err = e.target.querySelector("[data-err]");
      if (!data.name.trim() || !data.street.trim() || !data.city.trim() || !data.country.trim()) {
        err.textContent = "Name and address are required.";
        return;
      }
      if (!validEmail(data.email)) {
        err.textContent = "That email does not look right.";
        return;
      }
      const order = {
        id: "OG-" + Date.now().toString(36).toUpperCase().slice(-6),
        at: new Date().toISOString(),
        name: data.name.trim(),
        email: data.email.trim(),
        street: data.street.trim(),
        city: data.city.trim(),
        country: data.country.trim(),
        note: data.note.trim(),
        items: cart.map((line) => {
          const p = product(line.id);
          return {
            id: line.id,
            ru: p.ru,
            name: p.name,
            size: line.size,
            color: line.color || "",
            qty: line.qty,
            price: p.price,
          };
        }),
        total: total(),
      };
      orders.unshift(order);
      save("og.orders", orders);
      rememberLetter(order.email);
      cart.splice(0, cart.length);
      save("og.cart", cart);
      location.hash = "/seal/" + order.id;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeGate();
      $("#nav").classList.remove("open");
    }
  });

  const gate = $("#gate");
  gate.addEventListener("click", (e) => {
    if (e.target === gate) closeGate();
  });

  if (!location.hash || /^#\/cave\/?$/.test(location.hash)) location.replace("#/home");
  else if (/^#\/walls\/?$/.test(location.hash)) location.replace("#/wallpapers");
  window.addEventListener("hashchange", render);
  render();
  watchReveal(document.querySelectorAll(".foot-grid > div, .proto"));

  const intro = $("#intro");
  function closeIntro() {
    if (!intro || intro.classList.contains("is-leaving")) return;
    intro.classList.add("is-leaving");
    document.documentElement.classList.remove("locked");
    if (playHome.pending) {
      playHome.pending();
      playHome.pending = null;
    }
    startRadio(true);
    setTimeout(() => {
      if (intro && intro.parentNode) intro.remove();
    }, 750);
  }
  if (intro) {
    intro.addEventListener("click", closeIntro);
    intro.addEventListener("touchend", (e) => {
      e.preventDefault();
      closeIntro();
    }, { passive: false });
    setTimeout(closeIntro, 3600);
  }

  const playlist = DATA.songs || [];
  let songIndex = 0;
  let seeking = false;
  const audio = $("#radio-audio");
  const playBtn = $("#radio-play");
  const seek = $("#radio-seek");
  const timeEl = $("#radio-time");

  function clock(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + String(s).padStart(2, "0");
  }
  function setPlayUi(on) {
    playBtn.textContent = on ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", on ? "pause" : "play");
  }
  function loadSong(i) {
    if (!playlist.length) return;
    songIndex = ((i % playlist.length) + playlist.length) % playlist.length;
    const track = playlist[songIndex];
    audio.src = encodeURI(track.src);
    seek.value = "0";
    timeEl.textContent = "0:00 / 0:00";
  }
  function startRadio(forceSound) {
    if (!playlist.length || !audio) return;
    if (forceSound) audio.muted = false;
    const go = audio.play();
    if (go && go.catch) {
      go.catch(() => {
        audio.muted = true;
        audio.play().then(() => {
          if (forceSound) audio.muted = false;
        }).catch(() => {});
      });
    }
  }
  function unlockRadio() {
    audio.muted = false;
    startRadio(true);
    document.removeEventListener("pointerdown", unlockRadio);
  }

  if (playlist.length && audio) {
    loadSong(0);
    audio.volume = 0.2;
    audio.loop = playlist.length === 1;
    playBtn.addEventListener("click", () => {
      if (audio.paused) startRadio(true);
      else audio.pause();
    });
    seek.addEventListener("input", () => {
      seeking = true;
      if (!audio.duration) return;
      audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    });
    seek.addEventListener("change", () => {
      seeking = false;
    });
    audio.addEventListener("play", () => setPlayUi(true));
    audio.addEventListener("pause", () => setPlayUi(false));
    audio.addEventListener("loadedmetadata", () => {
      timeEl.textContent = clock(audio.currentTime) + " / " + clock(audio.duration);
    });
    audio.addEventListener("canplay", () => startRadio(false));
    audio.addEventListener("timeupdate", () => {
      if (!seeking && audio.duration) {
        seek.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
      }
      timeEl.textContent = clock(audio.currentTime) + " / " + clock(audio.duration || 0);
    });
    audio.addEventListener("ended", () => {
      if (playlist.length === 1) return;
      loadSong(songIndex + 1);
      startRadio(true);
    });
    startRadio(false);
    document.addEventListener("pointerdown", unlockRadio);
  } else {
    const bar = $("#radio");
    if (bar) bar.hidden = true;
  }
})();

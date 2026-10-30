/* nūrah website prototype: shared catalogue, bag (kept in this browser only), header menu and painted illustrations. */
(function () {
  "use strict";

  var PR = "media/products/";
  var P = {
    // men
    everyday: { id: "ihram-everyday", key: "everyday", name: "Everyday Ihram", desc: "Reliable weave, everyday value", price: 109, img: PR + "ihram-everyday.jpg", url: "product-page.html?fabric=everyday" },
    air: { id: "ihram-air", key: "air", name: "Air Ihram", desc: "Lightweight, for warm climates", price: 139, img: PR + "ihram-air.jpg", url: "product-page.html?fabric=air", tag: "Bestseller" },
    soft: { id: "ihram-soft", key: "soft", name: "Soft Ihram", desc: "Plush terry, heavier feel", price: 149, img: PR + "ihram-soft.jpg", url: "product-page.html?fabric=soft" },
    reserve: { id: "ihram-reserve", key: "reserve", name: "Reserve Ihram", desc: "Long-staple cotton, gift box", price: 219, img: PR + "ihram-side.jpg", url: "product-page.html?fabric=reserve", tag: "Gift box" },
    thobe: { id: "thobe", name: "Travel thobe", desc: "Breathable cotton, for after ihram", price: 179, img: PR + "thobe.jpg", tag: "After ihram" },
    // women
    abayaIvory: { id: "abaya-ivory", name: "Lace-trim abaya, ivory", desc: "Decorative trim: for Eid and after the journey", price: 289, img: PR + "abaya-offwhite.jpg" },
    abayaStone: { id: "abaya-stone", name: "Umrah abaya, stone", desc: "Plain, loose and opaque, light for long days", price: 249, img: PR + "abaya-grey.jpg", tag: "For Umrah" },
    hijab: { id: "hijab", name: "Cotton jersey hijab", desc: "Soft, non-slip, in ivory", price: 59, img: PR + "hijab.jpg" },
    careWomen: { id: "care-women", name: "Unscented care set for women", desc: "Body wash and deodorant, fragrance-free", price: 69, img: PR + "care-set-women.jpg" },
    abayaBlack: { id: "abaya-black", name: "Classic abaya, black", desc: "Plain nida fabric, wudu-friendly sleeves", price: 229, img: PR + "abaya-black.jpg", tag: "For Umrah" },
    jilbab: { id: "jilbab-rose", name: "Two-piece prayer set, dusty rose", desc: "Overhead jilbab and skirt, easy to wear", price: 199, img: PR + "jilbab-rose.jpg", tag: "Prayer set" },
    abayaBlue: { id: "abaya-blue", name: "Embroidered abaya, royal blue", desc: "For Eid and gifting after the journey", price: 329, img: PR + "abaya-blue.jpg" },
    // accessories
    mat: { id: "mat", name: "Travel prayer mat", desc: "Lightweight, folds into its own pouch", price: 59, img: PR + "mat.jpg" },
    tasbih: { id: "tasbih", name: "Wooden tasbih", desc: "Thirty-three beads with a tassel", price: 29, img: PR + "tasbih-wood.jpg" },
    tasbihPearl: { id: "tasbih-pearl", name: "Pearl-tone tasbih", desc: "Thirty-three beads, gift pouch", price: 35, img: PR + "tasbih-white.jpg" },
    booklet: { id: "booklet", name: "Pocket Quran", desc: "Arabic with English translation", price: 45, img: PR + "quran.jpg" },
    care: { id: "care", name: "Fragrance-free care set", desc: "Body wash, shampoo and deodorant", price: 69, img: PR + "care-set.jpg", tag: "Fragrance-free" },
    spray: { id: "spray", name: "Unscented deodorant", desc: "Fragrance-free, travel size", price: 25, img: PR + "spray.jpg" },
    umbrella: { id: "umbrella", name: "Sun umbrella", desc: "Compact, UV-protective, with a blunt tip", price: 45, img: PR + "umbrella.jpg" },
    lipbalm: { id: "lip-balm", name: "Unscented lip balm", desc: "Unscented and unflavoured, for dry air", price: 15, img: PR + "lip-balm.jpg" },
    miswak: { id: "miswak", name: "Miswak", desc: "Plain and unflavoured, individually sealed", price: 9, img: PR + "miswak.jpg" },
    bottle: { id: "bottle", name: "Travel water bottle", desc: "500 ml, for long days at the Haram", price: 19, img: PR + "bottle.jpg" },
    belt: { id: "belt", name: "Ihram belt, white", desc: "Zip pockets for passport, phone and cards", price: 49, img: PR + "belt.jpg", tag: "Essential" },
    shoebag: { id: "shoebag", name: "Shoe bag", desc: "Carry your sandals with you in the mosque", price: 24, icon: "bag" },
    // kits (contents are catalogue keys; the saving is calculated from the individual prices)
    kitFirst: { id: "kit-first", kit: true, name: "First-time Pilgrim Kit", desc: "Everything a first Umrah needs, in one delivery", price: 210, img: PR + "kit-first.jpg", contents: ["everyday", "belt", "care", "miswak", "bottle"], tag: "Start here" },
    umrahKit: { id: "kit-umrah", kit: true, name: "Umrah Essentials Kit", desc: "Air Ihram with prayer and care essentials", price: 249, img: PR + "kit-umrah.jpg", contents: ["air", "mat", "tasbih", "care"], url: "product-page.html?fabric=air", tag: "Bestseller" },
    kitWomen: { id: "kit-women", kit: true, name: "Women's Umrah Kit", desc: "Plain abaya, hijab and unscented care", price: 399, img: PR + "kit-women.jpg", contents: ["abayaStone", "hijab", "careWomen", "mat", "tasbihPearl"], tag: "New" },
    kitCouple: { id: "kit-couple", kit: true, name: "Couple's Umrah Kit", desc: "Coordinated essentials for two", price: 669, img: PR + "kit-couple.jpg", contents: ["air", "abayaStone", "hijab", "mat", "mat", "tasbih", "tasbih", "care", "careWomen", "belt"] },
    hajjKit: { id: "kit-hajj", kit: true, name: "Hajj Complete Kit", desc: "Two ihram sets and the essentials for the days of Hajj", price: 430, img: PR + "kit-hajj.jpg", contents: ["air", "air", "belt", "care", "mat", "umbrella"], url: "product-page.html?fabric=air" },
    kitGift: { id: "kit-gift", kit: true, name: "Reserve Gift Box", desc: "A complete gift, presented in our black Reserve box", price: 379, img: PR + "kit-gift.jpg", contents: ["reserve", "tasbihPearl", "booklet", "mat", "care"], tag: "Gift" }
  };
  var ICONS = {
    belt: '<svg viewBox="0 0 64 64" fill="none" stroke="#141414" stroke-width="2"><rect x="6" y="26" width="52" height="12" rx="2"/><rect x="24" y="22" width="16" height="20" rx="2"/></svg>',
    care: '<svg viewBox="0 0 64 64" fill="none" stroke="#141414" stroke-width="2"><rect x="18" y="20" width="12" height="34" rx="3"/><rect x="34" y="28" width="12" height="26" rx="3"/><path d="M21 20v-6h6v6M37 28v-5h6v5"/></svg>',
    bag: '<svg viewBox="0 0 64 64" fill="none" stroke="#141414" stroke-width="2"><path d="M14 22h36l-4 32H18z"/><path d="M24 22c0-6 4-10 8-10s8 4 8 10"/></svg>',
    pouch: '<svg viewBox="0 0 64 64" fill="none" stroke="#141414" stroke-width="2"><path d="M14 20h36v30a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z"/><path d="M14 26h36M26 16c2 2 10 2 12 0"/></svg>'
  };

  var KEY = "nurah-bag", mem = null;
  function read() { try { var v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : (mem || []); } catch (e) { return mem || []; } }
  function write(items) { mem = items; try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} render(); }
  function count() { return read().reduce(function (n, i) { return n + i.qty; }, 0); }
  function render() { var c = count(); document.querySelectorAll("[data-bag-count]").forEach(function (el) { el.textContent = c; }); }
  function toast(msg, link) {
    var t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.innerHTML = ""; t.appendChild(document.createTextNode(msg));
    if (link !== false) { var a = document.createElement("a"); a.href = "bag.html"; a.textContent = "View bag"; t.appendChild(a); }
    t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2800);
  }
  function add(item, qty) {
    var items = read(), ex = items.filter(function (i) { return i.id === item.id; })[0];
    if (ex) ex.qty += qty || 1;
    else items.push({ id: item.id, name: item.name, variant: item.variant || "", price: item.price, img: item.img || "", icon: item.icon || "", qty: qty || 1 });
    write(items); toast(item.name + " added to your bag");
  }
  window.NURAH = { products: P, icons: ICONS, bag: { read: read, write: write, add: add, count: count, render: render }, toast: toast };

  function aed(n) { return "AED " + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  window.NURAH.aed = aed;

  // product and accessory cards rendered from the catalogue: <div data-cards="air,soft" data-kind="product|icon">
  function cardHTML(p) {
    var img = p.img ? '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy">' : '<div class="todoImg">Product photography to follow</div>';
    return '<div class="pcard" data-key="' + (p.key || p.id) + '">' +
      '<div class="ph">' + img + (p.tag ? '<span class="tag">' + p.tag + "</span>" : "") +
      '<button class="quick" type="button" data-add="' + (p.key || p.id) + '">Quick add</button></div>' +
      '<div class="row"><a class="name cover" href="' + (p.url || "#") + '">' + p.name + "</a><span>" + aed(p.price) + "</span></div>" +
      '<span class="desc">' + p.desc + '</span><span class="meta">Next-day UAE delivery</span></div>';
  }
  function iconHTML(p) {
    if (p.img) return '<div class="icard photo"><div class="ph"><img src="' + p.img + '" alt="' + p.name + '" loading="lazy">' + (p.tag ? '<span class="tag">' + p.tag + "</span>" : "") + '</div><div class="row"><b style="font-weight:500">' + p.name + "</b><span>" + aed(p.price) + "</span></div><p>" + p.desc + '</p><button class="btn alt sm" type="button" data-add="' + p.id + '">Add to bag</button></div>';
    return '<div class="icard"><div class="ph">' + ICONS[p.icon] + '</div><div class="row"><b style="font-weight:500">' + p.name + "</b><span>" + aed(p.price) + "</span></div><p>" + p.desc + '</p><button class="btn alt sm" type="button" data-add="' + p.id + '">Add to bag</button></div>';
  }
  function kitHTML(p) {
    var items = (p.contents || []).map(function (k) { return P[k]; }).filter(Boolean);
    var full = items.reduce(function (t, x) { return t + x.price; }, 0), save = Math.max(0, full - p.price);
    var names = {}; items.forEach(function (x) { names[x.name] = (names[x.name] || 0) + 1; });
    var list = Object.keys(names).map(function (n) { return '<li>' + (names[n] > 1 ? names[n] + " × " : "") + n + "</li>"; }).join("");
    return '<div class="kcard"><div class="ph"><img src="' + p.img + '" alt="' + p.name + ' contents" loading="lazy">' + (p.tag ? '<span class="tag">' + p.tag + "</span>" : "") + '</div>' +
      '<div class="row"><b>' + p.name + '</b><span>' + aed(p.price) + '</span></div><p class="desc">' + p.desc + '</p>' +
      '<ul>' + list + '</ul>' + (save ? '<span class="save">Save ' + aed(save) + ' on individual items</span>' : '') +
      '<button class="btn sm" type="button" data-add="' + p.id + '">Add kit to bag</button></div>';
  }
  function findProduct(k) { if (P[k]) return P[k]; for (var x in P) if (P[x].id === k) return P[x]; return null; }
  function renderCards(box) {
    box.innerHTML = box.dataset.cards.split(",").map(function (k) { var p = findProduct(k.trim()); return p ? (box.dataset.kind === "kit" ? kitHTML(p) : box.dataset.kind === "icon" ? iconHTML(p) : cardHTML(p)) : ""; }).join("");
  }
  document.querySelectorAll("[data-cards]").forEach(renderCards);
  // page scripts can re-render a filtered grid: set box.dataset.cards, then NURAH.renderCards(box)
  window.NURAH.renderCards = renderCards; window.NURAH.find = findProduct;
  window.NURAH.html = { card: cardHTML, icon: iconHTML, kit: kitHTML };

  // trip details (kept in this browser only): { trip: "Umrah", date: "2026-11-14", as: "Man" }
  var TKEY = "nurah-trip";
  function tripGet() { try { return JSON.parse(localStorage.getItem(TKEY)) || null; } catch (e) { return null; } }
  function tripSet(t) { try { localStorage.setItem(TKEY, JSON.stringify(t)); } catch (e) {} }
  // next-day UAE delivery when ordered before 2pm, otherwise the day after
  function arrival(from) { var d = from ? new Date(from) : new Date(); var add = d.getHours() < 14 ? 1 : 2; d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + add); return d; }
  function fmtDate(d) { return new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
  function daysBetween(a, b) { var x = new Date(a), y = new Date(b); x.setHours(12, 0, 0, 0); y.setHours(12, 0, 0, 0); return Math.round((y - x) / 864e5); }
  window.NURAH.trip = { get: tripGet, set: tripSet };
  window.NURAH.arrival = arrival; window.NURAH.fmtDate = fmtDate; window.NURAH.daysBetween = daysBetween;

  // footer trip reminders
  document.querySelectorAll("form[data-signup]").forEach(function (f) {
    f.addEventListener("submit", function (e) { e.preventDefault(); toast("Thank you. Your trip reminders are set.", false); f.reset(); });
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (!b || b.hasAttribute("data-add-local")) return;
    var p = findProduct(b.dataset.add); if (!p) return;
    e.preventDefault(); e.stopPropagation();
    add({ id: p.id + (p.key ? "-regular" : ""), name: p.name, variant: p.key ? "Regular · up to 180 cm" : "", price: p.price, img: p.img, icon: p.icon });
  });

  // header navigation (see assets/nav.css). Desktop: hovering a top link opens its panel after a short pause;
  // moving to another link swaps the panel; leaving the header, Escape or a click outside closes it.
  // Touch screens: the first tap on a top link opens its panel, the second follows the link.
  // Phones: the Menu button opens a full-screen list; tapping a section shows its pages, "All" goes back.
  var navEl = document.querySelector("nav.main"), mega = navEl && navEl.querySelector(".mega"), mb = document.querySelector(".menuBtn");
  if (navEl && mega) {
    var headerEl = document.querySelector("header.site");
    var desk = window.matchMedia("(min-width: 961px)"), canHover = window.matchMedia("(hover: hover)");
    var items = [].slice.call(navEl.querySelectorAll(".ti")), panels = {};
    [].forEach.call(mega.querySelectorAll(".mPanel"), function (p) { panels[p.dataset.panel] = p; });
    var scrim = document.createElement("div"); scrim.className = "navScrim"; document.body.appendChild(scrim);
    var cur = null, tOpen, tClose, warmed = false;
    var warm = function () { if (warmed) return; warmed = true; [].forEach.call(mega.querySelectorAll("img[loading]"), function (i) { i.loading = "eager"; }); };
    // line panel content up with the first top link; fall back to the page margin if it would not fit
    var align = function () {
      var x = Math.round(items[0].getBoundingClientRect().left);
      mega.style.setProperty("--nav-left", x + "px");
      var inner = panels[cur].querySelector(".mInner");
      if (inner.scrollWidth > inner.clientWidth + 1) mega.style.removeProperty("--nav-left");
    };
    var show = function (key) {
      clearTimeout(tOpen); clearTimeout(tClose);
      cur = key && panels[key] ? key : null;
      items.forEach(function (ti) {
        var on = ti.dataset.panel === cur, b = ti.querySelector(".tiBtn");
        ti.classList.toggle("open", on); if (b) b.setAttribute("aria-expanded", on ? "true" : "false");
      });
      Object.keys(panels).forEach(function (k) { panels[k].classList.toggle("on", k === cur); });
      navEl.classList.toggle("megaOpen", !!cur);
      if (desk.matches) {
        if (cur) align();
        mega.style.height = cur ? panels[cur].offsetHeight + "px" : "0px";
        if (cur) scrim.style.setProperty("--scrim-top", Math.max(0, headerEl.getBoundingClientRect().bottom) + "px");
        scrim.classList.toggle("on", !!cur); document.body.classList.toggle("navOpen", !!cur);
      }
    };
    items.forEach(function (ti) {
      var a = ti.querySelector("a"), b = ti.querySelector(".tiBtn"), key = ti.dataset.panel;
      ti.addEventListener("mouseenter", function () {
        if (!desk.matches || !canHover.matches) return;
        warm(); clearTimeout(tClose); clearTimeout(tOpen);
        if (cur) show(key); else tOpen = setTimeout(function () { show(key); }, 150);
      });
      if (b) b.addEventListener("click", function (e) {
        e.stopPropagation(); warm(); show(cur === key ? null : key);
        if (cur) { var first = panels[key].querySelector(".mCol a"); if (first) first.focus(); }
      });
      a.addEventListener("click", function (e) {
        if (!desk.matches) { e.preventDefault(); show(key); navEl.classList.add("drill"); navEl.scrollTop = 0; var bk = panels[key].querySelector(".mBack"); if (bk) bk.focus({ preventScroll: true }); return; }
        if (!canHover.matches && cur !== key) { e.preventDefault(); warm(); show(key); }
      });
    });
    navEl.addEventListener("mouseenter", function () { clearTimeout(tClose); });
    navEl.addEventListener("mouseleave", function () { if (!desk.matches || !canHover.matches) return; clearTimeout(tOpen); tClose = setTimeout(function () { show(null); }, 250); });
    navEl.addEventListener("focusout", function (e) { if (cur && desk.matches && !navEl.contains(e.relatedTarget)) show(null); });
    [].forEach.call(mega.querySelectorAll(".mBack"), function (bk) { bk.addEventListener("click", function () { navEl.classList.remove("drill"); var k = cur; show(null); var ti = navEl.querySelector('.ti[data-panel="' + k + '"] a'); if (ti) ti.focus({ preventScroll: true }); }); });
    document.addEventListener("click", function (e) { if (cur && desk.matches && !e.target.closest("nav.main")) show(null); });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !cur || !desk.matches) return;
      var inside = navEl.contains(document.activeElement), ti = navEl.querySelector('.ti[data-panel="' + cur + '"]');
      show(null); if (inside && ti) ti.querySelector(".tiBtn").focus();
    });
    var closeMobile = function () {
      navEl.classList.remove("open", "drill"); navEl.style.height = navEl.style.maxHeight = ""; document.body.classList.remove("menuOpen");
      if (mb) { mb.setAttribute("aria-expanded", "false"); mb.textContent = "Menu"; }
      if (!desk.matches) show(null);
    };
    if (mb) mb.addEventListener("click", function () {
      if (navEl.classList.contains("open")) { closeMobile(); return; }
      navEl.classList.add("open"); document.body.classList.add("menuOpen"); mb.setAttribute("aria-expanded", "true"); mb.textContent = "Close";
      navEl.style.height = navEl.style.maxHeight = Math.max(240, window.innerHeight - headerEl.getBoundingClientRect().bottom) + "px";
    });
    window.addEventListener("resize", function () {
      if (desk.matches) { if (navEl.classList.contains("open")) closeMobile(); if (cur) { align(); mega.style.height = panels[cur].offsetHeight + "px"; } }
      else { mega.style.height = ""; scrim.classList.remove("on"); document.body.classList.remove("navOpen"); }
    });
  }

  // painted illustration (showcase only): <div class="paintBox" data-paint="haram" data-mode="view|loop">
  // view: paints once when it comes into view. loop: paints, holds, fades and repaints while visible.
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // pages with their own painter wiring (the product page) opt out with <body data-own-paint>
  var boxes = document.body.hasAttribute("data-own-paint") ? [] : [].slice.call(document.querySelectorAll(".paintBox[data-paint]"));
  boxes.forEach(function (box) {
    var cfg = window.NURAH_PAINTINGS && window.NURAH_PAINTINGS[box.dataset.paint];
    if (!cfg || !window.NurahPainter) return;
    var started = false;
    function start() {
      if (started) return; started = true;
      var cv = box.querySelector("canvas"), r = box.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = r.width * dpr, h = r.height * dpr, cap = 1500 / Math.max(w, h);
      if (cap < 1) { w *= cap; h *= cap; }
      cv.width = Math.max(200, Math.round(w)); cv.height = Math.max(200, Math.round(h));
      var p = new NurahPainter(cv, window.NURAH_PAINT_SOURCES[cfg.src], cfg.opts);
      box.painter = p;
      p.ready.then(function () { box.classList.add("ready"); run(); });
    }
    var dur = Number(box.dataset.duration) || 9000, hold = Number(box.dataset.hold) || 6000, visible = false;
    function run() {
      var p = box.painter; if (!p || !p.isReady) return;
      if (reduce) { p.finish(); return; }
      if (box.dataset.mode === "loop") { if (visible) p.loop(dur, hold); else p.stopLoop(); }
      else if (visible && !p.done) { p.done = true; setTimeout(function () { p.play(dur); }, Number(box.dataset.delay) || 0); }
    }
    // prepare a little before it scrolls in, start painting once it is on screen
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) start(); }, { rootMargin: "60% 0px" }).observe(box);
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; run(); }, { threshold: 0.3 }).observe(box);
    var rp = box.querySelector(".replay"); if (rp) rp.addEventListener("click", function () { var p = box.painter; if (!p) return; p.stopLoop(); if (box.dataset.mode === "loop") p.loop(dur, hold); else p.play(dur); });
  });

  render();
})();

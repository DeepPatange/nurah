/* nūrah category pages: filter chips, filter checkboxes, sort and a live count for one product grid.
   Each page sets window.CATEGORY = { items: [catalogue keys], attrs: { key: { chips: [...], <attr>: [...] } },
   unit: ["product", "products"], links: { productId: "page.html" | null } } before this script runs.
   A fieldset with data-attr="price" uses ranges written as "min-max" (empty max means no upper limit). */
(function () {
  "use strict";
  var C = window.CATEGORY, N = window.NURAH;
  if (!C || !N) return;
  var grid = document.getElementById("catGrid"), countEl = document.getElementById("catCount"), empty = document.getElementById("catEmpty");
  var sortEl = document.getElementById("catSort"), aside = document.getElementById("filters"), toggle = document.getElementById("filterToggle");
  var chips = [].slice.call(document.querySelectorAll(".chipRow .chip[data-chip]"));
  var chip = "all";

  function attr(k, a) { var v = (C.attrs[k] || {})[a]; return v == null ? [] : [].concat(v); }
  function selected() {
    var out = {};
    aside.querySelectorAll("fieldset[data-attr]").forEach(function (fs) {
      var v = [].slice.call(fs.querySelectorAll("input:checked")).map(function (i) { return i.value; });
      if (v.length) out[fs.dataset.attr] = v;
    });
    return out;
  }
  function inRange(price, r) { var p = r.split("-"), lo = Number(p[0]), hi = p[1] === "" ? Infinity : Number(p[1]); return price >= lo && price <= hi; }

  function apply() {
    var f = selected();
    var keys = C.items.filter(function (k) {
      var p = N.find(k); if (!p) return false;
      if (chip !== "all" && attr(k, "chips").indexOf(chip) < 0) return false;
      for (var a in f) {
        if (a === "price") { if (!f[a].some(function (r) { return inRange(p.price, r); })) return false; }
        else if (!f[a].some(function (v) { return attr(k, a).indexOf(v) >= 0; })) return false;
      }
      return true;
    });
    if (sortEl.value === "asc") keys.sort(function (a, b) { return N.find(a).price - N.find(b).price; });
    if (sortEl.value === "desc") keys.sort(function (a, b) { return N.find(b).price - N.find(a).price; });

    grid.dataset.cards = keys.join(",");
    N.renderCards(grid);
    if (C.links) grid.querySelectorAll(".pcard").forEach(function (card) {
      var p = N.find(card.dataset.key), a = card.querySelector("a.cover");
      if (!p || !a || !(p.id in C.links)) return;
      if (C.links[p.id]) a.href = C.links[p.id]; else a.removeAttribute("href");
    });

    var n = keys.length;
    countEl.textContent = n + " " + (n === 1 ? C.unit[0] : C.unit[1]);
    grid.hidden = n === 0; empty.hidden = n > 0;
    var active = Object.keys(f).reduce(function (t, a) { return t + f[a].length; }, 0);
    toggle.textContent = "Filters" + (active ? " (" + active + ")" : "");
  }

  function setChip(v) {
    chip = v;
    chips.forEach(function (c) { c.setAttribute("aria-pressed", c.dataset.chip === v ? "true" : "false"); });
    apply();
  }
  function clearChecks() { aside.querySelectorAll("input:checked").forEach(function (i) { i.checked = false; }); }

  chips.forEach(function (c) { c.addEventListener("click", function () { setChip(c.dataset.chip); }); });
  aside.addEventListener("change", apply);
  sortEl.addEventListener("change", apply);
  aside.querySelectorAll("[data-clear]").forEach(function (b) { b.addEventListener("click", function () { clearChecks(); apply(); }); });
  document.querySelectorAll("[data-reset]").forEach(function (b) { b.addEventListener("click", function () { clearChecks(); setChip("all"); }); });
  // buttons elsewhere on the page can jump to the grid with a chip selected: <a data-set-chip="gift" href="#catGrid">
  document.querySelectorAll("[data-set-chip]").forEach(function (b) { b.addEventListener("click", function () { clearChecks(); setChip(b.dataset.setChip); }); });
  toggle.addEventListener("click", function () { var o = aside.classList.toggle("open"); toggle.setAttribute("aria-expanded", o ? "true" : "false"); });

  // a link can open the page with one chip selected: ihram.html?chip=air
  var q = new URLSearchParams(location.search).get("chip");
  if (q && chips.some(function (c) { return c.dataset.chip === q; })) setChip(q); else apply();
})();

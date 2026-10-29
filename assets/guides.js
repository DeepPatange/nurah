/* nūrah guide articles: table of contents highlight and an interactive checklist (saved in this browser). */
(function () {
  "use strict";
  // table of contents: highlight the section being read
  var links = [].slice.call(document.querySelectorAll(".toc a"));
  var heads = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
  if (heads.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    heads.forEach(function (h) { io.observe(h); });
  }

  // checklist: ticks are remembered per page; progress shown above the list
  var key = "nurah-check-" + (document.body.dataset.guide || location.pathname);
  var boxes = [].slice.call(document.querySelectorAll(".checklist input[type=checkbox]"));
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) {}
  function update() {
    var done = boxes.filter(function (b) { return b.checked; }).length;
    document.querySelectorAll("[data-progress]").forEach(function (p) {
      p.querySelector("i").style.setProperty("--p", boxes.length ? (done / boxes.length * 100) + "%" : "0%");
      p.querySelector("span").textContent = done + " of " + boxes.length + " packed";
    });
  }
  boxes.forEach(function (b, i) {
    b.id = b.id || "c" + i;
    if (saved[b.id]) b.checked = true;
    b.addEventListener("change", function () {
      saved[b.id] = b.checked;
      try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) {}
      update();
    });
  });
  var reset = document.querySelector("[data-reset]");
  if (reset) reset.addEventListener("click", function () { boxes.forEach(function (b) { b.checked = false; }); saved = {}; try { localStorage.removeItem(key); } catch (e) {} update(); });
  var print = document.querySelector("[data-print]");
  if (print) print.addEventListener("click", function () { window.print(); });
  update();
})();

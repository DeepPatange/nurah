/* nūrah illustrations. Used for showcase only (hero, showcase and the preparation guides), never as product imagery.
   Every illustration is shown as a clean image: no loose painted edge and no blend into the page. */
(function () {
  var clean = [0, 0, 0, 0];
  var base = { radii: [18, 9, 4.6, 2.6], thresholds: [0, 3, 3.6, 5], maxLen: [5, 6, 7, 7], minFocus: [1, 1, 0.6, 0.35], share: [0.1, 0.24, 0.2, 0.16, 0.12], glaze: 0.86, glazeRadius: 2.4, glazeShare: 0.24, edges: clean };
  var light = { radii: [20, 10, 5, 2.8], thresholds: [0, 3.5, 4.5, 6], maxLen: [5, 6, 6, 6], minFocus: [1, 1, 0.5, 0.3], share: [0.1, 0.26, 0.2, 0.14, 0.1], glaze: 0.88, glazeRadius: 2.4, glazeShare: 0.26, edges: clean };
  function mix(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
  var grade = { sat: 0.95, contrast: 1.05, exposure: 1.04, gamma: 0.95, warm: 0.015, knee: 0.9 };
  window.NURAH_PAINTINGS = {
    haram: { src: "haram", title: "Facing the Kaaba", opts: mix(base, { seed: 21, focal: [0.5, 0.62], focus: { x: 0.45, y: 0.55, r: 0.6 }, grade: grade }) },
    pack: { src: "pack", title: "Ready to travel", opts: mix(light, { seed: 4, focal: [0.62, 0.3], focus: { x: 0.62, y: 0.45, r: 0.55 }, grade: { sat: 0.7, contrast: 1.06, exposure: 1.02, gamma: 0.97, warm: 0.04, knee: 0.92 } }) },
    arrive: { src: "arrive", title: "Arrival at the Haram", opts: mix(light, { seed: 9, focal: [0.5, 0.5], focus: { x: 0.5, y: 0.55, r: 0.6 }, grade: grade }) },
    dua: { src: "dua", title: "Dua", opts: mix(light, { seed: 11, focal: [0.5, 0.5], focus: { x: 0.52, y: 0.5, r: 0.5 }, grade: grade }) },
    motion: { src: "motion", title: "Around the Kaaba", opts: mix(light, { seed: 17, focal: [0.5, 0.5], focus: { x: 0.5, y: 0.5, r: 0.6 }, grade: grade }) },
    corner: { src: "corner", title: "The Kaaba against the sky", opts: mix(light, { seed: 23, focal: [0.4, 0.5], focus: { x: 0.45, y: 0.5, r: 0.6 }, grade: grade }) },
    desert: { src: "desert", title: "The journey", opts: mix(light, { seed: 29, focal: [0.5, 0.6], focus: { x: 0.6, y: 0.6, r: 0.6 }, grade: grade }) },
    rites: { src: "rites", title: "At the door of the Kaaba", opts: mix(light, { seed: 13, focal: [0.5, 0.62], focus: { x: 0.5, y: 0.6, r: 0.6 }, grade: { sat: 1.05, contrast: 1.06, exposure: 1.03, gamma: 1, warm: 0.02, knee: 0.92 } }) }
  };
})();

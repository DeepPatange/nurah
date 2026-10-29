/*
  nūrah painter
  Turns a reference photo into an impasto oil painting, one brush stroke at a time.
  Order of work: pencil underdrawing, then paint from broad strokes down to fine detail.
  The painting is drawn forward only, so it can be driven by scroll position.

  Usage:
    var p = new NurahPainter(canvas, imageSrc, options);
    p.ready.then(function () { p.setProgress(0.4); });   // 0 = blank, 1 = finished
*/
(function (root) {
  "use strict";

  function mulberry(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeNoise(rand) {
    var P = new Float32Array(65536);
    for (var i = 0; i < P.length; i++) P[i] = rand();
    function g(a, b) { return P[((b & 255) << 8) | (a & 255)]; }
    return function (x, y) {
      var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      var a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
  }

  function kmeans(R, G, B, n, k, rand) {
    var S = Math.min(6000, n), sr = new Float32Array(S), sg = new Float32Array(S), sb = new Float32Array(S), i, j, it;
    for (i = 0; i < S; i++) { var t = Math.floor(rand() * n); sr[i] = R[t]; sg[i] = G[t]; sb[i] = B[t]; }
    var C = new Float32Array(k * 3);
    for (j = 0; j < k; j++) { var t2 = Math.floor(rand() * S); C[j * 3] = sr[t2]; C[j * 3 + 1] = sg[t2]; C[j * 3 + 2] = sb[t2]; }
    var asg = new Int32Array(S);
    for (it = 0; it < 10; it++) {
      for (i = 0; i < S; i++) { var bd = 1e12, bj = 0; for (j = 0; j < k; j++) { var a = C[j * 3] - sr[i], b = C[j * 3 + 1] - sg[i], c = C[j * 3 + 2] - sb[i], d = a * a + b * b + c * c; if (d < bd) { bd = d; bj = j; } } asg[i] = bj; }
      var acc = new Float32Array(k * 4);
      for (i = 0; i < S; i++) { j = asg[i]; acc[j * 4] += sr[i]; acc[j * 4 + 1] += sg[i]; acc[j * 4 + 2] += sb[i]; acc[j * 4 + 3]++; }
      for (j = 0; j < k; j++) if (acc[j * 4 + 3]) { C[j * 3] = acc[j * 4] / acc[j * 4 + 3]; C[j * 3 + 1] = acc[j * 4 + 1] / acc[j * 4 + 3]; C[j * 3 + 2] = acc[j * 4 + 2] / acc[j * 4 + 3]; }
    }
    return C;
  }

  function gradePx(gr, d, i) {
    var r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (gr.gamma && gr.gamma !== 1) { r = Math.pow(r, gr.gamma); g = Math.pow(g, gr.gamma); b = Math.pow(b, gr.gamma); l = 0.2126 * r + 0.7152 * g + 0.0722 * b; }
    r = l + (r - l) * gr.sat; g = l + (g - l) * gr.sat; b = l + (b - l) * gr.sat;
    r = (r - 0.5) * gr.contrast + 0.5; g = (g - 0.5) * gr.contrast + 0.5; b = (b - 0.5) * gr.contrast + 0.5;
    r *= gr.exposure; g *= gr.exposure; b *= gr.exposure; r += gr.warm * l; b -= gr.warm * l;
    var knee = gr.knee || 0.84;
    if (r > knee) r = knee + (r - knee) * 0.55; if (g > knee) g = knee + (g - knee) * 0.55; if (b > knee) b = knee + (b - knee) * 0.55;
    d[i] = Math.max(0, Math.min(255, r * 255)); d[i + 1] = Math.max(0, Math.min(255, g * 255)); d[i + 2] = Math.max(0, Math.min(255, b * 255));
  }

  // The "glaze": the photo itself, softened with a Kuwahara filter so it reads like smooth oil paint.
  // Laid over the brushwork at the end, it makes the painting clear and close to the real image.
  async function kuwahara(img, W, H, o) {
    var k = Math.min(1, 1200 / Math.max(W, H)), w = Math.max(60, Math.round(W * k)), h = Math.max(60, Math.round(H * k));
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    var x = c.getContext("2d", { willReadFrequently: true });
    var iw = img.naturalWidth, ih = img.naturalHeight, ir = iw / ih, cr = w / h, sw, sh, sx, sy;
    if (ir > cr) { sh = ih; sw = sh * cr; sx = (iw - sw) * o.focal[0]; sy = 0; } else { sw = iw; sh = sw / cr; sx = 0; sy = (ih - sh) * o.focal[1]; }
    x.imageSmoothingQuality = "high"; x.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    var src = x.getImageData(0, 0, w, h), d = src.data, n = w * h, i, yy, xx, t = performance.now();
    for (i = 0; i < n; i++) gradePx(o.grade, d, i * 4);
    var W1 = w + 1, sz = W1 * (h + 1), sR = new Int32Array(sz), sG = new Int32Array(sz), sB = new Int32Array(sz), sL = new Float64Array(sz), sQ = new Float64Array(sz);
    for (yy = 1; yy <= h; yy++) {
      var rr = 0, rg = 0, rb = 0, rl = 0, rq = 0;
      for (xx = 1; xx <= w; xx++) {
        var p = ((yy - 1) * w + xx - 1) * 4, L = 0.2126 * d[p] + 0.7152 * d[p + 1] + 0.0722 * d[p + 2], j = yy * W1 + xx;
        rr += d[p]; rg += d[p + 1]; rb += d[p + 2]; rl += L; rq += L * L;
        sR[j] = sR[j - W1] + rr; sG[j] = sG[j - W1] + rg; sB[j] = sB[j - W1] + rb; sL[j] = sL[j - W1] + rl; sQ[j] = sQ[j - W1] + rq;
      }
    }
    var r = Math.max(2, Math.round((o.glazeRadius || 2.6) * w / 1000)), out = x.createImageData(w, h), od = out.data;
    for (yy = 0; yy < h; yy++) {
      if (performance.now() - t > 30) { await pause(); t = performance.now(); }
      for (xx = 0; xx < w; xx++) {
        var best = 1e18, bi = 0, bx0 = 0, by0 = 0, bx1 = 0, by1 = 0;
        for (var q = 0; q < 4; q++) {
          var x0 = q & 1 ? xx : xx - r, y0 = q & 2 ? yy : yy - r, x1 = (q & 1 ? xx + r : xx) + 1, y1 = (q & 2 ? yy + r : yy) + 1;
          if (x0 < 0) x0 = 0; if (y0 < 0) y0 = 0; if (x1 > w) x1 = w; if (y1 > h) y1 = h;
          var cnt = (x1 - x0) * (y1 - y0), a = y1 * W1 + x1, b2 = y0 * W1 + x1, c2 = y1 * W1 + x0, e2 = y0 * W1 + x0;
          var m = (sL[a] - sL[b2] - sL[c2] + sL[e2]) / cnt, v = (sQ[a] - sQ[b2] - sQ[c2] + sQ[e2]) / cnt - m * m;
          if (v < best) { best = v; bx0 = x0; by0 = y0; bx1 = x1; by1 = y1; }
        }
        var A = by1 * W1 + bx1, B = by0 * W1 + bx1, C = by1 * W1 + bx0, E = by0 * W1 + bx0, N2 = (bx1 - bx0) * (by1 - by0), o4 = (yy * w + xx) * 4;
        od[o4] = (sR[A] - sR[B] - sR[C] + sR[E]) / N2; od[o4 + 1] = (sG[A] - sG[B] - sG[C] + sG[E]) / N2; od[o4 + 2] = (sB[A] - sB[B] - sB[C] + sB[E]) / N2; od[o4 + 3] = 255;
      }
    }
    x.putImageData(out, 0, 0);
    return c;
  }

  function smooth(e0, e1, x) { var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }

  // three passes of a box blur approximate a gaussian
  function blur(src, w, h, r) {
    var a = new Float32Array(src), b = new Float32Array(src.length);
    if (r < 1) return a;
    for (var pass = 0; pass < 3; pass++) { boxH(a, b, w, h, r); boxV(b, a, w, h, r); }
    return a;
  }
  function boxH(s, d, w, h, r) {
    var inv = 1 / (r + r + 1), x, k;
    for (var y = 0; y < h; y++) {
      var row = y * w, acc = 0;
      for (k = -r; k <= r; k++) acc += s[row + Math.min(w - 1, Math.max(0, k))];
      d[row] = acc * inv;
      for (x = 1; x < w; x++) {
        acc += s[row + Math.min(w - 1, x + r)] - s[row + Math.max(0, x - r - 1)];
        d[row + x] = acc * inv;
      }
    }
  }
  function boxV(s, d, w, h, r) {
    var inv = 1 / (r + r + 1), y, k;
    for (var x = 0; x < w; x++) {
      var acc = 0;
      for (k = -r; k <= r; k++) acc += s[Math.min(h - 1, Math.max(0, k)) * w + x];
      d[x] = acc * inv;
      for (y = 1; y < h; y++) {
        acc += s[Math.min(h - 1, y + r) * w + x] - s[Math.max(0, y - r - 1) * w + x];
        d[y * w + x] = acc * inv;
      }
    }
  }
  function sobel(L, w, h) {
    var gx = new Float32Array(w * h), gy = new Float32Array(w * h);
    for (var y = 1; y < h - 1; y++) {
      for (var x = 1; x < w - 1; x++) {
        var i = y * w + x;
        var tl = L[i - w - 1], t = L[i - w], tr = L[i - w + 1], l = L[i - 1], r = L[i + 1], bl = L[i + w - 1], b = L[i + w], br = L[i + w + 1];
        gx[i] = (tr + 2 * r + br) - (tl + 2 * l + bl);
        gy[i] = (bl + 2 * b + br) - (tl + 2 * t + tr);
      }
    }
    return { x: gx, y: gy };
  }

  var DEFAULTS = {
    seed: 7,
    focal: [0.5, 0.5],          // crop focal point of the source image
    radii: [18, 9, 4.6, 2.5, 1.5], // brush radius per layer, in px for a 1000 px wide canvas
    minRadius: 1.4,
    thresholds: [0, 2.5, 3, 3.5, 4], // colour error needed before a finer layer repaints an area
    maxLen: [5, 6, 7, 7, 5],     // control points per stroke, per layer
    minFocus: [1, 1, 0.75, 0.5, 0.3], // share of fine strokes kept outside the focus area
    share: [0.1, 0.26, 0.22, 0.16, 0.13, 0.13], // scroll share: sketch, then each paint layer
    border: 0.045,              // width of the loose unpainted edge, relative to the short side
    focus: { x: 0.5, y: 0.45, r: 0.42 }, // fine detail concentrates here
    grade: { sat: 0.95, contrast: 1.04, exposure: 1.05, gamma: 0.9, warm: 0.015, knee: 0.88 },
    flowAngle: -1.1,            // brush direction in flat areas (radians)
    sketch: true,
    light: [-0.6, -0.8]         // impasto light direction (from the upper left)
  };

  function NurahPainter(canvas, src, opts) {
    var o = {}, k;
    for (k in DEFAULTS) o[k] = DEFAULTS[k];
    for (k in (opts || {})) o[k] = opts[k];
    this.o = o;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.drawn = 0;
    this.target = 0;
    this.strokes = [];
    this.raf = 0;
    this._tick = this._tick.bind(this);
    var self = this;
    this.ready = new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { self._analyse(img).then(function () {
        self.isReady = true;
        if (self.target > 0 && !self.raf) self.raf = requestAnimationFrame(self._tick); // catch up with scroll that happened while preparing
        resolve(self);
      }, reject); };
      img.onerror = reject;
      img.src = src;
    });
  }

  function pause() { return new Promise(function (r) { setTimeout(r, 0); }); }

  // analysis runs in short slices so the page never freezes
  NurahPainter.prototype._analyse = async function (img) {
    var tSlice = performance.now();
    var o = this.o, W = this.canvas.width, H = this.canvas.height;
    var rand = mulberry(o.seed), noise = makeNoise(mulberry(o.seed * 31 + 5));
    this.rand = mulberry(o.seed * 7 + 3);
    this.noise = noise;
    var aw = Math.max(80, Math.round(Math.min(900, W * 0.75, img.naturalWidth * 1.1))), ah = Math.max(80, Math.round(aw * H / W));
    var ks = aw / W; // analysis px per canvas px
    var c = document.createElement("canvas"); c.width = aw; c.height = ah;
    var x = c.getContext("2d", { willReadFrequently: true });
    var iw = img.naturalWidth, ih = img.naturalHeight, ir = iw / ih, cr = aw / ah, sw, sh, sx, sy;
    if (ir > cr) { sh = ih; sw = sh * cr; sx = (iw - sw) * o.focal[0]; sy = 0; }
    else { sw = iw; sh = sw / cr; sx = 0; sy = (ih - sh) * o.focal[1]; }
    x.drawImage(img, sx, sy, sw, sh, 0, 0, aw, ah);
    var d = x.getImageData(0, 0, aw, ah).data, n = aw * ah;
    var R = new Float32Array(n), G = new Float32Array(n), B = new Float32Array(n), L = new Float32Array(n);
    var gr = o.grade;
    for (var i = 0; i < n; i++) {
      var r = d[i * 4] / 255, g = d[i * 4 + 1] / 255, b = d[i * 4 + 2] / 255;
      var l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (gr.gamma && gr.gamma !== 1) { r = Math.pow(r, gr.gamma); g = Math.pow(g, gr.gamma); b = Math.pow(b, gr.gamma); l = 0.2126 * r + 0.7152 * g + 0.0722 * b; }
      r = l + (r - l) * gr.sat; g = l + (g - l) * gr.sat; b = l + (b - l) * gr.sat;
      r = (r - 0.5) * gr.contrast + 0.5; g = (g - 0.5) * gr.contrast + 0.5; b = (b - 0.5) * gr.contrast + 0.5;
      r *= gr.exposure; g *= gr.exposure; b *= gr.exposure;
      r += gr.warm * l; b -= gr.warm * l;
      var knee = gr.knee || 0.84;
      if (r > knee) r = knee + (r - knee) * 0.55; if (g > knee) g = knee + (g - knee) * 0.55; if (b > knee) b = knee + (b - knee) * 0.55;
      R[i] = Math.max(0, Math.min(255, r * 255)); G[i] = Math.max(0, Math.min(255, g * 255)); B[i] = Math.max(0, Math.min(255, b * 255));
      L[i] = 0.2126 * R[i] + 0.7152 * G[i] + 0.0722 * B[i];
    }
    this.palette = o.paletteK ? kmeans(R, G, B, n, o.paletteK, rand) : null;
    var scale = W / 1000, minSide = Math.min(aw, ah);
    var fx = o.focus.x * aw, fy = o.focus.y * ah, fr = o.focus.r * Math.max(aw, ah);

    var ed = o.edges || [o.border, o.border, o.border, o.border]; // loose edge width per side: top, right, bottom, left
    function edgeMask(px, py, extra) {
      var nz = noise(px * 0.035, py * 0.035) - 0.5 + (noise(px * 0.11 + 40, py * 0.11) - 0.5) * 0.5;
      var m = 1, dist = [py, aw - px, ah - py, px];
      for (var e = 0; e < 4; e++) {
        if (!(ed[e] > 0)) continue;
        var bw = Math.max(0.006, ed[e] + extra);
        m = Math.min(m, smooth(0, bw, dist[e] / minSide + nz * bw * 1.1));
      }
      return m;
    }
    this.edgeMask = edgeMask;

    var all = [];
    await pause(); tSlice = performance.now();

    // 1. pencil underdrawing traced along strong edges
    if (o.sketch) {
      var Ls = blur(L, aw, ah, 1), gs = sobel(Ls, aw, ah), M = new Float32Array(n), hist = [];
      for (i = 0; i < n; i++) { M[i] = Math.hypot(gs.x[i], gs.y[i]); if (i % 7 === 0) hist.push(M[i]); }
      hist.sort(function (a, b) { return a - b; });
      var thr = hist[Math.floor(hist.length * 0.9)] || 1, seen = new Uint8Array(n), sketch = [];
      for (var sy0 = 2; sy0 < ah - 2; sy0 += 4) {
        for (var sx0 = 2; sx0 < aw - 2; sx0 += 4) {
          var px0 = sx0 + Math.floor(rand() * 4), py0 = sy0 + Math.floor(rand() * 4), i0 = py0 * aw + px0;
          if (px0 >= aw - 1 || py0 >= ah - 1 || M[i0] < thr || seen[i0]) continue;
          if (rand() > edgeMask(px0, py0, -0.01)) continue;
          var line = [];
          for (var dir = -1; dir <= 1; dir += 2) {
            var lx = px0, ly = py0, pdx = 0, pdy = 0, seg = [];
            for (var st = 0; st < 16; st++) {
              var li = (ly | 0) * aw + (lx | 0);
              if (lx < 1 || ly < 1 || lx >= aw - 1 || ly >= ah - 1 || M[li] < thr * 0.5) break;
              var mg = M[li] || 1, ex = -gs.y[li] / mg * dir, ey = gs.x[li] / mg * dir;
              if (st && ex * pdx + ey * pdy < 0) { ex = -ex; ey = -ey; }
              if (st && ex * pdx + ey * pdy < 0.6) break;
              seen[li] = 1; if (li + 1 < n) seen[li + 1] = 1; if (li + aw < n) seen[li + aw] = 1;
              seg.push(lx, ly);
              lx += ex * 2.2; ly += ey * 2.2; pdx = ex; pdy = ey;
            }
            if (dir < 0) { for (var q = seg.length - 2; q >= 2; q -= 2) line.push(seg[q], seg[q + 1]); }
            else { for (q = 0; q < seg.length; q += 2) line.push(seg[q], seg[q + 1]); }
          }
          if (line.length >= 10) {
            for (q = 0; q < line.length; q++) line[q] /= ks;
            sketch.push({ p: line, r: 0.55 * scale, l: -1, k: (line[1] / H) + rand() * 0.25 });
          }
        }
      }
      sketch.sort(function (a, b) { return a.k - b.k; });
      if (sketch.length > 1600) sketch = sketch.filter(function (_, j) { return j % Math.ceil(sketch.length / 1600) === 0; });
      this.phase = [sketch.length];
      all = all.concat(sketch);
    } else this.phase = [0];
    await pause(); tSlice = performance.now();

    // 2. paint layers, coarse to fine
    var prev = null, prevRb = -1;
    for (var layer = 0; layer < o.radii.length; layer++) {
      var Rc = Math.max(o.minRadius || 2.2, o.radii[layer] * scale), Ra = Rc * ks;
      var rb = Math.max(o.minBlur || 0, Math.floor(Ra * 0.4));
      var cmp = prev; // finest layers share a blur radius with the layer above: compare against a light blur instead, so detail and edges still get strokes
      if (prev && rb <= prevRb) cmp = { r: blur(R, aw, ah, rb + 1), g: blur(G, aw, ah, rb + 1), b: blur(B, aw, ah, rb + 1) };
      prevRb = rb;
      var ref = { r: blur(R, aw, ah, rb), g: blur(G, aw, ah, rb), b: blur(B, aw, ah, rb) };
      var go = sobel(blur(L, aw, ah, Math.max(1, Math.round(Ra * 1.1))), aw, ah);
      var grid = Math.max(1.5, Ra * 0.95), T = o.thresholds[layer] || 0, list = [];
      var extra = layer * 0.008, minF = (o.minFocus || [1, 1, 0.32, 0.14, 0.03])[layer]; if (minF == null) minF = 0.03;
      await pause(); tSlice = performance.now();
      for (var gy0 = 0; gy0 < ah; gy0 += grid) {
        if (performance.now() - tSlice > 40) { await pause(); tSlice = performance.now(); }
        for (var gx0 = 0; gx0 < aw; gx0 += grid) {
          var bx = 0, by = 0;
          if (prev) {
            var x0 = gx0 | 0, y0 = gy0 | 0, x1 = Math.min(aw, (gx0 + grid) | 0), y1 = Math.min(ah, (gy0 + grid) | 0), sum = 0, cnt = 0, best = -1;
            for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) {
              var ii = yy * aw + xx, dr = ref.r[ii] - cmp.r[ii], dg = ref.g[ii] - cmp.g[ii], db = ref.b[ii] - cmp.b[ii];
              var e = Math.sqrt(dr * dr + dg * dg + db * db); sum += e; cnt++;
              if (e > best) { best = e; bx = xx; by = yy; }
            }
            if (!cnt || sum / cnt < T) continue;
          } else { bx = Math.min(aw - 1, gx0 + rand() * grid); by = Math.min(ah - 1, gy0 + rand() * grid); }
          if (rand() > edgeMask(bx, by, extra)) continue;
          if (layer >= 2) {
            var fd = Math.hypot(bx - fx, by - fy), f = Math.max(minF, 1 - smooth(fr * 0.45, fr * 1.25, fd));
            if (rand() > f) continue;
          }
          var s = this._trace(bx, by, Ra, Rc, ks, aw, ah, ref, prev, go, layer, rand);
          s.k = layer === 0 ? (by / ah) * 0.7 + (bx / aw) * 0.3 + rand() * 0.5 : Math.hypot(bx - fx, by - fy) / Math.max(aw, ah) + rand() * 0.45;
          list.push(s);
        }
      }
      list.sort(function (a, b) { return a.k - b.k; });
      this.phase.push(list.length);
      all = all.concat(list);
      prev = ref;
      await pause(); tSlice = performance.now();
    }
    this.strokes = all;
    if (o.glaze > 0) this.glazeCanvas = await kuwahara(img, W, H, o);
    var bounds = [0], acc = 0;
    for (i = 0; i < this.phase.length; i++) { acc += this.phase[i]; bounds.push(acc); }
    this.bounds = bounds;
  };

  NurahPainter.prototype._trace = function (px, py, Ra, Rc, ks, aw, ah, ref, prev, go, layer, rand) {
    var o = this.o, i0 = (py | 0) * aw + (px | 0);
    var cr = ref.r[i0], cg = ref.g[i0], cb = ref.b[i0];
    var pts = [px / ks, py / ks], x = px, y = py, ldx = 0, ldy = 0, fc = 0.42, noise = this.noise;
    for (var k = 1; k < o.maxLen[layer]; k++) {
      var i = (y | 0) * aw + (x | 0);
      if (k > 1) {
        var dr = ref.r[i] - cr, dg = ref.g[i] - cg, db = ref.b[i] - cb, dRef = Math.sqrt(dr * dr + dg * dg + db * db);
        if (prev) {
          var pr = prev.r[i] - cr, pg = prev.g[i] - cg, pb = prev.b[i] - cb;
          if (dRef > Math.sqrt(pr * pr + pg * pg + pb * pb)) break;
        } else if (dRef > 34) break;
      }
      var ux = go.x[i], uy = go.y[i], mag = Math.hypot(ux, uy), dx, dy;
      if (mag < 3) {
        if (k === 1) { var a = o.flowAngle + (noise(x * 0.012, y * 0.012) - 0.5) * 2.2; dx = Math.cos(a); dy = Math.sin(a); }
        else { dx = ldx; dy = ldy; }
      } else { dx = -uy / mag; dy = ux / mag; }
      if (ldx * dx + ldy * dy < 0) { dx = -dx; dy = -dy; }
      if (k > 1) { dx = fc * dx + (1 - fc) * ldx; dy = fc * dy + (1 - fc) * ldy; var m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m; }
      x += Ra * dx; y += Ra * dy;
      if (x < 0 || y < 0 || x >= aw || y >= ah) break;
      pts.push(x / ks, y / ks); ldx = dx; ldy = dy;
    }
    if (pts.length === 2) { // a single dab: give it a short body along the flow
      var a2 = o.flowAngle + (noise(px * 0.012, py * 0.012) - 0.5) * 2.2, h = Rc * 0.7;
      pts = [pts[0] - Math.cos(a2) * h, pts[1] - Math.sin(a2) * h, pts[0] + Math.cos(a2) * h, pts[1] + Math.sin(a2) * h];
    }
    if (this.palette) {
      var pal = this.palette, bi = 0, bd = 1e9;
      for (var q = 0; q < pal.length; q += 3) { var e1 = pal[q] - cr, e2 = pal[q + 1] - cg, e3 = pal[q + 2] - cb, dd = e1 * e1 + e2 * e2 + e3 * e3; if (dd < bd) { bd = dd; bi = q; } }
      var mx = o.paletteMix == null ? 0.6 : o.paletteMix;
      cr += (pal[bi] - cr) * mx; cg += (pal[bi + 1] - cg) * mx; cb += (pal[bi + 2] - cb) * mx;
    }
    var jm = o.jitter == null ? 1 : o.jitter;
    var temp = (rand() - 0.5) * 2 * jm, j = (rand() - 0.5) * (layer === 0 ? 0.12 : 0.07) * jm;
    return { p: pts, r: Rc * (0.85 + rand() * 0.3), l: layer, c: [cr * (1 + j) + temp * 4, cg * (1 + j) + temp * 1, cb * (1 + j) - temp * 4], s: (rand() * 1e9) | 0 };
  };

  // Catmull-Rom resampling to a dense polyline with tangents
  function dense(p, step) {
    var out = [], n = p.length / 2;
    if (n === 1) return [p[0], p[1]];
    for (var i = 0; i < n - 1; i++) {
      var i0 = Math.max(0, i - 1), i2 = i + 1, i3 = Math.min(n - 1, i + 2);
      var x0 = p[i0 * 2], y0 = p[i0 * 2 + 1], x1 = p[i * 2], y1 = p[i * 2 + 1], x2 = p[i2 * 2], y2 = p[i2 * 2 + 1], x3 = p[i3 * 2], y3 = p[i3 * 2 + 1];
      var segs = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step));
      for (var s = 0; s < segs; s++) {
        var t = s / segs, t2 = t * t, t3 = t2 * t;
        out.push(
          0.5 * (2 * x1 + (-x0 + x2) * t + (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2 + (-x0 + 3 * x1 - 3 * x2 + x3) * t3),
          0.5 * (2 * y1 + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3)
        );
      }
    }
    out.push(p[p.length - 2], p[p.length - 1]);
    return out;
  }

  function rgb(r, g, b) { return "rgb(" + Math.max(0, Math.min(255, r | 0)) + "," + Math.max(0, Math.min(255, g | 0)) + "," + Math.max(0, Math.min(255, b | 0)) + ")"; }

  NurahPainter.prototype._draw = function (s) {
    var ctx = this.ctx, rand = mulberry(s.s || 1), i, t;
    if (s.l < 0) { // pencil
      ctx.globalAlpha = 0.5; ctx.strokeStyle = "rgb(62,60,58)"; ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (var pass = 0; pass < 2; pass++) {
        var ox = pass ? (rand() - 0.5) * 2 : 0, oy = pass ? (rand() - 0.5) * 2 : 0;
        ctx.lineWidth = s.r * (pass ? 1.2 : 2) * (0.8 + rand() * 0.5); ctx.globalAlpha = pass ? 0.22 : 0.45;
        ctx.beginPath(); ctx.moveTo(s.p[0] + ox, s.p[1] + oy);
        for (i = 2; i < s.p.length; i += 2) ctx.lineTo(s.p[i] + ox, s.p[i + 1] + oy);
        ctx.stroke();
      }
      return s.p.length;
    }
    var R = s.r, d = dense(s.p, Math.max(1.5, R * 0.33)), n = d.length / 2;
    var nx = new Float32Array(n), ny = new Float32Array(n), tl = new Float32Array(n), len = 0;
    for (i = 0; i < n; i++) {
      var a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
      var tx = d[b * 2] - d[a * 2], ty = d[b * 2 + 1] - d[a * 2 + 1], m = Math.hypot(tx, ty) || 1;
      nx[i] = -ty / m; ny[i] = tx / m;
      if (i) len += Math.hypot(d[i * 2] - d[i * 2 - 2], d[i * 2 + 1] - d[i * 2 - 1]);
      tl[i] = len;
    }
    for (i = 0; i < n; i++) tl[i] = len ? tl[i] / len : 0;
    function taper(t) { var u = Math.min(1, t / 0.12), v = Math.min(1, (1 - t) / 0.2); return 0.62 + 0.38 * Math.sqrt(Math.min(u, v)); }
    var c = s.c, nb = Math.max(3, Math.min(16, Math.round(R * 0.5))), bw = (2 * R / nb) * 1.75, cost = 0;
    var jit = (s.l === 0 ? 0.09 : 0.06) * (this.o.jitter == null ? 1 : this.o.jitter);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (var k = 0; k < nb; k++) {
      var u = -1 + (2 * k + 1) / nb + (rand() - 0.5) / nb, j = (rand() - 0.5) * jit * 2;
      var t0 = rand() * 0.06, t1 = 1 - Math.pow(rand(), 2.2) * 0.32;
      ctx.strokeStyle = rgb(c[0] * (1 + j), c[1] * (1 + j), c[2] * (1 + j));
      ctx.globalAlpha = 0.9; ctx.lineWidth = bw;
      ctx.beginPath();
      var started = false;
      for (i = 0; i < n; i++) {
        t = tl[i]; if (t < t0 || t > t1) continue;
        var w = taper(t) * R * u, X = d[i * 2] + nx[i] * w, Y = d[i * 2 + 1] + ny[i] * w;
        if (!started) { ctx.moveTo(X, Y); started = true; } else ctx.lineTo(X, Y);
      }
      ctx.stroke(); cost += n;
    }
    // impasto: a lit rim on the side facing the light, a shadow on the other
    if (R > 2.5) {
      var anx = 0, any = 0;
      for (i = 0; i < n; i++) { anx += nx[i]; any += ny[i]; }
      var lit = (anx * this.o.light[0] + any * this.o.light[1]) >= 0 ? 1 : -1;
      var rims = [
        { u: lit * 0.72, w: Math.max(0.7, R * 0.1), col: [c[0] + (255 - c[0]) * 0.42, c[1] + (255 - c[1]) * 0.42, c[2] + (255 - c[2]) * 0.4], a: 0.2 },
        { u: -lit * 0.95, w: Math.max(0.7, R * 0.12), col: [c[0] * 0.7, c[1] * 0.7, c[2] * 0.72], a: 0.16 }
      ];
      if (R > 8) rims.push({ u: lit * 0.25, w: R * 0.05, col: [c[0] + (255 - c[0]) * 0.25, c[1] + (255 - c[1]) * 0.25, c[2] + (255 - c[2]) * 0.25], a: 0.14 });
      for (var q = 0; q < rims.length; q++) {
        var rm = rims[q];
        ctx.strokeStyle = rgb(rm.col[0], rm.col[1], rm.col[2]); ctx.globalAlpha = rm.a * (this.o.impasto == null ? 1 : this.o.impasto); ctx.lineWidth = rm.w;
        ctx.beginPath(); started = false;
        var e1 = 0.88 + rand() * 0.1;
        for (i = 0; i < n; i++) {
          t = tl[i]; if (t < 0.04 || t > e1) continue;
          var w2 = taper(t) * R * rm.u, X2 = d[i * 2] + nx[i] * w2, Y2 = d[i * 2 + 1] + ny[i] * w2;
          if (!started) { ctx.moveTo(X2, Y2); started = true; } else ctx.lineTo(X2, Y2);
        }
        ctx.stroke(); cost += n;
      }
    }
    ctx.globalAlpha = 1;
    return cost;
  };

  NurahPainter.prototype._glazeShare = function () { return this.glazeCanvas ? (this.o.glazeShare || 0.24) : 0; };
  NurahPainter.prototype._total = function () {
    var sh = this.o.share, total = 0;
    for (var i = 0; i < this.phase.length; i++) total += this.phase[i] ? sh[i] || 0.1 : 0;
    return total + this._glazeShare();
  };
  NurahPainter.prototype.glazeFor = function (p) {
    var gs = this._glazeShare(); if (!gs) return 0;
    var total = this._total(), start = (total - gs) / total;
    var t = Math.max(0, Math.min(1, (p - start) / (gs / total)));
    return t * t * (3 - 2 * t);
  };
  NurahPainter.prototype._glaze = function (g) {
    if (!this.glazeCanvas || g <= 0 || g === this.lastG) return;
    var ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
    if (!this.snap) { this.snap = document.createElement("canvas"); this.snap.width = W; this.snap.height = H; this.snap.getContext("2d").drawImage(this.canvas, 0, 0); }
    ctx.save(); ctx.globalCompositeOperation = "copy"; ctx.globalAlpha = 1; ctx.drawImage(this.snap, 0, 0); ctx.restore();
    var clean = !(this.o.edges || []).some(function (e) { return e > 0; });
    if (clean) { // clean-edged illustration: fill any gaps between strokes from behind, so the finished image is complete
      ctx.save(); ctx.globalCompositeOperation = "destination-over"; ctx.globalAlpha = g; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(this.glazeCanvas, 0, 0, W, H); ctx.restore();
    }
    ctx.save(); ctx.globalCompositeOperation = "source-atop"; ctx.globalAlpha = g * this.o.glaze; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(this.glazeCanvas, 0, 0, W, H); ctx.restore();
    this.lastG = g;
  };

  NurahPainter.prototype.indexFor = function (p) {
    var sh = this.o.share, b = this.bounds, total = this._total(), i;
    var acc = 0;
    for (i = 0; i < this.phase.length; i++) {
      if (!this.phase[i]) continue;
      var w = (sh[i] || 0.1) / total;
      if (p <= acc + w) return Math.round(b[i] + (b[i + 1] - b[i]) * Math.max(0, (p - acc) / w));
      acc += w;
    }
    return this.strokes.length;
  };

  NurahPainter.prototype.setProgress = function (p) {
    p = Math.max(0, Math.min(1, p));
    if (p <= this.target) return;
    this.target = p;
    if (!this.raf) this.raf = requestAnimationFrame(this._tick);
  };

  NurahPainter.prototype._tick = function () {
    this.raf = 0;
    if (!this.isReady) return;
    var goal = this.indexFor(this.target), budget = 26000, t0 = performance.now();
    while (this.drawn < goal && budget > 0 && performance.now() - t0 < 12) budget -= this._draw(this.strokes[this.drawn++]);
    if (this.drawn < goal) { this.raf = requestAnimationFrame(this._tick); return; }
    if (this.drawn >= this.strokes.length) this._glaze(this.glazeFor(this.target));
  };

  // clear the canvas and start again from a blank sheet
  NurahPainter.prototype.reset = function () {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0; this.drawn = 0; this.target = 0; this.snap = null; this.lastG = -1;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  // paint from blank to finished over a fixed duration, independent of scroll
  NurahPainter.prototype.play = function (ms, done) {
    var self = this, t0 = performance.now(), dur = ms || 7000, token = (this._playToken = (this._playToken || 0) + 1);
    this.reset(); this.playing = true;
    function step(now) {
      if (token !== self._playToken) return;
      var t = Math.min(1, (now - t0) / dur);
      self.setProgress(t);
      if (t < 1) { requestAnimationFrame(step); return; }
      (function wait() { // let the last strokes and the glaze finish drawing
        if (token !== self._playToken) return;
        if (self.raf || self.drawn < self.strokes.length) { requestAnimationFrame(wait); return; }
        self.playing = false; if (done) done();
      })();
    }
    requestAnimationFrame(step);
  };

  // paint, hold, fade out and paint again, for as long as loop() is active
  NurahPainter.prototype.loop = function (ms, hold) {
    var self = this, cv = this.canvas;
    if (this.looping) return;
    this.looping = true;
    cv.style.transition = "opacity .9s ease";
    function cycle() {
      if (!self.looping) return;
      cv.style.opacity = 1;
      self.play(ms, function () {
        clearTimeout(self._loopT);
        self._loopT = setTimeout(function () {
          if (!self.looping) return;
          cv.style.opacity = 0;
          self._loopT = setTimeout(cycle, 950);
        }, hold || 3500);
      });
    }
    cycle();
  };
  NurahPainter.prototype.stopLoop = function () {
    this.looping = false; clearTimeout(this._loopT); this._playToken = (this._playToken || 0) + 1; this.playing = false; this.canvas.style.opacity = 1;
  };

  NurahPainter.prototype.finish = function () {
    this.target = 1;
    if (!this.isReady) return;
    while (this.drawn < this.strokes.length) this._draw(this.strokes[this.drawn++]);
    this._glaze(1);
  };

  // draw synchronously up to a progress value (used for exporting frames)
  NurahPainter.prototype.drawUntil = function (p) {
    if (!this.isReady) return;
    var goal = this.indexFor(p);
    while (this.drawn < goal) this._draw(this.strokes[this.drawn++]);
    if (this.drawn >= this.strokes.length) this._glaze(this.glazeFor(p));
  };

  // light canvas grain, applied only where there is paint (for exported stills)
  NurahPainter.prototype.varnish = function (amount) {
    var W = this.canvas.width, H = this.canvas.height, t = document.createElement("canvas"); t.width = 192; t.height = 192;
    var tx = t.getContext("2d"), im = tx.createImageData(192, 192), r = mulberry(99);
    for (var i = 0; i < 192 * 192; i++) {
      var x = i % 192, y = (i / 192) | 0, v = 236 + r() * 19 - ((x % 3 === 0) ? 7 : 0) - ((y % 3 === 0) ? 5 : 0);
      im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255;
    }
    tx.putImageData(im, 0, 0);
    var copy = document.createElement("canvas"); copy.width = W; copy.height = H; copy.getContext("2d").drawImage(this.canvas, 0, 0);
    var ctx = this.ctx; ctx.save();
    ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = amount == null ? 0.55 : amount;
    ctx.fillStyle = ctx.createPattern(t, "repeat"); ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "destination-in"; ctx.globalAlpha = 1; // keep transparency where unpainted
    ctx.drawImage(copy, 0, 0);
    ctx.restore();
  };

  root.NurahPainter = NurahPainter;
})(window);

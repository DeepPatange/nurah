# nūrah · website prototype

A clickable concept prototype for nūrah, a Hajj and Umrah essentials brand starting in the UAE. It is plain HTML, CSS and JavaScript with no build step.

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| Shop: ihram, women's clothing, accessories, kits | `shop.html` |
| Product page | `product-page.html` |
| Bag | `bag.html` |
| Guides hub and two articles | `guides.html`, `guide-what-to-pack.html`, `guide-miqat-on-a-flight.html` |
| Process board | `process.html` |

Shared code lives in `assets/`: `site.js` holds the product catalogue and the bag, which is stored in `localStorage`. The brush-stroke painting engine is in `paint/`.

## What is not included

This repository holds the code only. Images, video and reference material are kept out because the stock photography is not yet licensed and the reference material belongs to the client. Without them, pages show empty image slots. Two data files are excluded for the same reason: `paint/sources.js` (the photos the painter works from) and `process/data.js` (the process board content).

## Run it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Status

This is a concept. Product names, prices and pilgrimage guidance are placeholders, pending supplier sampling and review by a qualified scholar.

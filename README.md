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

## Images

All images are in `media/`. They are placeholders for the concept: stock previews, reference photos and retailer product shots. None of them is licensed for use beyond this prototype, and all must be licensed or replaced with original photography before anything is published. `paint/sources.js` holds the photos the painting engine works from.

## Run it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Status

This is a concept. Product names, prices and pilgrimage guidance are placeholders, pending supplier sampling and review by a qualified scholar.

# Ranges data

Each `*.json` file in this directory describes one preflop range chart.
The site's range loader (`js/range-loader.js`) reads these and renders
them with a provenance badge.

See `/methodology.html` on the deployed site for the schema and full
conventions. Short version: every file must have an `id`, a `source`
block with `tier` in `{verified, published, unverified}`, and a `grid`
mapping canonical hand notation to `{action, freq}`.

To add a verified range:

1. Export or solve the spot.
2. Write a new file following `_template.json`.
3. Reference it in a lesson page with
   `<div class="range-grid" data-range-src="data/ranges/your-id.json"></div>`.

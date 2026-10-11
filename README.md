# bp-church-website

New website for Sydney Bible-Presbyterian Church, rebuilt as a static site from the Wix prototype
(https://ebonygoh.wixsite.com/sydneybpc). Step 1 is a faithful static copy. Step 2 adds a backend so the content can be edited.

## Run locally

No build step. Serve the repo root:

```sh
python3 -m http.server 8765
# open http://localhost:8765/
```

## Structure

```
index.html, about.html, ...   one file per page (named after the Wix URL slug)
partials/header.html          site header and nav (single source of truth)
partials/footer.html          site footer
scripts/sync-partials.js      stamps the partials into every page between <!-- partial:* --> markers
assets/css/site.css           design tokens, layout, header/footer, buttons, audio player, animations
assets/css/<page-group>.css   page-specific styles
assets/js/site.js             mobile nav, dropdowns, scroll animations, slideshow, audio player
assets/images/                images downloaded from the prototype
```

After editing a partial, run `node scripts/sync-partials.js` (or pass specific pages).

## Design

- Font: DM Sans (Google Fonts)
- Colours: cream `#fefaf0`, sand `#ede8db`, slate ink `#3a4c53`, stone `#cdcfc9`, olive `#dcd9b2`, plus the ministry blob colours (see `:root` in `site.css`)
- Animations: fade, float and reveal on scroll, matching Wix's `fadeIn` / `floatIn` / `revealIn`, triggered by `data-anim`. Reduced-motion is respected.
- Responsive: desktop layout at 900px and above, Wix-style mobile layout below 750px.

## Notes

- Sermon audio streams from `www.sydneybp.com.au/downloads/...` (not stored in this repo).
- Not migrated: Wix template leftovers (store/product pages, `general-5`, `book-online`, `event-list`, `sermonsold`).

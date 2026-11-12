# Elf Ideas

A phone-first catalog of the Elf on the Shelf setups Karthik’s family made for Nivaan from 2020 to 2024. Friends can browse the photos, save ideas, and plan December nights. Everything personal stays in the browser. There is no account and no ads.

Live: https://karthikvepuriphoto-gif.github.io/elf-ideas/

## Develop

```bash
npm install
npm test
npm run dev
```

The dev server uses the `/elf-ideas/` base path. `npm run build` outputs `dist/` for GitHub Pages.

## Data

`src/data/ideas.json` is the seed catalog (90 ideas). Photos live in `public/photos/` and small grid thumbnails in `public/thumbs/`.

Each idea has a `source`. Everything in the seed catalog is `"Our family"`. A later `"Friend"` or `"Web"` idea can use the same fields, plus optional `credit` and `link`. The app already renders those fields; there is no separate screen for adding them yet.

## On your phone

The first visit in a mobile browser offers steps to add Elf Ideas to the Home Screen. The same guide is in the menu. After that first visit, a service worker keeps the catalog available offline. Want to try, done dates, notes, supply checks, and the night plan are stored on the device. Export or import that list as JSON from the menu or My plan.

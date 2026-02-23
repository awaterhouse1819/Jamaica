# Pixel Isles - Escape to Jamaica

Static front-end experience built from the PRD using plain HTML, CSS, and vanilla JS.

## Run locally

From this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Use your hero image

Place your provided splash image at:

```text
assets/hero-bg.jpg
```

The app already points to this path and falls back to `assets/hero-bg.svg` if `hero-bg.jpg` is missing.

## Deploy quickly

## Option 1: GitHub Pages

1. Push this folder to a GitHub repo.
2. In repo settings, open Pages.
3. Set source to deploy from `main` branch root (`/`).
4. Save and use the generated URL.

## Option 2: Netlify

1. Create a new site from Git.
2. Build command: leave empty.
3. Publish directory: `.`
4. Deploy.

## Option 3: Vercel

1. Import the repo.
2. Framework preset: `Other`.
3. Build command: empty.
4. Output directory: `.`
5. Deploy.

## Project structure

```text
index.html
styles/
  reset.css
  tokens.css
  hero.css
  grid.css
  modal.css
scripts/
  data.js
  hero.js
  grid.js
  modal.js
  app.js
assets/
  hero-bg.svg
  hotels/*.svg
```

## Content updates

Edit `scripts/data.js` to update hotels, prices, amenities, links, and image paths.

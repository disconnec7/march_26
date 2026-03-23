# March 26 — puzzle site (GitHub Pages)

Static puzzles: HTML, CSS, vanilla JavaScript. **No homepage** — visitors are expected to open a link from email with a puzzle parameter.

## Files

| Path | Purpose |
|------|--------|
| `index.html` | Shell |
| `css/styles.css` | Layout & theme |
| `js/puzzle.js` | Engine & `REGISTRY` |
| `assets/` | Companion images (see below) |

## URL (email links)

Use **`puzzle`** or **`utm_puzzle`** (same value):

- `https://<your-site>/index.html?puzzle=1`
- `https://<your-site>/index.html?utm_puzzle=1`

If the parameter is missing or invalid, users see a short **“open the link from your email”** message — there is no site navigation.

## Companion images (`assets/`)

Default mapping (matches `*_sashe.jpg` in the repo):

| Puzzle id | File |
|-----------|------|
| 1 | `assets/2011_sashe.jpg` |
| 2 | `assets/2012_sashe.jpg` |
| … | … |
| 15 | `assets/2025_sashe.jpg` |

Formula: **`assets/{2010 + puzzleId}_sashe.jpg`**

To use a **different file** for one puzzle, set in `js/puzzle.js`:

```js
companion: {
  imageUrl: "assets/custom-name.jpg",
  description: "…",
}
```

## Run locally

```bash
cd march_26
python3 -m http.server 8080
```

Visit `http://localhost:8080/?puzzle=1` (opening `/` alone shows the “email link” message).

## Publish on GitHub Pages

Upload the contents of this folder as the Pages root (or `/docs`). Ensure `assets/` and its images are included in the repo.

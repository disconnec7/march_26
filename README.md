# March 26 — puzzle site (GitHub Pages)

Static puzzle games: HTML, CSS, and vanilla JavaScript. No build step.

## Files

| Path | Purpose |
|------|--------|
| `index.html` | Entry page |
| `css/styles.css` | Layout & theme |
| `js/puzzle.js` | Puzzle engine & content (`REGISTRY`) |

## Run locally

Open `index.html` in a browser, or from this folder:

```bash
cd march_26
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Publish on GitHub Pages

1. Create a repo and upload **the contents of `march_26`** (not the parent `HTML Tests` folder unless that’s your site root).
2. In the repo: **Settings → Pages**.
3. **Source:** Deploy from a branch (e.g. `main`) and folder **`/ (root)`**, *or* put these files in a `docs` folder and choose **`/docs`**.

Your site will be:

- `https://<username>.github.io/<repo>/` if the project site uses the repo root or `docs`.

If you keep this project **inside** a monorepo as `march_26/`, either:

- Copy `march_26/*` into the branch/folder GitHub Pages uses, **or**
- Use the URL `https://<username>.github.io/<repo>/march_26/` only if that folder is what you deploy (Pages usually expects `index.html` at the published root).

## Puzzles

- Home lists puzzles **1–15**. Active puzzles are defined in `js/puzzle.js` → `REGISTRY`.
- Direct link: `index.html?puzzle=1` (also supports `utm_puzzle` for old links).

## Companion image

Puzzle 1 uses a remote image URL in `js/puzzle.js`. Replace `COMPANION_PLACEHOLDER_*` or host an image in this repo (e.g. `images/companion.jpg`) and point `imageUrl` to `images/companion.jpg`.

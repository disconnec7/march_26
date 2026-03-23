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

## Headings (in order)

1. **Companion line** — auto: `{year} Sashe` (year = `2010 + puzzle id`, e.g. `2011 Sashe`).
2. **Companion block** — image + intro `description` from `REGISTRY`.
3. **Puzzle title** — `puzzleTitle` in `js/puzzle.js` (e.g. *Also a Taylor Swift song*).  
   There is no separate “Puzzle 1” label at the top.

**Flow:** Each puzzle starts with **only** the companion (year Sashe + image + intro) and a **Begin** button. After you finish, you see **Continue your journey** → then **Await further instructions:**.

## Theme (per puzzle)

Each puzzle id uses one album palette from the [taylor `album_palettes` reference](https://taylor.wjakethompson.com/reference/album_palettes), in **`album_compare`** order:

| Puzzle | Album key |
|--------|-----------|
| 1 | `taylor_swift` |
| 2 | `fearless` |
| 3 | `speak_now` |
| 4 | `red` |
| 5 | `1989` |
| 6 | `reputation` |
| 7 | `lover` |
| 8 | `folklore` |
| 9 | `evermore` |
| 10 | `fearless_tv` |
| 11 | `red_tv` |
| 12 | `midnights` |
| 13 | `speak_now_tv` |
| 14 | `1989_tv` |
| 15 | `tortured_poets` |

(`showgirl` is in `js/puzzle.js` for reuse but not assigned until you add a 16th puzzle.)

CSS variables (`--bg`, `--surface`, `--accent`, etc.) are set in **`applyAlbumThemeForPuzzleId()`** in `js/puzzle.js`. Invalid/missing URL → **evermore** fallback.

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

## Puzzle types (`REGISTRY`)

| `type` | Behaviour |
|--------|-----------|
| `sequential_clues` | Clues one-by-one with text answer (puzzle **1**). Uses `clues[]` with `text` + `answers[]`. |
| `connections` | 16 tiles; player picks **4** that share a category. Uses `groups`: **4 arrays of 4 strings** (see puzzle **2**). Words are **shuffled** on load unless `shuffle: false`. Each correct group is locked; win after all **4** groups. |
| `unscramble` | **`rounds`**: array of `{ scrambled, answers[] }` — one screen per round with progress (puzzle **3** = **10** titles in one game). Legacy: single `scrambled` + `answers` on `def` still works. Matching ignores spaces & punctuation. |

Add a new puzzle: copy the shape of `PUZZLE_1` or `PUZZLE_2`, assign a new id, and add it to `REGISTRY`.

## Run locally

```bash
cd march_26
python3 -m http.server 8080
```

Visit `http://localhost:8080/?puzzle=1` (opening `/` alone shows the “email link” message).

## Publish on GitHub Pages

Upload the contents of this folder as the Pages root (or `/docs`). Ensure `assets/` and its images are included in the repo.

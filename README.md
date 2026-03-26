# March 26 — puzzle site (GitHub Pages)

Static puzzles: HTML, CSS, vanilla JavaScript. The **home page** lists all **15** puzzles; optional **deep links** still work.

## Files

| Path | Purpose |
|------|--------|
| `index.html` | Shell |
| `css/styles.css` | Layout & theme |
| `js/puzzle.js` | Engine & `REGISTRY` |
| `assets/` | Companion images (see below) |

## URLs (optional deep links)

- **Home:** `https://<your-site>/index.html` — pick any puzzle.
- **Hash:** `https://<your-site>/index.html#3` opens puzzle **3** (browser back/forward updates the list).
- **Query (legacy / email):** `?puzzle=1` or `?utm_puzzle=1` — same value. If both hash and query are present, **hash wins**.

## Headings (in order)

1. **Companion line** — auto: `{year} Sashe` via **`PUZZLE_COMPANION_YEARS`** in `js/puzzle.js` (2011–2013, 2015–2026; **no 2014**).
2. **Begin gate** — that year’s image + **bio** from **`COMPANION_BIOS`** (not the puzzle rules).
3. **After Begin** — `puzzleTitle`, then **`companion.description`** from `REGISTRY` (rules), then the puzzle UI.

**Flow:** Begin shows **photo + bio** only, then **Begin** → rules + board. After completion: **Back to Home Page** returns to the picker.

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

CSS variables (`--bg`, `--surface`, `--accent`, etc.) are set in **`applyAlbumThemeForPuzzleId()`** in `js/puzzle.js`. The **home** page uses the **evermore** palette; each puzzle uses its own album theme.

## Companion images (`assets/`)

Default file per puzzle id = **`assets/{year}_sashe.jpg`** where `year` is **`PUZZLE_COMPANION_YEARS[id − 1]`** (puzzle **15** → **`2026_sashe.jpg`**). There is **no** `2014_sashe` in this sequence.

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

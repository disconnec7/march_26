/**
 * March 26 puzzle site — email deep-links only.
 * Expects ?puzzle=1..15 or ?utm_puzzle= (no homepage / no in-site navigation).
 * Companion images: repo files assets/{year}_sashe.jpg with year = 2010 + puzzle id
 * (puzzle 1 → 2011_sashe.jpg … puzzle 15 → 2025_sashe.jpg).
 * Override per puzzle: companion.imageUrl in REGISTRY.
 */
(function () {
  "use strict";

  var MAX_PUZZLE = 15;

  /**
   * taylor R package album_palettes (same order as album_compare).
   * https://taylor.wjakethompson.com/reference/album_palettes
   * Puzzle 1 → index 0 … puzzle 15 → index 14 (showgirl unused until puzzle 16).
   */
  var ALBUM_PALETTES = {
    taylor_swift: ["#1D4737", "#81A757", "#1BAEC6", "#523d28", "#E7DBCC"],
    fearless: ["#6E4823", "#976F34", "#CBA863", "#ECD59F", "#E1D4C2"],
    speak_now: ["#2E1924", "#6C3127", "#833C63", "#D1A0C7", "#F5E8E2"],
    red: ["#201F39", "#A91E47", "#7E6358", "#B0A49A", "#DDD8C9"],
    "1989": ["#5D4E5D", "#846578", "#92573C", "#C6B69C", "#D8D8CF"],
    reputation: ["#2C2C2C", "#515151", "#5B5B5B", "#6E6E6E", "#B9B9B9"],
    lover: ["#76BAE0", "#8C4F66", "#B8396B", "#EBBED3", "#FFF5CC"],
    folklore: ["#3E3E3E", "#545454", "#5C5C5C", "#949494", "#EBEBEB"],
    evermore: ["#160E10", "#421E18", "#D37F55", "#85796D", "#E0D9D7"],
    fearless_tv: ["#624324", "#A47F45", "#CAA462", "#C5AA7C", "#EEDBA9"],
    red_tv: ["#400303", "#731803", "#967862", "#B38468", "#C7C5B6"],
    midnights: ["#121D27", "#5A658B", "#6F86A2", "#85A7BA", "#AA9EB6"],
    speak_now_tv: ["#2A122C", "#4a2454", "#72325F", "#874886", "#96689A"],
    "1989_tv": ["#487398", "#659BBB", "#8BB5D2", "#AFC5D4", "#E4DFD3"],
    tortured_poets: ["#1C160F", "#3F3824", "#635B3A", "#ADA795", "#F7F4F0"],
    showgirl: ["#C44615", "#EB8246", "#F0CD92", "#6CAE90", "#3E5C38"],
  };

  var PALETTE_ORDER = [
    "taylor_swift",
    "fearless",
    "speak_now",
    "red",
    "1989",
    "reputation",
    "lover",
    "folklore",
    "evermore",
    "fearless_tv",
    "red_tv",
    "midnights",
    "speak_now_tv",
    "1989_tv",
    "tortured_poets",
  ];

  function parseHex(hex) {
    var h = String(hex).replace(/^#/, "").trim();
    if (h.length === 3) {
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16),
      };
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function rgbToHex(r, g, b) {
    function clamp(n) {
      return Math.max(0, Math.min(255, Math.round(n)));
    }
    function hex2(n) {
      var s = clamp(n).toString(16);
      return s.length === 1 ? "0" + s : s;
    }
    return "#" + hex2(r) + hex2(g) + hex2(b);
  }

  function mixHex(a, b, t) {
    var A = parseHex(a);
    var B = parseHex(b);
    return rgbToHex(
      A.r + (B.r - A.r) * t,
      A.g + (B.g - A.g) * t,
      A.b + (B.b - A.b) * t
    );
  }

  function darkenHex(hex, amount) {
    var A = parseHex(hex);
    var f = 1 - amount;
    return rgbToHex(A.r * f, A.g * f, A.b * f);
  }

  function relativeLuminance(hex) {
    var o = parseHex(hex);
    function lin(c) {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    var R = lin(o.r);
    var G = lin(o.g);
    var B = lin(o.b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  /** Maps palette swatches to UI roles: bg, surface, accent, border, text. */
  function applyAlbumTheme(paletteKey) {
    var p = ALBUM_PALETTES[paletteKey];
    if (!p || p.length < 5) return;
    var c0 = p[0];
    var c1 = p[1];
    var c2 = p[2];
    var c3 = p[3];
    var c4 = p[4];
    var root = document.documentElement;
    var gradMid = mixHex(c0, c1, 0.38);
    var o3 = parseHex(c3);
    var o2 = parseHex(c2);

    root.style.setProperty("--bg", c0);
    root.style.setProperty("--surface", c1);
    root.style.setProperty("--accent", c2);
    root.style.setProperty("--border", c3);
    root.style.setProperty("--text", c4);
    root.style.setProperty("--muted", mixHex(c3, c4, 0.42));
    root.style.setProperty("--gradient-mid", gradMid);
    root.style.setProperty("--btn-grad-start", darkenHex(c2, 0.14));
    root.style.setProperty(
      "--border-soft",
      "rgba(" + o3.r + "," + o3.g + "," + o3.b + ",0.42)"
    );
    root.style.setProperty(
      "--accent-focus-glow",
      "rgba(" + o2.r + "," + o2.g + "," + o2.b + ",0.3)"
    );

    var lum = relativeLuminance(c2);
    root.style.setProperty(
      "--btn-text",
      lum > 0.55 ? "#1a1a1a" : "#f7f4f0"
    );
  }

  /**
   * Puzzle 1 uses taylor_swift palette: cyan accent on light green reads poorly.
   * Switch accent to album dark green (#1D4737) and tighten borders.
   */
  function applyPuzzleOneThemeTweaks() {
    document.documentElement.setAttribute("data-puzzle-id", "1");
    var root = document.documentElement;
    root.style.setProperty("--accent", "#1D4737");
    root.style.setProperty("--btn-grad-start", "#0f261f");
    root.style.setProperty("--btn-text", "#E7DBCC");
    root.style.setProperty("--accent-focus-glow", "rgba(29, 71, 55, 0.42)");
    var borderGreen = "#3d5c4f";
    root.style.setProperty("--border", borderGreen);
    var o = parseHex(borderGreen);
    root.style.setProperty(
      "--border-soft",
      "rgba(" + o.r + "," + o.g + "," + o.b + ",0.42)"
    );
  }

  function applyAlbumThemeForPuzzleId(puzzleId) {
    document.documentElement.removeAttribute("data-puzzle-id");
    if (puzzleId >= 1 && puzzleId <= MAX_PUZZLE) {
      var key = PALETTE_ORDER[puzzleId - 1];
      if (key && ALBUM_PALETTES[key]) {
        applyAlbumTheme(key);
        if (puzzleId === 1) {
          applyPuzzleOneThemeTweaks();
        }
        return;
      }
    }
    applyAlbumTheme("evermore");
  }

  function getPuzzleIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var raw = params.get("puzzle") || params.get("utm_puzzle");
    if (raw === null || raw === "") return null;
    var n = parseInt(String(raw).trim(), 10);
    if (Number.isNaN(n)) return null;
    return n;
  }

  function normalizeAnswer(s) {
    return String(s || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  /** e.g. "2011 Sashe" … "2025 Sashe" (year from puzzle id) */
  function companionHeading(puzzleId) {
    if (puzzleId < 1 || puzzleId > MAX_PUZZLE) return "";
    var year = 2010 + puzzleId;
    return year + " Sashe";
  }

  /** Default image path for puzzle id (matches assets/ in the repo). */
  function defaultCompanionImagePath(puzzleId) {
    if (puzzleId < 1 || puzzleId > MAX_PUZZLE) return "";
    var year = 2010 + puzzleId;
    return "assets/" + year + "_sashe.jpg";
  }

  /**
   * Build companion payload for rendering.
   * If def.companion is missing → no companion block.
   * If companion has no imageUrl → use default path for def.id.
   */
  function getCompanionForRender(def) {
    if (!def.companion) return null;
    var c = def.companion;
    var url = c.imageUrl || defaultCompanionImagePath(def.id);
    if (!url) return null;
    return { imageUrl: url, description: c.description };
  }

  var PUZZLE_1 = {
    id: 1,
    /** Shown below companion + intro; distinct from companion heading. */
    puzzleTitle: "Also a Taylor Swift song",
    type: "sequential_clues",
    companion: {
      description:
        "Hello my trusty companion... I have been searching throughout all the knowledge in the world but can't seem to break this cypher. If you are able to help me I will greatly appreciate it. ",
    },
    clues: [
      {
        text:
          "In your high school math class, you calculated the average of a set of numbers by adding them all up and dividing by the total.",
        answers: ["mean"],
      },
      {
        text:
          "A frantic discovery of this yellow element, like the one in California in 1849.",
        answers: ["gold rush"],
      },
      {
        text:
          "Careful! This washing machine cycle using cold water and low spin speed is suggested for lingerie & silk neckties",
        answers: ["delicate"],
      },
      {
        text:
          'It\'s not yours! It\'s this word that comes before "craft" and "sweeper" in the names of popular video games',
        answers: ["mine"],
      },
      {
        text:
          "While crossing the George Washington Bridge from New Jersey, drivers are greeted by a sign with these 4 words",
        answers: ["welcome to new york"],
      },
    ],
  };

  function shuffleArray(arr) {
    var a = arr.slice();
    var i;
    for (i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function normalizeConnectionWord(w) {
    return String(w).trim().toUpperCase();
  }

  function sameWordSet(selected, group) {
    if (selected.length !== group.length) return false;
    var a = selected.slice().sort();
    var b = group.slice().sort();
    var i;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  var PUZZLE_2 = {
    id: 2,
    puzzleTitle: "Find the connections",
    type: "connections",
    companion: {
      description:
        "Four groups of four — each set has something in common. Tap four tiles, then we’ll check. Find all four groups!",
    },
    /** Four groups, four words each. Comparison is case-insensitive. */
    groups: [
      ["RED", "1989", "LOVER", "MIDNIGHTS"],
      ["BLUE", "GREEN", "GOLD", "PURPLE"],
      ["CARDIGAN", "WILLOW", "MIRRORBALL", "AUGUST"],
      ["SCARF", "DRESS", "STRING", "DIAMOND"],
    ],
    /** If false, words stay in definition order (not recommended). Default: shuffle. */
    shuffle: true,
  };

  /** Strip spaces/punctuation for title guesses (keeps letters only). */
  function normalizeUnscrambleGuess(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function unscrambleMatches(guess, answers) {
    var g = normalizeUnscrambleGuess(guess);
    if (!g) return false;
    var i;
    for (i = 0; i < answers.length; i++) {
      if (normalizeUnscrambleGuess(answers[i]) === g) return true;
    }
    return false;
  }

  /** One game under ?puzzle=3: 10 rounds, including long titles. */
  var PUZZLE_3 = {
    id: 3,
    puzzleTitle: "Unscramble the song title",
    type: "unscramble",
    companion: {
      description:
        "Ten Taylor Swift titles — all scrambled. Some are long! Spaces and punctuation don’t count. Solve all ten.",
    },
    rounds: [
      { scrambled: "BNOOOYLND", answers: ["london boy", "londonboy"] },
      { scrambled: "TOIHANRE", answers: ["antihero", "anti hero", "anti-hero"] },
      { scrambled: "MURSUMELECR", answers: ["cruel summer", "cruelsummer"] },
      { scrambled: "EDELBWEEJ", answers: ["bejeweled", "be jeweled"] },
      { scrambled: "YLVSETORO", answers: ["love story", "lovestory"] },
      {
        scrambled: "EDDTRIMLEASSW",
        answers: ["wildest dreams", "wildestdreams"],
      },
      {
        scrambled: "ALNPEGCBMSEHMRAOP",
        answers: ["champagne problems", "champagneproblems"],
      },
      {
        scrambled: "NEMVLIOELEOTWALLINTENSRTUO",
        answers: [
          "all too well ten minute version",
          "alltoowelltenminuteversion",
          "all too well (ten minute version)",
        ],
      },
      { scrambled: "EAWHEWYRPPE", answers: ["we were happy", "wewerehappy"] },
      {
        scrambled: "RNMALTREASSTNTCGAHAATDYYEIE",
        answers: [
          "the last great american dynasty",
          "thelastgreatamericandynasty",
        ],
      },
    ],
  };

  var REGISTRY = {
    1: PUZZLE_1,
    2: PUZZLE_2,
    3: PUZZLE_3,
  };

  function escapeAttr(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function renderCompanionHtml(companion) {
    if (!companion || !companion.imageUrl) return "";
    var imgSrc = escapeAttr(companion.imageUrl);
    var desc =
      companion.description != null ? escapeHtml(companion.description) : "";
    return (
      '<div class="companion" role="region" aria-label="From your companion">' +
      '<figure class="companion-img-wrap">' +
      '<img class="companion-img" src="' +
      imgSrc +
      '" alt="Companion" width="112" loading="lazy" />' +
      "</figure>" +
      '<div class="companion-text">' +
      desc +
      "</div>" +
      "</div>"
    );
  }

  /** After “Continue your journey”. */
  function renderJourneyAwaitScreen(root) {
    root.innerHTML =
      '<div class="card complete journey-end">' +
      '<p class="journey-await">Await further instructions</p>' +
      "</div>";
  }

  function showPuzzleCompleteWithContinue(root, summaryHtml) {
    root.innerHTML =
      '<div class="card complete">' +
      summaryHtml +
      '<div class="actions continue-journey-wrap">' +
      '<button type="button" class="primary" id="btn-continue-journey">Continue your journey</button>' +
      "</div>" +
      "</div>";
    var cbtn = document.getElementById("btn-continue-journey");
    if (cbtn) {
      cbtn.addEventListener("click", function () {
        renderJourneyAwaitScreen(root);
      });
    }
  }

  /** Companion + Begin before the main puzzle UI. */
  function renderPuzzleBeginGate(root, def, onBegin) {
    var companionBlock = renderCompanionHtml(getCompanionForRender(def));
    root.innerHTML =
      '<div class="card begin-gate-card" id="begin-gate">' +
      '<h1 class="companion-heading">' +
      escapeHtml(companionHeading(def.id)) +
      "</h1>" +
      companionBlock +
      '<div class="actions begin-gate-actions">' +
      '<button type="button" class="primary" id="btn-begin-puzzle">Begin</button>' +
      "</div>" +
      "</div>";
    document.getElementById("btn-begin-puzzle").addEventListener("click", onBegin);
  }

  /** Shown when the URL has no valid puzzle parameter (not linked from email). */
  function renderMissingPuzzleParam(root) {
    root.innerHTML =
      '<div class="card">' +
      "<h1 class=\"companion-heading\">Almost there</h1>" +
      '<p class="placeholder-puzzle">This page is opened from a link in your email. If you see this message, open the message again and tap the puzzle link.</p>' +
      "</div>";
  }

  function renderPlaceholder(root, id) {
    var head = companionHeading(id);
    root.innerHTML =
      '<div class="card">' +
      (head
        ? '<h1 class="companion-heading">' + escapeHtml(head) + "</h1>"
        : "") +
      '<h2 class="puzzle-heading">Coming soon</h2>' +
      '<p class="placeholder-puzzle">This puzzle is not available yet.</p>' +
      "</div>";
  }

  function renderSequentialClues(root, def) {
    var step = 0;
    var total = def.clues.length;
    var puzzleTitle =
      def.puzzleTitle != null
        ? def.puzzleTitle
        : def.title != null
          ? def.title
          : "Puzzle";

    function renderStep() {
      if (step >= total) {
        showPuzzleCompleteWithContinue(
          root,
          "<h2>You did it!</h2>" +
            "<p>All " +
            total +
            " answers are correct.</p>"
        );
        return;
      }

      var c = def.clues[step];
      var pct = ((step + 1) / total) * 100;
      var topBlock =
        '<h2 class="puzzle-heading puzzle-heading--solo">' +
        escapeHtml(puzzleTitle) +
        "</h2>";

      root.innerHTML =
        '<div class="card" id="puzzle-card">' +
        topBlock +
        '<div class="progress">' +
        "<span>" +
        (step + 1) +
        " / " +
        total +
        "</span>" +
        '<div class="progress-bar"><div class="progress-fill" style="width:' +
        pct +
        '%"></div></div>' +
        "</div>" +
        '<p class="clue" id="clue-text">' +
        escapeHtml(c.text) +
        "</p>" +
        '<div class="form-row">' +
        '<label for="answer">Your answer</label>' +
        '<input type="text" id="answer" autocomplete="off" placeholder="Type the answer" />' +
        "</div>" +
        '<div class="actions">' +
        '<button type="button" class="primary" id="btn-submit">Check</button>' +
        "</div>" +
        '<p class="message" id="msg" aria-live="polite"></p>' +
        "</div>";

      var input = document.getElementById("answer");
      var msg = document.getElementById("msg");
      var btn = document.getElementById("btn-submit");

      function check() {
        var val = normalizeAnswer(input.value);
        var ok = c.answers.some(function (a) {
          return normalizeAnswer(a) === val;
        });
        if (!val) {
          msg.className = "message error";
          msg.textContent = "Enter an answer to continue.";
          return;
        }
        if (!ok) {
          msg.className = "message error";
          msg.textContent = "Not quite — try again.";
          return;
        }
        msg.className = "message success";
        msg.textContent = "Correct! Next clue…";
        btn.disabled = true;
        input.disabled = true;
        setTimeout(function () {
          step += 1;
          renderStep();
        }, 650);
      }

      btn.addEventListener("click", check);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") check();
      });
      input.focus();
    }

    renderPuzzleBeginGate(root, def, function () {
      renderStep();
    });
  }

  /**
   * Unscramble a song title: def.scrambled (display), def.answers (accepted strings).
   */
  /** Use def.rounds[], or legacy single { scrambled, answers } on def. */
  function getUnscrambleRounds(def) {
    if (def.rounds && def.rounds.length) return def.rounds;
    if (def.scrambled && def.answers) {
      return [{ scrambled: def.scrambled, answers: def.answers }];
    }
    return [];
  }

  function renderUnscramble(root, def) {
    var rounds = getUnscrambleRounds(def);
    if (!rounds.length) {
      renderPlaceholder(root, def.id);
      return;
    }

    var step = 0;
    var total = rounds.length;
    var puzzleTitle =
      def.puzzleTitle != null
        ? def.puzzleTitle
        : def.title != null
          ? def.title
          : "Unscramble the song title";

    function renderStep() {
      if (step >= total) {
        showPuzzleCompleteWithContinue(
          root,
          "<h2>You did it!</h2>" +
            "<p>All " +
            total +
            " titles unscrambled.</p>"
        );
        return;
      }

      var round = rounds[step];
      var letters = String(round.scrambled || "").toUpperCase();
      var longClass =
        letters.length > 18 ? " unscramble-letters--long" : "";
      var pct = ((step + 1) / total) * 100;
      var topBlock =
        '<h2 class="puzzle-heading puzzle-heading--solo">' +
        escapeHtml(puzzleTitle) +
        "</h2>";

      root.innerHTML =
        '<div class="card unscramble-card" id="unscramble-root">' +
        topBlock +
        '<div class="progress">' +
        "<span>" +
        (step + 1) +
        " / " +
        total +
        "</span>" +
        '<div class="progress-bar"><div class="progress-fill" style="width:' +
        pct +
        '%"></div></div>' +
        "</div>" +
        '<p class="unscramble-lead">Unscramble the letters to name the song.</p>' +
        '<p class="unscramble-letters' +
        longClass +
        '" id="unscramble-display" aria-label="Scrambled title">' +
        escapeHtml(letters) +
        "</p>" +
        '<div class="form-row">' +
        '<label for="unscramble-guess">Your guess</label>' +
        '<input type="text" id="unscramble-guess" autocomplete="off" placeholder="Song title" />' +
        "</div>" +
        '<div class="actions">' +
        '<button type="button" class="primary" id="unscramble-submit">Submit</button>' +
        "</div>" +
        '<p class="message" id="unscramble-result" aria-live="polite"></p>' +
        "</div>";

      var input = document.getElementById("unscramble-guess");
      var result = document.getElementById("unscramble-result");
      var btn = document.getElementById("unscramble-submit");

      function check() {
        if (btn.disabled) return;
        if (!normalizeUnscrambleGuess(input.value)) {
          result.className = "message error";
          result.textContent = "Type a guess first.";
          return;
        }
        var ok = unscrambleMatches(input.value, round.answers);
        if (ok) {
          result.className = "message success";
          result.textContent = "Correct ✨";
          btn.disabled = true;
          input.disabled = true;
          setTimeout(function () {
            step += 1;
            renderStep();
          }, 650);
        } else {
          result.className = "message error";
          result.textContent = "Try again.";
        }
      }

      btn.addEventListener("click", check);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") check();
      });
      input.focus();
    }

    renderPuzzleBeginGate(root, def, function () {
      renderStep();
    });
  }

  /**
   * Connections: find 4 groups of 4 related words.
   * def.groups = [ ["w1","w2","w3","w4"], ... ] (exactly 4 groups)
   */
  function renderConnections(root, def) {
    var groups = def.groups.map(function (g) {
      return g.map(normalizeConnectionWord);
    });
    var flat = [];
    var gi;
    for (gi = 0; gi < groups.length; gi++) {
      var j;
      for (j = 0; j < groups[gi].length; j++) {
        flat.push(groups[gi][j]);
      }
    }
    if (def.shuffle !== false) {
      flat = shuffleArray(flat);
    }

    var puzzleTitle =
      def.puzzleTitle != null
        ? def.puzzleTitle
        : def.title != null
          ? def.title
          : "Find the connections";

    function runConnectionsGame() {
      var topBlock =
        '<h2 class="puzzle-heading puzzle-heading--solo">' +
        escapeHtml(puzzleTitle) +
        "</h2>" +
        '<p class="connections-instructions">Select exactly four tiles that belong together. Find all four groups.</p>';

      root.innerHTML =
        '<div class="card connections-card" id="connections-root">' +
        topBlock +
        '<div class="connections-grid" id="connections-grid" role="group" aria-label="Word tiles"></div>' +
        '<p class="connections-status" id="connections-status" aria-live="polite"></p>' +
        "</div>";

      var gridEl = document.getElementById("connections-grid");
      var statusEl = document.getElementById("connections-status");
      var solved = {};
      var selected = [];
      var foundCount = 0;

      function renderWin() {
        showPuzzleCompleteWithContinue(
          root,
          "<h2>You did it!</h2>" +
            "<p>You found all four groups.</p>"
        );
      }

      function updateTileClasses() {
        var tiles = gridEl.querySelectorAll(".connections-tile");
        var ti;
        for (ti = 0; ti < tiles.length; ti++) {
          var tile = tiles[ti];
          var w = tile.dataset.word;
          var isSel = selected.indexOf(w) >= 0;
          tile.classList.toggle("selected", isSel);
          tile.setAttribute("aria-pressed", isSel ? "true" : "false");
          if (solved[w]) {
            tile.classList.add("solved");
            tile.disabled = true;
          } else {
            tile.classList.remove("solved");
            tile.disabled = false;
          }
        }
      }

      function checkSelection() {
        var matchedGroup = null;
        var gidx;
        for (gidx = 0; gidx < groups.length; gidx++) {
          var g = groups[gidx];
          var fullySolved = true;
          var wi;
          for (wi = 0; wi < g.length; wi++) {
            if (!solved[g[wi]]) {
              fullySolved = false;
              break;
            }
          }
          if (fullySolved) continue;
          if (sameWordSet(selected, g)) {
            matchedGroup = g;
            break;
          }
        }

        selected = [];
        if (matchedGroup) {
          var mi;
          for (mi = 0; mi < matchedGroup.length; mi++) {
            solved[matchedGroup[mi]] = true;
          }
          foundCount += 1;
          statusEl.className = "connections-status message success";
          statusEl.textContent =
            "Correct group! " + foundCount + " / " + groups.length + " found.";
          updateTileClasses();
          if (foundCount >= groups.length) {
            setTimeout(renderWin, 700);
          }
        } else {
          statusEl.className = "connections-status message error";
          statusEl.textContent = "Not quite — try another combination.";
          updateTileClasses();
        }
      }

      var wi;
      for (wi = 0; wi < flat.length; wi++) {
        (function (word) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "connections-tile";
          btn.textContent = word;
          btn.dataset.word = word;
          btn.setAttribute("aria-pressed", "false");
          btn.addEventListener("click", function () {
            if (solved[word]) return;
            var idx = selected.indexOf(word);
            if (idx >= 0) {
              selected.splice(idx, 1);
            } else {
              if (selected.length >= 4) return;
              selected.push(word);
            }
            updateTileClasses();
            if (selected.length === 4) {
              checkSelection();
            }
          });
          gridEl.appendChild(btn);
        })(flat[wi]);
      }
    }

    renderPuzzleBeginGate(root, def, runConnectionsGame);
  }

  function mount() {
    var root = document.getElementById("app");
    var id = getPuzzleIdFromUrl();

    if (id === null || id < 1 || id > MAX_PUZZLE) {
      document.documentElement.removeAttribute("data-puzzle-id");
      applyAlbumTheme("evermore");
      renderMissingPuzzleParam(root);
      return;
    }

    applyAlbumThemeForPuzzleId(id);

    var def = REGISTRY[id];
    if (!def) {
      renderPlaceholder(root, id);
      return;
    }

    if (def.type === "sequential_clues") {
      renderSequentialClues(root, def);
      return;
    }

    if (def.type === "connections") {
      renderConnections(root, def);
      return;
    }

    if (def.type === "unscramble") {
      renderUnscramble(root, def);
      return;
    }

    renderPlaceholder(root, id);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();

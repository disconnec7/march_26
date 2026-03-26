/**
 * March 26 puzzle site — email deep-links only.
 * Expects ?puzzle=1..15 or ?utm_puzzle= (no homepage / no in-site navigation).
 * Companion years (15 puzzles, no 2014): 2011–2013, 2015–2026 → assets/{year}_sashe.jpg.
 * Begin gate: that puzzle’s photo + bio (COMPANION_BIOS). After Begin: companion.description (rules) then board.
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

  /** Song titles: ignore case, apostrophes, hyphen vs space. */
  function normalizeSongTitleGuess(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[''’]/g, "")
      .replace(/[-–—]/g, " ")
      .replace(/\s+/g, " ");
  }

  function caesarShiftLetter(ch, delta) {
    if (/[a-z]/.test(ch)) {
      var code = ch.charCodeAt(0) - 97;
      code = (code + delta + 260000) % 26;
      return String.fromCharCode(97 + code);
    }
    if (/[A-Z]/.test(ch)) {
      var codeU = ch.charCodeAt(0) - 65;
      codeU = (codeU + delta + 260000) % 26;
      return String.fromCharCode(65 + codeU);
    }
    return ch;
  }

  /**
   * Encode a title for display: each letter moves n positions backward
   * in the alphabet (A → V when n = 5, etc.). Spaces & punctuation unchanged.
   */
  function caesarEncodeTrackShift(plain, n) {
    var steps = -Math.abs(Number(n) || 0);
    return String(plain || "")
      .split("")
      .map(function (c) {
        return caesarShiftLetter(c, steps);
      })
      .join("");
  }

  function caesarAnswerMatches(guess, round) {
    var g = normalizeSongTitleGuess(guess);
    if (!g) return false;
    if (normalizeSongTitleGuess(round.title) === g) return true;
    if (!round.answers || !round.answers.length) return false;
    var i;
    for (i = 0; i < round.answers.length; i++) {
      if (normalizeSongTitleGuess(round.answers[i]) === g) return true;
    }
    return false;
  }

  /**
   * Calendar year for each puzzle id (1–15). Skips 2014; ends at 2026.
   */
  var PUZZLE_COMPANION_YEARS = [
    2011, 2012, 2013, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
    2025, 2026,
  ];

  function companionYearForPuzzleId(puzzleId) {
    if (puzzleId < 1 || puzzleId > MAX_PUZZLE) return null;
    return PUZZLE_COMPANION_YEARS[puzzleId - 1];
  }

  /** e.g. "2011 Sashe" … "2026 Sashe" */
  function companionHeading(puzzleId) {
    var y = companionYearForPuzzleId(puzzleId);
    if (y == null) return "";
    return y + " Sashe";
  }

  /** Default image path: assets/{year}_sashe.jpg for this puzzle’s companion year. */
  function defaultCompanionImagePath(puzzleId) {
    var y = companionYearForPuzzleId(puzzleId);
    if (y == null) return "";
    return "assets/" + y + "_sashe.jpg";
  }

  /**
   * Bios on the begin gate only (puzzle id order; same years as PUZZLE_COMPANION_YEARS).
   */
  var COMPANION_BIOS = [
    "Early days Sashe, not a care in the world and wearing a suspiciously USA top. Hair Waffles are also on point. Also got her Kika not too long ago.",
    "Still going strong with the hair waffles, her Kika has now met 172 members of her family.",
    "Strong forest vibes Sashe with a remarkable upper body strength hanging off a branch. Those gymnastics lessons are really paying off.",
    "Waffles are a thing of the past, now we're entering the big leagues with some serious curls. This mystical (a little bit murderous looking) Sashe is all about the foreigner life in London, although the pic is definitely in some sketchy BG diskotechka.",
    "This Sashe has brought the gamster vibes. She has now moved house and is living almost independently. Posing on a Kallax as a power move to any utrepka who dares to face her.",
    "We're entering the world of travelling Sasheta, this one in particular managed to get her Kika a whole trip. Paellas and beers were top priority here (and have been for a while afterwards).",
    "This midpoint Sashe has travelled a substantial amount across Europe. Would you dare call her broke by looking at her lavish 2 ice creams and ice tea!?",
    "This Sashe has entered a more rebellious era. The amount of bracelets has also been steadily increasing. Nobody can tell her what's up as she knows what's up at all times.",
    "We all know this sexy beast Sashe. Halloween is now taking a significant amount of planning and execution (you would have thought it would be less as we age but nah). Even though a few £5 amazon purchases have been made, the look is always on point.",
    "This Sashe is now post-covid and studying the ancient ways of СY. We can see her standing in front of this great archive which is prob 3x smaller than her bookshelves at home.",
    "This Sashe knows what's up even more. We can see her enjoying some cold beverages (definitely alcohol free) and some totally air only shisha with her friends. She has just attended the first close friend wedding which was totally hassle free and is enjoying an illness free group honeymoon.",
    "We're getting to the later stages Sasheta. This Sashe looking hot af and enjoying another (totally alcohol free) beverage. She is fueling the upcoming skandalche with her Kika on the chill topic of \"So what are we now\". Ah she also got a majestic little princess kitten aka Sukata.",
    "This Sashe is all about independence. Her IKEA furniture skills are off the charts and does not need a man to get things done. She finally lives alone with her Kika and has her shit together. Also planning a completely stress free wedding for the next Sashe.",
    "The ultimate Sashe power posing and being totally unstoppable. \"Tremble before me murshischki this is my stage\". ARE YOU READY FOR IT?",
    "This Sashe is all about the lavish lifestyle. Definitely deserved after all these hassle free years and absolutely 0 problems with her Kika and anyone else. I mean just look at her enjoying this fine (definitely not alcohol) Club Colombia beverage. Oh and she's casually in the middle of the most magnificent palm trees you can find in the world, but whatever.",
  ];

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

  /** Begin gate: photo + era bio only (rules come after Begin). */
  function renderBeginGateCompanionHtml(def) {
    var pid = def.id;
    var imgPath = defaultCompanionImagePath(pid);
    if (!imgPath) return "";
    var bio = COMPANION_BIOS[pid - 1] || "";
    var name = companionHeading(pid);
    return (
      '<div class="companion" role="region" aria-label="Your companion">' +
      '<figure class="companion-img-wrap">' +
      '<img class="companion-img" src="' +
      escapeAttr(imgPath) +
      '" alt="' +
      escapeAttr(name) +
      '" width="112" loading="lazy" />' +
      "</figure>" +
      '<div class="companion-text companion-bio">' +
      escapeHtml(bio) +
      "</div>" +
      "</div>"
    );
  }

  /** Puzzle rules (REGISTRY companion.description) after Begin — above the board. */
  function puzzleMissionBannerHtml(def) {
    var c = getCompanionForRender(def);
    var text =
      c && c.description != null ? String(c.description).trim() : "";
    if (!text) return "";
    return (
      '<div class="puzzle-mission" role="region" aria-label="Puzzle instructions">' +
      '<div class="puzzle-mission-text">' +
      escapeHtml(text) +
      "</div>" +
      "</div>"
    );
  }

  var PUZZLE_1 = {
    id: 1,
    puzzleTitle: "Also a Taylor Swift song",
    type: "sequential_clues",
    companion: {},
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

  /**
   * Each round: answer title + trackNumber = Caesar shift. Five `hints` are other
   * songs that share that same track position on their albums (Taylor’s Version
   * tracklists and names where those editions exist). None of the hints is the answer.
   */
  var PUZZLE_4 = {
    id: 4,
    puzzleTitle: "The hidden track number",
    type: "caesar_tracks",
    companion: {
      description:
        "Each round gives you five Taylor songs from five different albums. They have something in common, and that same thing tells you how to undo the scrambled line underneath (shift every letter backward in the alphabet by that amount). Where an album has a Taylor's Version, use that edition's tracklist.",
    },
    intro:
      "What’s the link between the five songs? The line under them is another Taylor title, letters shifted backward in the alphabet by that same hidden number. Decode it and type the song name.",
    rounds: [
      {
        title: "cardigan",
        trackNumber: 2,
        hints: [
          { song: "Blank Space", album: "1989 (Taylor's Version)" },
          { song: "Red", album: "Red (Taylor's Version)" },
          { song: "Sparks Fly", album: "Speak Now (Taylor's Version)" },
          { song: "Fifteen", album: "Fearless (Taylor's Version)" },
          { song: "Maroon", album: "Midnights" },
        ],
      },
      {
        title: "Anti-Hero",
        trackNumber: 3,
        answers: ["anti hero", "antihero"],
        hints: [
          { song: "Style", album: "1989 (Taylor's Version)" },
          { song: "Treacherous", album: "Red (Taylor's Version)" },
          { song: "Back to December", album: "Speak Now (Taylor's Version)" },
          { song: "Love Story", album: "Fearless (Taylor's Version)" },
          { song: "Lover", album: "Lover" },
        ],
      },
      {
        title: "The Man",
        trackNumber: 4,
        hints: [
          { song: "Out of the Woods", album: "1989 (Taylor's Version)" },
          { song: "I Knew You Were Trouble", album: "Red (Taylor's Version)" },
          { song: "Speak Now", album: "Speak Now (Taylor's Version)" },
          { song: "Hey Stephen", album: "Fearless (Taylor's Version)" },
          { song: "my tears ricochet", album: "folklore" },
        ],
      },
      {
        title: "tolerate it",
        trackNumber: 5,
        hints: [
          { song: "All You Had to Do Was Stay", album: "1989 (Taylor's Version)" },
          { song: "All Too Well", album: "Red (Taylor's Version)" },
          { song: "Dear John", album: "Speak Now (Taylor's Version)" },
          { song: "White Horse", album: "Fearless (Taylor's Version)" },
          { song: "You're On Your Own, Kid", album: "Midnights" },
        ],
      },
      {
        title: "But Daddy I Love Him",
        trackNumber: 6,
        hints: [
          { song: "Shake It Off", album: "1989 (Taylor's Version)" },
          { song: "22", album: "Red (Taylor's Version)" },
          { song: "Mean", album: "Speak Now (Taylor's Version)" },
          { song: "You Belong With Me", album: "Fearless (Taylor's Version)" },
          { song: "Midnight Rain", album: "Midnights" },
        ],
      },
    ],
  };

  var PUZZLE_5 = {
    id: 5,
    puzzleTitle: "Track five",
    type: "sequential_clues",
    companion: {
      description:
        "Eleven studio albums, in release order. One step each: type that album’s track 5 title (as printed on the album).",
    },
    clues: [
      {
        text: "1 of 11 — Taylor Swift (2006). What’s track 5?",
        answers: ["cold as you"],
      },
      {
        text: "2 of 11 — Fearless (2008). What’s track 5?",
        answers: ["white horse"],
      },
      {
        text: "3 of 11 — Speak Now (2010). What’s track 5?",
        answers: ["dear john"],
      },
      {
        text: "4 of 11 — Red (2012). What’s track 5?",
        answers: ["all too well"],
      },
      {
        text: "5 of 11 — 1989 (2014). What’s track 5?",
        answers: ["all you had to do was stay"],
      },
      {
        text: "6 of 11 — reputation (2017). What’s track 5?",
        answers: ["delicate"],
      },
      {
        text: "7 of 11 — Lover (2019). What’s track 5?",
        answers: ["the archer"],
      },
      {
        text: "8 of 11 — folklore (2020). What’s track 5?",
        answers: ["my tears ricochet"],
      },
      {
        text: "9 of 11 — evermore (2020). What’s track 5?",
        answers: ["tolerate it"],
      },
      {
        text: "10 of 11 — Midnights (2022). What’s track 5?",
        answers: [
          "you're on your own, kid",
          "youre on your own, kid",
          "you're on your own kid",
          "youre on your own kid",
        ],
      },
      {
        text: "11 of 11 — The Tortured Poets Department (2024). What’s track 5?",
        answers: ["so long, london", "so long london"],
      },
    ],
  };

  var PUZZLE_6 = {
    id: 6,
    puzzleTitle: "Guess the song",
    type: "sequential_clues",
    companion: {
      description: "",
    },
    clues: [
      { text: "What's this song?\n❤️ 📖", answers: ["love story"] },
      { text: "What's this song?\n🖼️ 🖼️ 🖼️ 🔥", answers: ["pictures to burn"] },
      {
        text:
          "What's this song?\n🌲🌲🌲🌲🌲🌲🌲\n🌲🌲🌲🌲🌲🌲🌲   🙋‍♀️\n🌲🌲🌲🌲🌲🌲🌲\n🌲🌲🌲🌲🌲🌲🌲",
        answers: ["out of the woods"],
      },
      { text: "What's this song?\n📄💍", answers: ["paper rings"] },
      {
        text: "What's this song?",
        imageUrl: "assets/puzzle6_teardrops_on_my_guitar.png",
        answers: ["teardrops on my guitar"],
      },
      {
        text: "What's this song?",
        imageUrl: "assets/puzzle6_all_too_well_2s.png",
        answers: ["all too well"],
      },
      {
        text: "What's this song?",
        imageUrl: "assets/puzzle6_22.png",
        answers: ["22", "twenty two", "twentytwo"],
      },
      {
        text: "What's this song?",
        imageUrl: "assets/puzzle6_gold_rush.png",
        answers: ["gold rush"],
      },
      {
        text: "What's this song?",
        imageUrl: "assets/puzzle6_jump_then_fall.png",
        answers: ["jump then fall"],
      },
      {
        text: "What's this song?",
        imageUrl: "assets/puzzle6_state_of_grace.png",
        answers: ["state of grace"],
      },
      { text: "What's this song?", blankClue: true, answers: ["blank space"] },
    ],
  };

  var PUZZLE_7 = {
    id: 7,
    puzzleTitle: "Find the connections",
    type: "connections",
    companion: {
      description:
        "Another board, same rules: find four groups of four words that belong together.",
    },
    groups: [
      ["WILDEST DREAMS", "STYLE", "SHAKE IT OFF", "BLANK SPACE"],
      ["RAIN", "THUNDER", "SNOW", "SUNSHINE"],
      ["DRESS", "CARDIGAN", "SCARF", "RING"],
      ["RED", "BLUE", "GREEN", "GOLD"],
    ],
    shuffle: true,
  };

  var PUZZLE_8 = {
    id: 8,
    puzzleTitle: "Unscramble the song title",
    type: "unscramble",
    companion: {
      description:
        "Ten more scrambled titles. Spaces and punctuation still do not matter.",
    },
    rounds: [
      { scrambled: "DEHNACTNE", answers: ["enchanted"] },
      { scrambled: "EDELBWEEJ", answers: ["bejeweled"] },
      { scrambled: "MCRTAOWSNINE", answers: ["new romantics", "newromantics"] },
      {
        scrambled: "NTEAIRSCOERLTE",
        answers: ["cornelia street", "corneliastreet"],
      },
      { scrambled: "TMNRSADEMI", answers: ["mastermind"] },
      { scrambled: "NCALE", answers: ["clean"] },
      { scrambled: "YTDIALGH", answers: ["daylight"] },
      { scrambled: "NOAROM", answers: ["maroon"] },
      { scrambled: "GNLOEIVL", answers: ["long live", "longlive"] },
      { scrambled: "NIGACRAD", answers: ["cardigan"] },
    ],
  };

  var PUZZLE_9 = {
    id: 9,
    puzzleTitle: "The hidden track number",
    type: "caesar_tracks",
    companion: {
      description:
        "Each round gives you five Taylor songs from five different albums. They have something in common, and that same thing tells you how to undo the scrambled line underneath (shift every letter backward in the alphabet by that amount). Where an album has a Taylor's Version, use that edition's tracklist.",
    },
    intro:
      "What's the link between the five songs? The line under them is another Taylor title, letters shifted backward in the alphabet by that same hidden number. Decode it and type the song name.",
    rounds: [
      {
        title: "Cruel Summer",
        trackNumber: 2,
        hints: [
          { song: "Style", album: "1989 (Taylor's Version)" },
          { song: "Fifteen", album: "Fearless (Taylor's Version)" },
          { song: "Red", album: "Red (Taylor's Version)" },
          { song: "Sparks Fly", album: "Speak Now (Taylor's Version)" },
          { song: "Maroon", album: "Midnights" },
        ],
      },
      {
        title: "Back to December",
        trackNumber: 3,
        hints: [
          { song: "Treacherous", album: "Red (Taylor's Version)" },
          { song: "Love Story", album: "Fearless (Taylor's Version)" },
          { song: "Style", album: "1989 (Taylor's Version)" },
          { song: "Back to December", album: "Speak Now (Taylor's Version)" },
          { song: "Lover", album: "Lover" },
        ],
      },
      {
        title: "Wildest Dreams",
        trackNumber: 4,
        hints: [
          { song: "Out of the Woods", album: "1989 (Taylor's Version)" },
          { song: "I Knew You Were Trouble", album: "Red (Taylor's Version)" },
          { song: "Speak Now", album: "Speak Now (Taylor's Version)" },
          { song: "Hey Stephen", album: "Fearless (Taylor's Version)" },
          { song: "my tears ricochet", album: "folklore" },
        ],
      },
      {
        title: "You're On Your Own, Kid",
        trackNumber: 5,
        answers: ["youre on your own, kid", "you're on your own kid", "youre on your own kid"],
        hints: [
          { song: "All Too Well", album: "Red (Taylor's Version)" },
          { song: "White Horse", album: "Fearless (Taylor's Version)" },
          { song: "Dear John", album: "Speak Now (Taylor's Version)" },
          { song: "All You Had to Do Was Stay", album: "1989 (Taylor's Version)" },
          { song: "tolerate it", album: "evermore" },
        ],
      },
      {
        title: "Midnight Rain",
        trackNumber: 6,
        hints: [
          { song: "22", album: "Red (Taylor's Version)" },
          { song: "You Belong With Me", album: "Fearless (Taylor's Version)" },
          { song: "Mean", album: "Speak Now (Taylor's Version)" },
          { song: "Shake It Off", album: "1989 (Taylor's Version)" },
          { song: "But Daddy I Love Him", album: "The Tortured Poets Department" },
        ],
      },
    ],
  };

  var PUZZLE_10 = {
    id: 10,
    puzzleTitle: "Riddle me this",
    type: "sequential_clues",
    companion: {
      description: "Solve each riddle with the correct Taylor answer.",
    },
    clues: [
      {
        text:
          "She released this, full of pop delight,\na year in title that feels just right.\nWhat marks her era, both sleek and bright?",
        answers: ["1989"],
      },
      {
        text:
          "With hearts painted pink, it's romantic and strong,\nwhere verses explore where love belongs.\nWhat album captures a thousand songs?",
        answers: ["lover"],
      },
      {
        text:
          "Critics came, doubts took a seat,\nbut she danced through without defeat.\nWhat anthem defied all to a rhythmic beat?",
        answers: ["shake it off", "shakeitoff"],
      },
      {
        text:
          "Stories woven like tales so old,\nhushed tones and lyrics unfold.\nWhich collection whispered mysteries untold?",
        answers: ["folklore"],
      },
      {
        text:
          "Fans unite with shouts and cheer,\nthey know her songs, year by year.\nWhat title bonds the loyal and near?",
        answers: ["switftie", "swiftie"],
      },
      {
        text:
          "It's fate and fate's reply, what you sow, you buy.\nWhich single shows justice that won't deny?",
        answers: ["karma"],
      },
      {
        text:
          "She opens this with songs untold,\nhidden tracks worth their weight in gold.\nWhat holds stories both bold and old?",
        answers: ["vault", "the vault"],
      },
    ],
  };

  var PUZZLE_11 = {
    id: 11,
    puzzleTitle: "Finish the lyric",
    type: "sequential_clues",
    companion: {
      description: "Fill in the missing lyric word in each line.",
    },
    clues: [
      {
        text:
          '"You call me up again just to break me like a promise, so casually ______ in the name of being honest."',
        answers: ["cruel"],
      },
      {
        text:
          '"I\'ll stare directly at the sun but never in the ______. It must be exhausting always rooting for the anti-hero."',
        answers: ["mirror"],
      },
      {
        text:
          '"Talk your talk and go ______, I just need this love spiral."',
        answers: ["viral"],
      },
      {
        text:
          '"Say you\'ll remember me, standing in a nice dress, staring at the ______."',
        answers: ["sunset"],
      },
      {
        text:
          '"I hit the Sunday ______, you know the greatest films of all time were never made."',
        answers: ["matinee", "matinée"],
      },
      {
        text:
          '"Quiet my fears with the touch of your hand, paper cut stings from our ______ thin plans."',
        answers: ["paper"],
      },
      {
        text:
          '"We were a ______ page on the desk, filling in the blanks as we go."',
        answers: ["fresh"],
      },
      {
        text:
          '"Screaming, who could ever ______ me, darling? But who could stay?"',
        answers: ["leave"],
      },
      {
        text:
          '"Trying to figure out what is and isn\'t true, and I don\'t try to hide my ______."',
        answers: ["tears"],
      },
      {
        text:
          '"And you can aim for my heart, go for blood, but you would still miss me in your ______."',
        answers: ["bones"],
      },
      {
        text:
          '"Your Midas touch on the Chevy door, November flush and your ______ cure."',
        answers: ["flannel"],
      },
      {
        text:
          '"They all warned us about times like this, they say the ______ gets hard and you get lost."',
        answers: ["road"],
      },
      {
        text:
          '"The whole school is rolling fake ______, you play stupid games, you win stupid prizes."',
        answers: ["dice"],
      },
      {
        text:
          '"And baby, I\'ll admit I\'ve been a little ______, fingers crossed until you put your hand on mine."',
        answers: ["superstitious"],
      },
      {
        text:
          '"This ain\'t Hollywood, this is a small town, I was a ______ before you went and let me down."',
        answers: ["dreamer"],
      },
    ],
  };

  var PUZZLE_12 = {
    id: 12,
    puzzleTitle: "Unscramble the song title",
    type: "unscramble",
    companion: {
      description:
        "Recent-era scramble: mostly Tortured Poets, plus a couple of showgirl-energy picks. Solve all ten.",
    },
    rounds: [
      { scrambled: "GFTORTINH", answers: ["fortnight"] },
      { scrambled: "ODBADNW", answers: ["down bad"] },
      { scrambled: "ONOGLONOLDSN", answers: ["so long london", "so long, london"] },
      {
        scrambled: "MDYLAEVIBUDHDOIT",
        answers: ["but daddy i love him"],
      },
      {
        scrambled: "HKEIAHRTNIIOTAWCOTEDBANR",
        answers: ["i can do it with a broken heart"],
      },
      {
        scrambled: "HTAEOIWOLDOEFTASDLLFIMR",
        answers: ["who's afraid of little old me", "whos afraid of little old me"],
      },
      {
        scrambled: "NIYSSTUIGAL",
        answers: ["guilty as sin", "guilty as sin?"],
      },
      { scrambled: "DHAOKEBGCTL", answers: ["the black dog"] },
      {
        scrambled: "TIACMEBYGOKUGNNAO",
        answers: ["imgonnagetyouback", "im gonna get you back"],
      },
      { scrambled: "ATARSSHEBLTO", answers: ["the albatross"] },
    ],
  };

  var PUZZLE_13 = {
    id: 13,
    puzzleTitle: "Finish the lyric",
    type: "sequential_clues",
    companion: {
      description: "Fill in each missing lyric phrase.",
    },
    clues: [
      {
        text:
          "I got tired of waiting\nWondering if you were ever coming around\nMy faith in you was fading\nWhen I ___ ___ __ ___ _________ __ ____",
        answers: ["met you on the outskirts of town"],
      },
      {
        text:
          "A friend to all is a friend to none\nChase two girls, ____ ___ ___",
        answers: ["lose the one"],
      },
      {
        text:
          "One day I'll watch as you're leaving\n'Cause you got tired __ __ ________",
        answers: ["of my scheming"],
      },
      {
        text:
          "Dreaming about the day when you wake up and find\nThat what you're looking for has ____ ____ ___ _____ ____",
        answers: ["been here the whole time"],
      },
      {
        text:
          "You'll see me in hindsight\nTangled up with you all night\n_______ __ ____",
        answers: ["burning it down"],
      },
      {
        text:
          "And I'm highly suspicious that everyone who sees you wants you\nI've loved you three summers now, honey, but _ ____ ____ ___",
        answers: ["i want them all"],
      },
      {
        text:
          "Second, third, and hundreth chances\nBalancin' on ________ ________",
        answers: ["breaking branches"],
      },
      {
        text:
          "We hadn't seen each other in a month\nWhen you said ___ ______ _____ (____?)",
        answers: ["you needed space (what?)", "you needed space"],
      },
      {
        text:
          "Your mom's ring in your pocket\nHer picture in your wallet\nYou won't remember all my _____ _________",
        answers: ["champagne problems"],
      },
      {
        text:
          "Don't you dare look outside your window, darling, everything's on fire\nThe war outside our door raging on\nHold onto this lullaby, ____ ____ ___ _______ ____, ____",
        answers: [
          "even when the music's gone, gone",
          "even when the musics gone, gone",
          "even when the music's gone gone",
          "even when the musics gone gone",
        ],
      },
      {
        text:
          "This night is sparkling, don't you let it go\nI'm wonderstruck, blushing ___ ___ ____ ____",
        answers: ["all the way home"],
      },
      {
        text:
          "Every woman that you knew brought you here\nI wanna _____ ___ ___ _______ _____",
        answers: ["teach you how forever feels"],
      },
    ],
  };

  var PUZZLE_14 = {
    id: 14,
    puzzleTitle: "The hidden track number",
    type: "caesar_tracks",
    companion: {
      description:
        "Each round gives you five Taylor songs from five different albums. They have something in common-and that same thing tells you how to undo the scrambled line underneath (shift every letter backward in the alphabet by that amount). Where an album has a Taylor's Version, use that edition's tracklist.",
    },
    intro:
      "What's the link between the five songs? The line under them is another Taylor title, letters shifted backward in the alphabet by that same hidden number. Decode it and type the song name.",
    rounds: [
      {
        title: "Fortnight",
        trackNumber: 2,
        hints: [
          { song: "Maroon", album: "Midnights" },
          { song: "Red", album: "Red (Taylor's Version)" },
          { song: "Fifteen", album: "Fearless (Taylor's Version)" },
          { song: "Style", album: "1989 (Taylor's Version)" },
          { song: "Spotlight", album: "Life of a Showgirl" },
        ],
      },
      {
        title: "So High School",
        trackNumber: 3,
        hints: [
          { song: "Treacherous", album: "Red (Taylor's Version)" },
          { song: "Love Story", album: "Fearless (Taylor's Version)" },
          { song: "Back to December", album: "Speak Now (Taylor's Version)" },
          { song: "Style", album: "1989 (Taylor's Version)" },
          { song: "Spotlight", album: "Life of a Showgirl" },
        ],
      },
      {
        title: "The Alchemy",
        trackNumber: 4,
        hints: [
          { song: "Out of the Woods", album: "1989 (Taylor's Version)" },
          { song: "I Knew You Were Trouble", album: "Red (Taylor's Version)" },
          { song: "Speak Now", album: "Speak Now (Taylor's Version)" },
          { song: "Hey Stephen", album: "Fearless (Taylor's Version)" },
          { song: "Encore", album: "Life of a Showgirl" },
        ],
      },
      {
        title: "Clara Bow",
        trackNumber: 5,
        hints: [
          { song: "All Too Well", album: "Red (Taylor's Version)" },
          { song: "White Horse", album: "Fearless (Taylor's Version)" },
          { song: "Dear John", album: "Speak Now (Taylor's Version)" },
          { song: "All You Had to Do Was Stay", album: "1989 (Taylor's Version)" },
          { song: "tolerate it", album: "evermore" },
        ],
      },
      {
        title: "Life of a Showgirl",
        trackNumber: 6,
        answers: ["life of a showgirl", "lifeofashowgirl"],
        hints: [
          { song: "22", album: "Red (Taylor's Version)" },
          { song: "You Belong With Me", album: "Fearless (Taylor's Version)" },
          { song: "Mean", album: "Speak Now (Taylor's Version)" },
          { song: "Shake It Off", album: "1989 (Taylor's Version)" },
          { song: "But Daddy I Love Him", album: "The Tortured Poets Department" },
        ],
      },
    ],
  };

  var PUZZLE_15 = {
    id: 15,
    puzzleTitle: "Final question",
    type: "multiple_choice",
    companion: {
      description: "",
    },
    question: "Do you like taylor swift?",
    options: [
      { label: "Yes", correct: false },
      { label: "Hell YES", correct: false },
      {
        label: "Nah, she's only as important as air and who needs air anyway",
        correct: true,
      },
    ],
  };

  var REGISTRY = {
    1: PUZZLE_1,
    2: PUZZLE_2,
    3: PUZZLE_3,
    4: PUZZLE_4,
    5: PUZZLE_5,
    6: PUZZLE_6,
    7: PUZZLE_7,
    8: PUZZLE_8,
    9: PUZZLE_9,
    10: PUZZLE_10,
    11: PUZZLE_11,
    12: PUZZLE_12,
    13: PUZZLE_13,
    14: PUZZLE_14,
    15: PUZZLE_15,
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

  function ultimateClueForPuzzleId(puzzleId) {
    var map = {
      2: "W",
      5: "1",
      7: "B",
      9: "2",
      12: "E",
      15: "L",
    };
    return map[puzzleId] || null;
  }

  /** After “Continue your journey”. */
  function renderJourneyAwaitScreen(root, puzzleId) {
    var clue = ultimateClueForPuzzleId(puzzleId);
    var unlockMsg = "";
    if (clue) {
      unlockMsg =
        '<p class="journey-unlock">You\'ve unlocked <strong>' +
        escapeHtml(clue) +
        "</strong>, note it down as you'll need it later.</p>";
      if (puzzleId === 15) {
        unlockMsg +=
          '<p class="journey-unlock journey-unlock--final">All parts of the cipher are now revealed.</p>';
      }
    }
    root.innerHTML =
      '<div class="card complete journey-end">' +
      unlockMsg +
      '<p class="journey-await">Await further instructions</p>' +
      "</div>";
  }

  /** Braze: log custom event when a numbered puzzle is completed (requires SDK init in braze-init.js). */
  function logBrazePuzzleCompleted(puzzleId) {
    if (puzzleId == null || puzzleId < 1 || puzzleId > MAX_PUZZLE) return;
    var b = window.braze;
    if (typeof b === "undefined" || typeof b.logCustomEvent !== "function") return;
    if (typeof b.isInitialized === "function" && !b.isInitialized()) return;
    try {
      b.logCustomEvent("puzzle_completed", { puzzle_number: puzzleId });
      if (typeof b.requestImmediateDataFlush === "function") {
        b.requestImmediateDataFlush();
      }
    } catch (ignore) {
      /* non-fatal */
    }
  }

  function showPuzzleCompleteWithContinue(root, summaryHtml, puzzleId) {
    logBrazePuzzleCompleted(puzzleId);
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
        renderJourneyAwaitScreen(root, puzzleId);
      });
    }
  }

  /** This puzzle’s companion (image + bio) + Begin; rules after Begin. */
  function renderPuzzleBeginGate(root, def, onBegin) {
    var companionBlock = renderBeginGateCompanionHtml(def);
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
            " answers are correct.</p>",
          def.id
        );
        return;
      }

      var c = def.clues[step];
      var pct = ((step + 1) / total) * 100;
      var topBlock =
        '<h2 class="puzzle-heading puzzle-heading--solo">' +
        escapeHtml(puzzleTitle) +
        "</h2>";
      var missionBanner = puzzleMissionBannerHtml(def);
      var clueHtml = "";
      if (c.blankClue) {
        clueHtml =
          '<div class="clue clue--visual">' +
          (c.text ? '<p class="clue-prompt">' + escapeHtml(c.text) + "</p>" : "") +
          '<div class="clue-blank-space" role="img" aria-label="Blank clue"></div></div>';
      } else if (c.imageUrl) {
        clueHtml =
          '<div class="clue clue--visual">' +
          (c.text ? '<p class="clue-prompt">' + escapeHtml(c.text) + "</p>" : "") +
          '<img class="clue-image" src="' +
          escapeAttr(c.imageUrl) +
          '" alt="Song clue image" loading="lazy" />' +
          "</div>";
      } else {
        clueHtml = '<p class="clue" id="clue-text">' + escapeHtml(c.text) + "</p>";
      }

      root.innerHTML =
        '<div class="card" id="puzzle-card">' +
        topBlock +
        missionBanner +
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
        clueHtml +
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

  function renderMultipleChoice(root, def) {
    var puzzleTitle =
      def.puzzleTitle != null
        ? def.puzzleTitle
        : def.title != null
          ? def.title
          : "Choose one";
    var missionBanner = puzzleMissionBannerHtml(def);
    var opts = def.options || [];
    if (!opts.length) {
      renderPlaceholder(root, def.id);
      return;
    }

    var i;
    var buttonsHtml = "";
    for (i = 0; i < opts.length; i++) {
      buttonsHtml +=
        '<button type="button" class="secondary mcq-option" data-opt="' +
        i +
        '">' +
        escapeHtml(opts[i].label) +
        "</button>";
    }

    function renderQuestion() {
      root.innerHTML =
        '<div class="card mcq-card" id="mcq-root">' +
        '<h2 class="puzzle-heading puzzle-heading--solo">' +
        escapeHtml(puzzleTitle) +
        "</h2>" +
        missionBanner +
        '<p class="clue mcq-question">' +
        escapeHtml(def.question || "Choose the correct option.") +
        "</p>" +
        '<div class="actions mcq-actions">' +
        buttonsHtml +
        "</div>" +
        '<p class="message" id="mcq-msg" aria-live="polite"></p>' +
        "</div>";

      var msg = document.getElementById("mcq-msg");
      var btns = root.querySelectorAll(".mcq-option");
      var bi;
      function onChoice(e) {
        var idx = parseInt(e.currentTarget.dataset.opt, 10);
        var opt = opts[idx];
        if (!opt) return;
        if (!opt.correct) {
          msg.className = "message error";
          msg.textContent = "Not quite - try another option.";
          return;
        }
        msg.className = "message success";
        msg.textContent = "Correct.";
        for (bi = 0; bi < btns.length; bi++) btns[bi].disabled = true;
        setTimeout(function () {
          showPuzzleCompleteWithContinue(
            root,
            "<h2>You did it!</h2><p>Final answer locked in.</p>",
            def.id
          );
        }, 650);
      }
      for (bi = 0; bi < btns.length; bi++) {
        btns[bi].addEventListener("click", onChoice);
      }
    }

    renderPuzzleBeginGate(root, def, renderQuestion);
  }

  function renderCaesarTracks(root, def) {
    var rounds = def.rounds || [];
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
          : "Decode the title";

    function renderHintSongList(hints) {
      var list = hints || [];
      var i;
      var lis = "";
      for (i = 0; i < list.length; i++) {
        var h = list[i];
        lis +=
          '<li class="caesar-hint-item">' +
          '<span class="caesar-hint-song">' +
          escapeHtml(h.song) +
          "</span>" +
          '<span class="caesar-hint-sep" aria-hidden="true">·</span>' +
          '<span class="caesar-hint-album">' +
          escapeHtml(h.album) +
          "</span>" +
          "</li>";
      }
      return (
        '<div class="caesar-hint-block">' +
        '<p class="caesar-hint-lead">Five songs:</p>' +
        '<ul class="caesar-hint-songs">' +
        lis +
        "</ul>" +
        "</div>"
      );
    }

    function renderStep() {
      if (step >= total) {
        showPuzzleCompleteWithContinue(
          root,
          "<h2>You did it!</h2>" +
            "<p>All " +
            total +
            " titles decoded.</p>",
          def.id
        );
        return;
      }

      var r = rounds[step];
      var cipher = caesarEncodeTrackShift(r.title, r.trackNumber);
      var introHtml =
        step === 0 && def.intro != null
          ? '<p class="clue caesar-intro">' + escapeHtml(def.intro) + "</p>"
          : "";
      var hintsHtml = renderHintSongList(r.hints);
      var pct = ((step + 1) / total) * 100;
      var topBlock =
        '<h2 class="puzzle-heading puzzle-heading--solo">' +
        escapeHtml(puzzleTitle) +
        "</h2>";
      var missionBanner = puzzleMissionBannerHtml(def);

      root.innerHTML =
        '<div class="card caesar-card" id="puzzle-card">' +
        topBlock +
        missionBanner +
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
        introHtml +
        hintsHtml +
        '<p class="caesar-scramble-label">Scrambled title</p>' +
        '<p class="caesar-ciphertext" id="caesar-cipher" aria-label="Encoded title">' +
        escapeHtml(cipher) +
        "</p>" +
        '<div class="form-row">' +
        '<label for="answer">Song title</label>' +
        '<input type="text" id="answer" autocomplete="off" placeholder="Decoded title" />' +
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
        if (!normalizeSongTitleGuess(input.value)) {
          msg.className = "message error";
          msg.textContent = "Enter the song title.";
          return;
        }
        if (!caesarAnswerMatches(input.value, r)) {
          msg.className = "message error";
          msg.textContent = "Not quite — try again.";
          return;
        }
        msg.className = "message success";
        msg.textContent = "Correct! Next…";
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
            " titles unscrambled.</p>",
          def.id
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
      var missionBanner = puzzleMissionBannerHtml(def);

      root.innerHTML =
        '<div class="card unscramble-card" id="unscramble-root">' +
        topBlock +
        missionBanner +
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
        "</h2>";
      var missionBanner = puzzleMissionBannerHtml(def);

      root.innerHTML =
        '<div class="card connections-card" id="connections-root">' +
        topBlock +
        missionBanner +
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
            "<p>You found all four groups.</p>",
          def.id
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

    if (def.type === "caesar_tracks") {
      renderCaesarTracks(root, def);
      return;
    }

    if (def.type === "multiple_choice") {
      renderMultipleChoice(root, def);
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

/**
 * Puzzle site — GitHub Pages friendly.
 * Reads ?puzzle=1..15 (also utm_puzzle for shared email-style links).
 */
(function () {
  "use strict";

  var MAX_PUZZLE = 15;

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

  var COMPANION_PLACEHOLDER_IMAGE_URL =
    "https://cdn.braze.eu/appboy/communication/assets/image_assets/images/69b9bdbec6776800632af017/original.jpg?1773780414";
  var COMPANION_PLACEHOLDER_DESCRIPTION =
    "Hello my trusty companion... I have been searching throughout all the knowledge in the world but can't seem to break this cypher. If you are able to help me I will greatly appreciate it. ";

  var PUZZLE_1 = {
    id: 1,
    title: "Also a Taylor Swift song",
    type: "sequential_clues",
    companion: {
      imageUrl: COMPANION_PLACEHOLDER_IMAGE_URL,
      description: COMPANION_PLACEHOLDER_DESCRIPTION,
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

  var REGISTRY = {
    1: PUZZLE_1,
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

  function renderHome(root) {
    var items = "";
    var i;
    for (i = 1; i <= MAX_PUZZLE; i += 1) {
      var available = REGISTRY[i];
      if (available) {
        items +=
          '<li><a href="?puzzle=' +
          i +
          '">Puzzle ' +
          i +
          "</a></li>";
      } else {
        items +=
          '<li><span class="coming-soon">Puzzle ' + i + "</span></li>";
      }
    }
    root.innerHTML =
      '<div class="card">' +
      '<p class="puzzle-label">March 26</p>' +
      "<h1>Puzzles</h1>" +
      '<p class="placeholder-puzzle">Pick a puzzle or open a direct link like <code>?puzzle=1</code>.</p>' +
      '<ul class="puzzle-picker">' +
      items +
      "</ul>" +
      '<p class="param-hint">Gray items are not published yet — add them in <code>js/puzzle.js</code> (<code>REGISTRY</code>).</p>' +
      "</div>";
  }

  function renderPlaceholder(root, id) {
    root.innerHTML =
      '<div class="card">' +
      '<p class="puzzle-label">Puzzle ' +
      id +
      "</p>" +
      "<h1>Coming soon</h1>" +
      '<p class="placeholder-puzzle">This puzzle isn’t wired up yet. Add it to <code>REGISTRY</code> in <code>js/puzzle.js</code>.</p>' +
      '<p class="param-hint"><a href="./">← Back to all puzzles</a></p>' +
      "</div>";
  }

  function renderSequentialClues(root, def) {
    var step = 0;
    var total = def.clues.length;

    function renderStep() {
      if (step >= total) {
        root.innerHTML =
          '<div class="card complete">' +
          "<h2>You did it!</h2>" +
          "<p>All " +
          total +
          " answers are correct.</p>" +
          '<p class="param-hint" style="margin-top:1rem;border:0;padding:0;"><a href="./">← Play another puzzle</a></p>' +
          "</div>";
        return;
      }

      var c = def.clues[step];
      var pct = ((step + 1) / total) * 100;
      var companionBlock =
        step === 0 ? renderCompanionHtml(def.companion) : "";

      root.innerHTML =
        '<div class="card" id="puzzle-card">' +
        '<p class="puzzle-label">Puzzle ' +
        def.id +
        "</p>" +
        "<h1>" +
        escapeHtml(def.title) +
        "</h1>" +
        companionBlock +
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
        '<p class="param-hint" style="margin-top:0.75rem;border:0;padding:0;"><a href="./">← Home</a></p>' +
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

    renderStep();
  }

  function mount() {
    var root = document.getElementById("app");
    var id = getPuzzleIdFromUrl();

    if (id === null || id < 1 || id > MAX_PUZZLE) {
      renderHome(root);
      return;
    }

    var def = REGISTRY[id];
    if (!def) {
      renderPlaceholder(root, id);
      return;
    }

    if (def.type === "sequential_clues") {
      renderSequentialClues(root, def);
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

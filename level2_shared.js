// ═══════════════════════════════════════════════
//  CRYPTO CRIME — Shared JS
//  No timer shown to users.
//  Timestamps are logged server-side via Google Sheets.
// ═══════════════════════════════════════════════

const SHEET_URL = "https://script.google.com/macros/s/AKfycbz_iI94FjuBai8AB5cry1g3LMh25E41Idu8D3K836pBPOpF4KhkQWqYrrbbuy4rrmaigg/exec";

const VALID_TEAM_IDS = [
  "MK2601","MK2602","MK2603","MK2604","MK2605",
  "MK2606","MK2607","MK2608","MK2609","MK2610",
  "MK2611","MK2612","MK2613","MK2614","MK2615",
  "MK2616","MK2617","MK2618","MK2619","MK2620"
];

// ── PICK UP PARAMS FROM URL (carries data across domains) ──
(function syncFromURL() {
  const params = new URLSearchParams(window.location.search);
  const teamId           = params.get("teamId");
  const teamName         = params.get("teamName");
  const collectedLetters = params.get("collectedLetters");
  if (teamId)           localStorage.setItem("teamId", teamId);
  if (teamName)         localStorage.setItem("teamName", teamName);
  if (collectedLetters) localStorage.setItem("collectedLetters", collectedLetters);
})();

// ── LOG TO GOOGLE SHEETS ──
async function logToSheet(data) {
  try {
    await fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn("Sheet log failed:", err);
  }
}

// ── STRUCTURED LETTER STORAGE { row1: [], row2: [] } ──
function getStructuredLetters() {
  let raw = localStorage.getItem("collectedLetters");
  if (!raw) return { row1: [], row2: [] };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        row1: Array.isArray(parsed.row1) ? parsed.row1 : [],
        row2: Array.isArray(parsed.row2) ? parsed.row2 : []
      };
    }
    if (Array.isArray(parsed)) return { row1: parsed, row2: [] };
  } catch(e) {}
  return { row1: [], row2: [] };
}

function saveStructuredLetters(data) {
  localStorage.setItem("collectedLetters", JSON.stringify(data));
}

// ── LETTER HELPERS ──
function getCollectedLetters() {
  const d = getStructuredLetters();
  return [...(d.row1 || []), ...(d.row2 || [])];
}

function addLetter(letter) {
  const data = getStructuredLetters();
  if (!data.row1.includes(letter)) data.row1.push(letter);
  saveStructuredLetters(data);
  return getCollectedLetters();
}

function renderLetterTiles(miniPrefix, bigPrefix) {
  const letters = getCollectedLetters();
  for (let i = 0; i < 5; i++) {
    const mini = document.getElementById(`${miniPrefix}${i}`);
    const big  = document.getElementById(`${bigPrefix}${i}`);
    if (letters[i]) {
      if (mini) { mini.textContent = letters[i]; mini.classList.add("lit"); }
      if (big)  { big.textContent  = letters[i]; big.classList.add("revealed"); }
    }
  }
}

// ── BINARY RAIN ──
function startBinaryRain(opacity = 0.05) {
  const c = document.createElement("canvas");
  c.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;opacity:${opacity};pointer-events:none;z-index:0;`;
  document.body.prepend(c);
  const cx = c.getContext("2d");
  let cols, drops;
  function init() {
    c.width = innerWidth; c.height = innerHeight;
    cols = Math.floor(c.width / 14);
    drops = Array(cols).fill(1);
  }
  function draw() {
    cx.fillStyle = "rgba(2,12,2,0.05)"; cx.fillRect(0,0,c.width,c.height);
    cx.fillStyle = "#00ff41"; cx.font = "14px Share Tech Mono";
    drops.forEach((y, i) => {
      cx.fillText(Math.random() > 0.5 ? "1" : "0", i * 14, y * 14);
      if (y * 14 > c.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }
  init();
  setInterval(draw, 50);
  addEventListener("resize", init);
}

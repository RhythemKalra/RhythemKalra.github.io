const root = document.documentElement;
const finePointer = window.matchMedia("(pointer: fine)").matches;

// ---------- dark / light toggle ("ink" / "paper") ----------
document.getElementById("themeToggle").addEventListener("click", () => {
  const next = root.dataset.theme === "paper" ? "ink" : "paper";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---------- logo does a little spin ----------
const logo = document.getElementById("logo");
logo.addEventListener("click", () => {
  logo.classList.remove("spin");
  void logo.offsetWidth; // restart the animation
  logo.classList.add("spin");
});

// ---------- "currently thinking about" rotator ----------
const thoughts = [
  "a content plan for the next launch",
  "what Dazzle should feel like",
  "how AI changes the way people work",
  "the next reel script",
  "where to travel next",
];
const rotator = document.getElementById("rotator");
let t = 0;
setInterval(() => {
  rotator.classList.add("out");
  setTimeout(() => {
    t = (t + 1) % thoughts.length;
    rotator.textContent = thoughts[t];
    rotator.classList.remove("out");
  }, 350);
}, 2800);

// ---------- dance mode: split the headline into letters that bounce ----------
function splitLetters(el) {
  let i = 0;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
      const word = document.createElement("span");
      word.className = "word";
      [...part].forEach((c) => {
        const ch = document.createElement("span");
        ch.className = "ch";
        ch.style.setProperty("--i", i++);
        ch.textContent = c;
        word.appendChild(ch);
      });
      frag.appendChild(word);
    });
    node.replaceWith(frag);
  });
}
splitLetters(document.getElementById("heroTitle"));

const danceBtn = document.getElementById("danceBtn");
function toggleDance() {
  const on = root.classList.toggle("dancing");
  danceBtn.setAttribute("aria-pressed", on);
  danceBtn.querySelector(".dance-label").textContent = on ? "ok, stop dancing" : "make it dance";
}
danceBtn.addEventListener("click", toggleDance);
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "d" && !e.metaKey && !e.ctrlKey && !e.altKey) toggleDance();
});

// ---------- cursor glow + scroll progress ----------
if (finePointer) {
  window.addEventListener("pointermove", (e) => {
    root.style.setProperty("--mx", e.clientX + "px");
    root.style.setProperty("--my", e.clientY + "px");
  });
}
const progress = document.getElementById("progress");
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.setProperty("--p", max > 0 ? window.scrollY / max : 0);
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// ---------- cards tilt towards the cursor (desktop only) ----------
if (finePointer) {
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--ry", (x - 0.5) * 8 + "deg");
      card.style.setProperty("--rx", (0.5 - y) * 8 + "deg");
      card.style.setProperty("--px", x * 100 + "%");
      card.style.setProperty("--py", y * 100 + "%");
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });

  // buttons lean slightly towards the cursor
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.2;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
  });
}

// ---------- experience tabs ----------
const tabs = document.querySelectorAll(".tab");
const indicator = document.querySelector(".tab-indicator");
function moveIndicator(tab) {
  indicator.style.left = tab.offsetLeft + "px";
  indicator.style.top = tab.offsetTop + "px";
  indicator.style.width = tab.offsetWidth + "px";
  indicator.style.height = tab.offsetHeight + "px";
}
function activateTab(tab) {
  tabs.forEach((other) => {
    const active = other === tab;
    other.classList.toggle("active", active);
    other.setAttribute("aria-selected", active);
    document.getElementById(other.getAttribute("aria-controls")).hidden = !active;
  });
  moveIndicator(tab);
}
tabs.forEach((tab) => tab.addEventListener("click", () => activateTab(tab)));
// links like the "Projects" nav item jump to the section and open a specific tab
document.querySelectorAll("[data-open-tab]").forEach((link) => {
  link.addEventListener("click", () => activateTab(document.getElementById(link.dataset.openTab)));
});
moveIndicator(document.querySelector(".tab.active"));
window.addEventListener("resize", () => moveIndicator(document.querySelector(".tab.active")));
document.fonts && document.fonts.ready.then(() => moveIndicator(document.querySelector(".tab.active")));

// ---------- project filters ----------
const filters = document.querySelectorAll(".filter");
const projects = document.querySelectorAll(".project");
filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((f) => f.classList.toggle("active", f === btn));
    const want = btn.dataset.filter;
    projects.forEach((p) => {
      const show = want === "all" || p.dataset.cat === want;
      p.classList.toggle("hide", !show);
      p.classList.remove("pop");
      if (show) { void p.offsetWidth; p.classList.add("pop"); }
    });
  });
});

// ---------- draggable skill stickers ----------
const board = document.getElementById("board");
board.querySelectorAll(".sticker").forEach((s) => {
  let startX, startY, baseX = 0, baseY = 0, moved = false;
  s.addEventListener("pointerdown", (e) => {
    try { s.setPointerCapture(e.pointerId); } catch (err) {}
    s.classList.add("dragging");
    startX = e.clientX;
    startY = e.clientY;
    moved = false;
  });
  s.addEventListener("pointermove", (e) => {
    if (!s.classList.contains("dragging")) return;
    const b = board.getBoundingClientRect();
    const r = s.getBoundingClientRect();
    // where the sticker would sit with no drag applied
    const homeL = r.left - (parseFloat(s.style.getPropertyValue("--tx")) || 0);
    const homeT = r.top - (parseFloat(s.style.getPropertyValue("--ty")) || 0);
    let x = baseX + e.clientX - startX;
    let y = baseY + e.clientY - startY;
    x = Math.min(Math.max(x, b.left - homeL + 4), b.right - homeL - r.width - 4);
    y = Math.min(Math.max(y, b.top - homeT + 4), b.bottom - homeT - r.height - 4);
    if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) > 3) moved = true;
    s.style.setProperty("--tx", x + "px");
    s.style.setProperty("--ty", y + "px");
  });
  const end = () => {
    if (!s.classList.contains("dragging")) return;
    s.classList.remove("dragging");
    baseX = parseFloat(s.style.getPropertyValue("--tx")) || 0;
    baseY = parseFloat(s.style.getPropertyValue("--ty")) || 0;
    if (!moved) {
      // a tap gives it a little twist instead
      s.style.setProperty("--r", (Math.random() * 16 - 8).toFixed(1) + "deg");
    }
  };
  s.addEventListener("pointerup", end);
  s.addEventListener("pointercancel", end);
});

// ---------- flip cards ----------
document.querySelectorAll(".flip").forEach((card) => {
  card.addEventListener("click", () => card.classList.toggle("flipped"));
});

// ---------- fade sections in + count the numbers up ----------
function countUp(el) {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || "";
  const comma = el.dataset.format === "comma";
  const start = performance.now();
  const dur = 1400;
  function frame(now) {
    const k = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - k, 3);
    const n = Math.round(target * eased);
    el.textContent = (comma ? n.toLocaleString("en-US") : n) + suffix;
    if (k < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    entry.target.querySelectorAll("[data-count]").forEach(countUp);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ---------- copy email (with sparkles) ----------
const copyBtn = document.getElementById("copyEmail");
function sparkle(el) {
  const r = el.getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = i % 2 ? "✦" : "·";
    s.style.left = r.left + r.width / 2 + "px";
    s.style.top = r.top + r.height / 2 + "px";
    const a = (Math.PI * 2 * i) / 14;
    s.style.setProperty("--dx", Math.cos(a) * 70 + "px");
    s.style.setProperty("--dy", Math.sin(a) * 50 + "px");
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("rhythemkalra@gmail.com");
    copyBtn.textContent = "copied ✓";
    sparkle(copyBtn);
  } catch (e) {
    copyBtn.textContent = "rhythemkalra@gmail.com";
  }
  setTimeout(() => (copyBtn.textContent = "copy email"), 2000);
});

document.getElementById("year").textContent = new Date().getFullYear();

// =====================================================================
// The "rhythm" layer: sound waves, equalizer, parallax name, cursor ring
// =====================================================================
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// equalizer next to the logo toggles dance mode too
document.getElementById("eqBtn").addEventListener("click", toggleDance);

// ---------- sound-wave lines in the background ----------
const canvas = document.getElementById("waves");
const ctx = canvas.getContext("2d");
let W = 0, H = 0, dpr = 1;
const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
let colors = [];

function readColors() {
  const cs = getComputedStyle(root);
  colors = ["--accent", "--accent-2", "--accent-3"].map((v) => cs.getPropertyValue(v).trim());
}
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
readColors();
resize();
window.addEventListener("resize", resize);
document.getElementById("themeToggle").addEventListener("click", () => requestAnimationFrame(readColors));
window.addEventListener("pointermove", (e) => { mouse.tx = e.clientX; mouse.ty = e.clientY; });
window.addEventListener("pointerleave", () => { mouse.tx = -9999; mouse.ty = -9999; });

const LINES = 7;
function drawWaves(time) {
  const t = time / 1000;
  const dancing = root.classList.contains("dancing");
  const energy = dancing ? 2.6 : 1;
  const paper = root.dataset.theme === "paper";
  mouse.x += (mouse.tx - mouse.x) * 0.08;
  mouse.y += (mouse.ty - mouse.y) * 0.08;
  const scrollPhase = window.scrollY * 0.002;

  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < LINES; i++) {
    const baseY = H * (0.2 + i * 0.12);
    const amp = (18 + i * 7) * energy;
    const freq = 0.0035 + i * 0.0006;
    const speed = (0.35 + i * 0.08) * (dancing ? 3 : 1);
    const color = colors[i % 3];

    ctx.beginPath();
    for (let x = -10; x <= W + 10; x += 10) {
      let y = baseY
        + Math.sin(x * freq + t * speed + i * 1.7 + scrollPhase) * amp
        + Math.sin(x * freq * 2.3 - t * speed * 0.7 + i) * amp * 0.35;
      // the line bends towards the cursor when it's close
      const dx = x - mouse.x;
      const pull = Math.exp(-(dx * dx) / 18000);
      const dy = mouse.y - y;
      if (Math.abs(dy) < 220) y += dy * pull * 0.45;
      x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    // a wide soft pass for glow, then a crisp line on top
    ctx.globalAlpha = paper ? 0.06 : 0.1;
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.globalAlpha = (paper ? 0.4 : 0.55) - i * 0.04;
    ctx.lineWidth = i === 2 ? 2 : 1.3;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function loop(time) {
  if (!document.hidden) drawWaves(time);
  requestAnimationFrame(loop);
}
reduceMotion ? drawWaves(0) : requestAnimationFrame(loop);

// ---------- giant outlined name drifts sideways as you scroll ----------
const bigname = document.getElementById("bigname");
window.addEventListener("scroll", () => {
  bigname.style.setProperty("--shift", -window.scrollY * 0.35 + "px");
}, { passive: true });

// ---------- cursor ring that says what things do (desktop only) ----------
if (finePointer && !reduceMotion) {
  root.classList.add("has-cursor");
  const ring = document.getElementById("cursorRing");
  const label = ring.querySelector(".cursor-text");
  let rx = -100, ry = -100, cx = -100, cy = -100;
  window.addEventListener("pointermove", (e) => { cx = e.clientX; cy = e.clientY; });
  (function follow() {
    rx += (cx - rx) * 0.18;
    ry += (cy - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(follow);
  })();
  const hints = [
    [".sticker", "drag"],
    [".flip", "flip"],
    ["#danceBtn, #eqBtn", "dance"],
    [".vinyl", "scratch"],
  ];
  document.addEventListener("pointerover", (e) => {
    const hit = hints.find(([sel]) => e.target.closest(sel));
    ring.classList.toggle("big", !!hit);
    label.textContent = hit ? hit[1] : "";
    ring.classList.toggle("link", !hit && !!e.target.closest("a, button"));
  });
}

// ---------- click the vinyl to scratch it ----------
const vinyl = document.getElementById("vinyl");
vinyl.style.pointerEvents = "auto";
vinyl.addEventListener("click", () => {
  vinyl.animate(
    [{ transform: "rotate(0deg)" }, { transform: "rotate(-200deg)" }, { transform: "rotate(40deg)" }, { transform: "rotate(0deg)" }],
    { duration: 900, easing: "cubic-bezier(.3,.7,.3,1)" }
  );
});

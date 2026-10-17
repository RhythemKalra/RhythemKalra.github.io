// ---------- dark / light toggle ("ink" / "paper") ----------
const root = document.documentElement;
document.getElementById("themeToggle").addEventListener("click", () => {
  const next = root.dataset.theme === "paper" ? "ink" : "paper";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---------- "currently figuring out" rotator ----------
const thoughts = [
  "how AI changes creative work",
  "why most communities go quiet",
  "what I want my twenties to look like",
  "how to say no to good ideas",
  "how to ship this website before midnight",
];
const rotator = document.getElementById("rotator");
let i = 0;
setInterval(() => {
  rotator.classList.add("out");
  setTimeout(() => {
    i = (i + 1) % thoughts.length;
    rotator.textContent = thoughts[i];
    rotator.classList.remove("out");
  }, 350);
}, 2800);

// ---------- glow follows the cursor (desktop only) ----------
if (window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (e) => {
    root.style.setProperty("--mx", e.clientX + "px");
    root.style.setProperty("--my", e.clientY + "px");
  });
}

// ---------- fade sections in as you scroll ----------
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ---------- copy email button ----------
const copyBtn = document.getElementById("copyEmail");
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("rhythemkalra@gmail.com");
    copyBtn.textContent = "copied ✓";
  } catch (e) {
    copyBtn.textContent = "rhythemkalra@gmail.com";
  }
  setTimeout(() => (copyBtn.textContent = "copy email"), 2000);
});

document.getElementById("year").textContent = new Date().getFullYear();

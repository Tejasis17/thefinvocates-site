// ============================================================
// THE FINVOCATES — shared script
//
// >>> FILL THESE IN ONCE YOU CREATE YOUR GITHUB REPO <<<
// Example: if your repo lives at github.com/chakskale/finvocates-site
//   GITHUB_USER = "chakskale"
//   GITHUB_REPO = "finvocates-site"
// ============================================================
const GITHUB_USER = "YOUR-GITHUB-USERNAME";
const GITHUB_REPO = "YOUR-REPO-NAME";
const ARTICLES_FOLDER = "articles"; // drop .md or .pdf files here — filename becomes the title
const BRANCH = "main";

// ---------- helpers ----------

/** "RBI-Master-Direction-KYC-2026.pdf" -> "RBI Master Direction KYC 2026" */
function humanizeFilename(filename) {
  const noExt = filename.replace(/\.[^/.]+$/, "");
  return noExt
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function kindFromFilename(filename) {
  if (/\.pdf$/i.test(filename)) return "PDF";
  if (/\.(md|markdown|html)$/i.test(filename)) return "ARTICLE";
  return "FILE";
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ---------- GitHub folder → card feed ----------

async function fetchFolderContents(folder) {
  const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${folder}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("Unexpected response shape");
  return data
    .filter((item) => item.type === "file" && !item.name.startsWith(".") && item.name.toLowerCase() !== "readme.md")
    .sort((a, b) => b.name.localeCompare(a.name)); // newest-looking filenames first if date-prefixed
}

function cardHTML(item) {
  const title = humanizeFilename(item.name);
  const kind = kindFromFilename(item.name);
  const isPdf = kind === "PDF";
  const href = isPdf ? item.download_url : item.html_url;
  const dl = isPdf ? `download="${item.name}"` : `target="_blank" rel="noopener"`;
  const label = isPdf ? "Download PDF ↓" : "Read on GitHub →";
  return `
    <a class="card reveal" href="${href}" ${dl}>
      <span class="kind">${kind}</span>
      <span class="title">${title}</span>
      <span class="meta">${label}</span>
    </a>`;
}

function miniItemHTML(item) {
  const title = humanizeFilename(item.name);
  const kind = kindFromFilename(item.name);
  const isPdf = kind === "PDF";
  const href = isPdf ? item.download_url : item.html_url;
  const dl = isPdf ? `download="${item.name}"` : `target="_blank" rel="noopener"`;
  return `
    <a class="mega-item" href="${href}" ${dl}>
      <span class="mi-title">${title}</span>
      <span class="mi-meta">${kind}</span>
    </a>`;
}

/**
 * Renders a live feed from a GitHub repo folder into a container.
 * gridSelector: full-page grid (e.g. on articles.html)
 * megaSelector: small nav-dropdown preview list (optional)
 * limit: how many items the mega preview shows
 */
async function renderFolderFeed({ folder, gridSelector, megaSelector, limit = 3, emptyLabel = "content" }) {
  const grid = gridSelector ? document.querySelector(gridSelector) : null;
  const mega = megaSelector ? document.querySelector(megaSelector) : null;

  try {
    const items = await fetchFolderContents(folder);

    if (items.length === 0) {
      if (grid) grid.innerHTML = `<div class="empty-state">No ${emptyLabel} posted yet. Check back soon.</div>`;
      if (mega) mega.innerHTML = `<div class="mega-item"><span class="mi-title">Nothing posted yet</span></div>`;
      return;
    }

    if (grid) grid.innerHTML = items.map(cardHTML).join("");
    if (mega) mega.innerHTML = items.slice(0, limit).map(miniItemHTML).join("");

    observeReveals();
  } catch (err) {
    console.error("Could not load feed:", err);
    if (grid) {
      grid.innerHTML = `<div class="empty-state">Live feed isn't connected yet — add your GitHub username and repo name in script.js, then push a file into /${folder}.</div>`;
    }
    if (mega) {
      mega.innerHTML = `<div class="mega-item"><span class="mi-title">Feed not connected yet</span></div>`;
    }
  }
}

// ---------- scroll reveal ----------

function observeReveals() {
  const els = document.querySelectorAll(".reveal:not(.in)");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

// ---------- touch-friendly nav (tap to open mega menu) ----------

function setupNavTouchSupport() {
  const items = document.querySelectorAll(".nav-item");
  items.forEach((item) => {
    const trigger = item.querySelector(".nav-trigger");
    if (!trigger) return;
    trigger.addEventListener("click", (e) => {
      const isTouch = window.matchMedia("(hover: none)").matches;
      const mega = item.querySelector(".mega");
      if (isTouch && mega) {
        const isOpen = item.classList.contains("open");
        items.forEach((i) => i.classList.remove("open"));
        if (!isOpen) {
          e.preventDefault();
          item.classList.add("open");
        }
      }
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-item")) {
      items.forEach((i) => i.classList.remove("open"));
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  observeReveals();
  setupNavTouchSupport();
});

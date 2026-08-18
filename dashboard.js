// ============================================================
// THE FINVOCATES — regulatory dashboard
//
// Static-site constraint: GitHub Pages has no backend, and most
// regulator RSS feeds don't allow direct browser fetches (CORS).
// This routes each feed through rss2json.com, a free public proxy.
// ============================================================

const REFRESH_MINUTES = 15;

const SOURCES = [
  { name: "RBI", jurisdiction: "India", category: "central-banks", feed: "https://www.rbi.org.in/pressreleases_rss.xml" },
  { name: "FCA", jurisdiction: "UK", category: "conduct-markets", feed: "https://www.fca.org.uk/news/rss.xml" },
  { name: "BoE", jurisdiction: "UK", category: "central-banks", feed: "https://www.bankofengland.co.uk/rss/news" },
  { name: "PRA", jurisdiction: "UK", category: "central-banks", feed: "https://www.bankofengland.co.uk/rss/prudential-regulation" },
  { name: "BIS/BCBS", jurisdiction: "Global", category: "standard-setters", feed: "https://www.bis.org/doclist/all_rss.xml" },
  { name: "FSB", jurisdiction: "Global", category: "standard-setters", feed: "https://www.fsb.org/feed/" },
  { name: "ECB", jurisdiction: "Eurozone", category: "central-banks", feed: "https://www.ecb.europa.eu/rss/press.xml" },
  { name: "EBA", jurisdiction: "EU", category: "conduct-markets", feed: "https://www.eba.europa.eu/news-press/news/rss.xml" },
  { name: "Federal Reserve", jurisdiction: "US", category: "central-banks", feed: "https://www.federalreserve.gov/feeds/press_all.xml" },
  { name: "CFPB", jurisdiction: "US", category: "us-agencies", feed: "https://www.consumerfinance.gov/about-us/newsroom/feed/" },
  { name: "FINRA", jurisdiction: "US", category: "us-agencies", feed: "https://feeds.finra.org/news-and-events/feed" },
  { name: "OCC", jurisdiction: "US", category: "us-agencies", feed: "https://www.occ.gov/rss/index-rss.html" },
  { name: "HKMA", jurisdiction: "Hong Kong", category: "central-banks", feed: "https://www.hkma.gov.hk/eng/rss/press-releases.xml" },
  { name: "BOJ", jurisdiction: "Japan", category: "central-banks", feed: "https://www.boj.or.jp/en/rss/whatsnew.xml" },
  { name: "FINMA", jurisdiction: "Switzerland", category: "conduct-markets", feed: "https://www.finma.ch/en/news/rss/" },
  { name: "SNB", jurisdiction: "Switzerland", category: "central-banks", feed: "https://www.snb.ch/en/services-events/digital-services/rss-calendar-feeds" },
  { name: "BaFin", jurisdiction: "Germany", category: "conduct-markets", feed: "https://www.bafin.de/SiteGlobals/Functions/RSSFeed/EN/RSSGenerator_news_en.xml" },
  { name: "Bank of Canada", jurisdiction: "Canada", category: "central-banks", feed: "https://www.bankofcanada.ca/valet/fixed_income_yield_curves/feed" },
  { name: "RBA", jurisdiction: "Australia", category: "central-banks", feed: "https://www.rba.gov.au/rss/rss-cb-media-releases.xml" },
  { name: "Central Bank of Ireland", jurisdiction: "Ireland", category: "central-banks", feed: "https://www.centralbank.ie/rss-feed" },
  { name: "RBNZ", jurisdiction: "New Zealand", category: "central-banks", feed: "https://www.rbnz.govt.nz/-/media/rss/news" },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "central-banks", label: "Central Banks" },
  { key: "standard-setters", label: "Global Standard-Setters" },
  { key: "conduct-markets", label: "Conduct & Markets" },
  { key: "us-agencies", label: "US Agencies" },
];

let allItems = [];
let activeFilter = "all";
let isLoading = false;

function proxyUrl(feedUrl) {
  return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
}

/*
 * FCA sometimes comes through rss2json with a date string that
 * JavaScript cannot parse correctly. This keeps the original
 * timestamp when possible and explicitly handles FCA's common
 * date formats before falling back.
 */
function parseDate(source, item) {
  const candidates = [
    item.pubDate,
    item.published,
    item.isoDate,
    item.date,
    item.updated,
    item.pubdate,
  ];

  for (const value of candidates) {
    if (!value) continue;

    const parsed = new Date(value);

    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1971) {
      return parsed.toISOString();
    }

    // FCA occasionally supplies a UK-style date without a timezone.
    if (source.name === "FCA" && typeof value === "string") {
      const match = value.match(
        /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
      );

      if (match) {
        const day = Number(match[1]);
        const month = Number(match[2]) - 1;
        const year = Number(match[3]);
        const hour = Number(match[4] || 0);
        const minute = Number(match[5] || 0);
        const second = Number(match[6] || 0);

        const d = new Date(year, month, day, hour, minute, second);

        if (!isNaN(d.getTime()) && d.getFullYear() > 1971) {
          return d.toISOString();
        }
      }
    }
  }

  return null;
}

function timeAgo(dateValue) {
  if (!dateValue) return "";

  const then = new Date(dateValue);

  if (isNaN(then.getTime()) || then.getFullYear() <= 1971) {
    return "";
  }

  const mins = Math.round((Date.now() - then.getTime()) / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.round(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.round(hrs / 24);

  if (days < 30) return `${days}d ago`;

  return then.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

async function fetchSource(source, attempt = 1) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const separator = proxyUrl(source.feed).includes("?") ? "&" : "?";
    const url = `${proxyUrl(source.feed)}${separator}_=${Date.now()}`;

    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store"
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`${source.name}: HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!data || !Array.isArray(data.items)) {
      throw new Error(`${source.name}: no RSS items`);
    }

    return data.items.slice(0, 8).map((item) => ({
      title: item.title || "Untitled update",
      link: item.link || item.guid || "#",
      date: parseDate(source, item),
      source: source.name,
      jurisdiction: source.jurisdiction,
      category: source.category
    }));

  } catch (err) {
    if (attempt < 2) {
      await new Promise(resolve => setTimeout(resolve, 700));
      return fetchSource(source, attempt + 1);
    }

    console.warn(`Skipped ${source.name}:`, err.message);
    return [];
  }
}

/*
 * Fetch in small batches rather than firing all 21 requests at
 * exactly the same moment. This reduces proxy throttling while
 * still keeping the dashboard fast.
 */
async function fetchAllSources() {
  const results = [];
  const batchSize = 4;

  for (let i = 0; i < SOURCES.length; i += batchSize) {
    const batch = SOURCES.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(source => fetchSource(source))
    );

    results.push(...batchResults);
  }

  return results;
}

function renderFeed() {
  const list = document.getElementById("dash-feed-list");

  if (!list) return;

  const filtered =
    activeFilter === "all"
      ? allItems
      : allItems.filter((i) => i.category === activeFilter);

  if (filtered.length === 0) {
    list.innerHTML =
      `<div class="dash-empty">No updates loaded for this filter yet.</div>`;
    return;
  }

  list.innerHTML = filtered
    .map(
      (item) => `
    <div class="dash-row">
      <a class="dash-title" href="${item.link}" target="_blank" rel="noopener">${item.title}</a>
      <div class="dash-meta">
        <span class="dash-source">${item.source} · ${item.jurisdiction}</span>
        <span class="dash-time">${timeAgo(item.date)}</span>
      </div>
    </div>`
    )
    .join("");
}

/** Small top-N preview for the homepage — same row styling, no filters. */
function renderHomePreview(limit = 5) {
  const el = document.getElementById("home-dashboard-preview");

  if (!el) return;

  if (allItems.length === 0) {
    el.innerHTML = `<div class="dash-empty">Loading live updates…</div>`;
    return;
  }

  el.innerHTML = allItems
    .slice(0, limit)
    .map(
      (item) => `
    <div class="dash-row">
      <a class="dash-title" href="${item.link}" target="_blank" rel="noopener">${item.title}</a>
      <div class="dash-meta">
        <span class="dash-source">${item.source} · ${item.jurisdiction}</span>
        <span class="dash-time">${timeAgo(item.date)}</span>
      </div>
    </div>`
    )
    .join("");
}

function setupFilters() {
  const bar = document.getElementById("dash-filters");

  if (!bar) return;

  bar.innerHTML = FILTERS.map(
    (f) =>
      `<button class="dash-filter${f.key === "all" ? " active" : ""}" data-key="${f.key}">${f.label}</button>`
  ).join("");

  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".dash-filter");

    if (!btn) return;

    activeFilter = btn.dataset.key;

    bar
      .querySelectorAll(".dash-filter")
      .forEach((b) => b.classList.toggle("active", b === btn));

    renderFeed();
  });
}

async function loadAll(isRefresh) {
  // Prevent two refresh cycles from running simultaneously.
  if (isLoading) return;

  isLoading = true;

  const statusEl = document.getElementById("dash-status-text");
  const dot = document.getElementById("dash-dot");
  const feedList = document.getElementById("dash-feed-list");

  if (!isRefresh && feedList) {
    feedList.innerHTML =
      `<div class="dash-loading">Loading live updates from ${SOURCES.length} regulators…</div>`;
  }

  if (statusEl) statusEl.textContent = "Refreshing…";
  if (dot) dot.classList.remove("live");

  try {
    const results = await fetchAllSources();

    const merged = results.flat();

    const failedCount = results.filter((r) => r.length === 0).length;

    merged.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    allItems = merged;

    renderFeed();
    renderHomePreview();

    const now = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const workingSources = SOURCES.length - failedCount;

    if (statusEl) {
      statusEl.textContent =
        `Last updated ${now} · ${merged.length} updates from ${workingSources}/${SOURCES.length} sources`;
    }

    if (dot) dot.classList.add("live");

    const errNote = document.getElementById("dash-error-note");

    if (failedCount > 0 && errNote) {
      errNote.style.display = "block";
      errNote.textContent =
        `${failedCount} source${failedCount > 1 ? "s" : ""} didn't respond this refresh — they'll retry automatically.`;
    } else if (errNote) {
      errNote.style.display = "none";
    }

  } catch (err) {
    console.error("Dashboard refresh failed:", err);

    if (statusEl) {
      statusEl.textContent = "Refresh failed — retrying automatically";
    }
  } finally {
    isLoading = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupFilters();

  loadAll(false);

  setInterval(() => {
    loadAll(true);
  }, REFRESH_MINUTES * 60 * 1000);
});

// ============================================================
// THE FINVOCATES — regulatory dashboard
//
// Static-site constraint: GitHub Pages has no backend, and most
// regulator RSS feeds don't allow direct browser fetches (CORS).
// This routes each feed through allorigins.win, a free public proxy
// that fetches server-side and returns raw XML with CORS headers.
// The XML is then parsed natively in the browser to ensure feeds
// bypass restrictive proxy blocks and caching rules.
// ============================================================

const REFRESH_MINUTES = 15;

const SOURCES = [
  { name: "RBI",   jurisdiction: "India",         category: "central-banks", feed: "https://www.rbi.org.in/pressreleases_rss.xml" },
  { name: "FCA",    jurisdiction: "UK",            category: "conduct-markets", feed: "https://www.fca.org.uk/news/rss.xml" },
  { name: "BoE",    jurisdiction: "UK",            category: "central-banks", feed: "https://www.bankofengland.co.uk/rss/news" },
  { name: "PRA",    jurisdiction: "UK",            category: "central-banks", feed: "https://www.bankofengland.co.uk/rss/prudential-regulation" },
  { name: "BIS/BCBS", jurisdiction: "Global",       category: "standard-setters", feed: "https://www.bis.org/doclist/all_pressrels.rss" },
  { name: "FSB",    jurisdiction: "Global",        category: "standard-setters", feed: "https://www.fsb.org/feed/" },
  { name: "ECB",    jurisdiction: "Eurozone",      category: "central-banks", feed: "https://www.ecb.europa.eu/rss/press.xml" },
  { name: "EBA",    jurisdiction: "EU",            category: "conduct-markets", feed: "https://www.eba.europa.eu/news-press/news/rss.xml" },
  { name: "Federal Reserve", jurisdiction: "US",   category: "central-banks", feed: "https://www.federalreserve.gov/feeds/press_all.xml" },
  { name: "CFPB",   jurisdiction: "US",            category: "us-agencies", feed: "https://www.consumerfinance.gov/about-us/newsroom/feed/" },
  { name: "FINRA",  jurisdiction: "US",            category: "us-agencies", feed: "https://feeds.finra.org/news-and-events/feed" },
  { name: "OCC",    jurisdiction: "US",            category: "us-agencies", feed: "https://www.occ.gov/rss/news-releases.xml" },
  { name: "HKMA",   jurisdiction: "Hong Kong",     category: "central-banks", feed: "https://www.hkma.gov.hk/eng/rss/press-releases.xml" },
  { name: "BOJ",    jurisdiction: "Japan",         category: "central-banks", feed: "https://www.boj.or.jp/en/rss/whatsnew.xml" },
  { name: "FINMA",  jurisdiction: "Switzerland",   category: "conduct-markets", feed: "https://www.finma.ch/en/news/rss/" },
  { name: "SNB",    jurisdiction: "Switzerland",   category: "central-banks", feed: "https://www.snb.ch/dir/rss/en/press_releases.xml" },
  { name: "BaFin",  jurisdiction: "Germany",       category: "conduct-markets", feed: "https://www.bafin.de/SiteGlobals/Functions/RSSFeed/EN/RSSGenerator_news_en.xml" },
  { name: "Bank of Canada", jurisdiction: "Canada", category: "central-banks", feed: "https://www.bankofcanada.ca/feed/" },
  { name: "RBA",    jurisdiction: "Australia",     category: "central-banks", feed: "https://www.rba.gov.au/rss/rss-cb-media-releases.xml" },
  { name: "Central Bank of Ireland", jurisdiction: "Ireland", category: "central-banks", feed: "https://www.centralbank.ie/rss-feed" },
  { name: "RBNZ",   jurisdiction: "New Zealand",   category: "central-banks", feed: "https://www.rbnz.govt.nz/-/media/rss/news" },
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

function timeAgo(dateStr) {
  if (!dateStr || dateStr.startsWith("1970")) return "Date unavailable";
  
  dateStr = dateStr.replace(/[\n\r\t]/g, " ").trim();
  let then = new Date(dateStr);
  
  if (isNaN(then.getTime())) {
    let fixed = dateStr.replace(" ", "T");
    if (!fixed.endsWith("Z") && !fixed.includes("+")) fixed += "Z";
    then = new Date(fixed);
  }

  if (isNaN(then.getTime())) {
    const match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (match) {
      then = new Date(match[3], match[2] - 1, match[1]);
    }
  }

  if (isNaN(then.getTime())) {
    const match = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (match) {
      then = new Date(match[1], match[2] - 1, match[3]);
    }
  }

  if (isNaN(then.getTime())) return "Date unavailable";

  const mins = Math.round((Date.now() - then.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return then.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

async function fetchSource(source) {
  try {
    const cbUrl = source.feed + (source.feed.includes('?') ? '&' : '?') + '_cb=' + Date.now();
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(cbUrl)}`;
    const res = await fetch(proxyUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`${source.name}: HTTP ${res.status}`);
    
    const data = await res.json();
    if (!data.contents) return [];

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data.contents, "text/xml");

    const items = Array.from(xmlDoc.querySelectorAll("item, entry")).slice(0, 8);
    
    return items.map((item) => {
      const titleNode = item.querySelector("title");
      let title = titleNode ? titleNode.textContent : "No title";
      title = title.replace(/^<!\[CDATA\[(.*)\]\]>$/, "$1").trim();

      let link = "";
      const linkNode = item.querySelector("link");
      if (linkNode) {
        link = linkNode.textContent.trim();
        if (!link) link = linkNode.getAttribute("href") || "";
      }

      let date = "";
      const dateTags = ["pubDate", "pubdate", "published", "updated", "dc:date", "date", "prism:publicationDate"];
      
      for (const tag of dateTags) {
        const nodes = item.getElementsByTagName(tag);
        if (nodes.length > 0) {
          date = nodes[0].textContent.trim();
          break;
        }
        const nsNodes = item.getElementsByTagNameNS("*", tag.replace(/.*:/, ""));
        if (nsNodes.length > 0) {
          date = nsNodes[0].textContent.trim();
          break;
        }
      }
      
      if (!date) {
        const children = item.children;
        for (let i = 0; i < children.length; i++) {
          const tag = children[i].tagName.toLowerCase();
          if (tag.includes("date") || tag === "published" || tag === "updated") {
            date = children[i].textContent.trim();
            break;
          }
        }
      }

      return {
        title,
        link,
        date,
        source: source.name,
        jurisdiction: source.jurisdiction,
        category: source.category,
      };
    });
  } catch (err) {
    console.warn(`Skipped ${source.name}:`, err.message);
    return [];
  }
}

function renderFeed() {
  const list = document.getElementById("dash-feed-list");
  if (!list) return;
  const filtered = activeFilter === "all" ? allItems : allItems.filter((i) => i.category === activeFilter);

  if (filtered.length === 0) {
    list.innerHTML = `<div class="dash-empty">No updates loaded for this filter yet.</div>`;
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
    (f) => `<button class="dash-filter${f.key === "all" ? " active" : ""}" data-key="${f.key}">${f.label}</button>`
  ).join("");
  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".dash-filter");
    if (!btn) return;
    activeFilter = btn.dataset.key;
    bar.querySelectorAll(".dash-filter").forEach((b) => b.classList.toggle("active", b === btn));
    renderFeed();
  });
}

async function loadAll(isRefresh) {
  const statusEl = document.getElementById("dash-status-text");
  const dot = document.getElementById("dash-dot");
  const feedList = document.getElementById("dash-feed-list");
  if (!isRefresh && feedList) {
    feedList.innerHTML = `<div class="dash-loading">Loading live updates from ${SOURCES.length} regulators…</div>`;
  }
  if (statusEl) statusEl.textContent = "Refreshing…";
  if (dot) dot.classList.remove("live");

  const results = await Promise.all(SOURCES.map(fetchSource));
  const merged = results.flat();
  const failedCount = results.filter((r) => r.length === 0).length;

  merged.sort((a, b) => new Date(b.date) - new Date(a.date));
  allItems = merged;
  renderFeed();
  renderHomePreview();

  const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (statusEl) statusEl.textContent = `Last updated ${now} · ${merged.length} updates from ${SOURCES.length - failedCount}/${SOURCES.length} sources`;
  if (dot) dot.classList.add("live");

  const errNote = document.getElementById("dash-error-note");
  if (failedCount > 0 && errNote) {
    errNote.style.display = "block";
    errNote.textContent = `${failedCount} source${failedCount > 1 ? "s" : ""} didn't respond this refresh — usually temporary (proxy rate limit or a feed URL change). They'll retry automatically.`;
  } else if (errNote) {
    errNote.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  loadAll(false);
  setInterval(() => loadAll(true), REFRESH_MINUTES * 60 * 1000);
});
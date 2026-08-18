// ============================================================
// THE FINVOCATES — regulatory dashboard
//
// Static-site constraint: GitHub Pages has no backend, and most
// regulator RSS feeds don't allow direct browser fetches (CORS).
// This routes each feed through rss2json.com, a free public proxy
// that fetches server-side and returns JSON with CORS headers.
//
// Sources are fetched in small batches with retries so one
// temporary proxy failure does not randomly move the dashboard
// between 13/21, 14/21 and 15/21.
//
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

// Prevent two refresh cycles from running at once.
let loading = false;


// ============================================================
// RSS2JSON PROXY
// ============================================================

function proxyUrl(feedUrl) {
  return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
}


// ============================================================
// DATE PARSER
// ============================================================

function parseDate(value) {

  if (!value) return null;

  const direct = new Date(value);

  if (
    !isNaN(direct.getTime()) &&
    direct.getFullYear() > 1971
  ) {
    return direct;
  }

  // Handles DD/MM/YYYY, DD-MM-YYYY and DD.MM.YYYY.
  if (typeof value === "string") {

    const match = value.match(
      /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/
    );

    if (match) {

      const day = Number(match[1]);
      const month = Number(match[2]) - 1;
      const year = Number(match[3]);

      const d = new Date(
        year,
        month,
        day
      );

      if (
        !isNaN(d.getTime()) &&
        d.getFullYear() > 1971
      ) {
        return d;
      }
    }
  }

  return null;
}


// ============================================================
// EXACT DATE DISPLAY
// ============================================================

function formatDate(date) {

  if (!date) {
    return "Date unavailable";
  }

  const d =
    date instanceof Date
      ? date
      : parseDate(date);

  if (
    !d ||
    isNaN(d.getTime()) ||
    d.getFullYear() <= 1971
  ) {
    return "Date unavailable";
  }

  return d.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}


// ============================================================
// FCA DATE EXTRACTION
// ============================================================

function extractFCADate(item) {

  const fields = [
    item.pubDate,
    item.published,
    item.isoDate,
    item.updated,
    item.date,
    item.pubdate,
    item["dc:date"],
    item.description,
    item.content,
    item.contentSnippet
  ];

  for (const field of fields) {

    if (!field) continue;

    const text =
      String(field)
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();


    // FCA page/feed wording.
    const firstPublished =
      text.match(
        /First\s+published\s*:?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i
      );

    if (firstPublished) {

      return new Date(
        Number(firstPublished[3]),
        Number(firstPublished[2]) - 1,
        Number(firstPublished[1])
      );
    }


    // Generic FCA DD/MM/YYYY.
    const generic =
      text.match(
        /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/
      );

    if (generic) {

      const d =
        new Date(
          Number(generic[3]),
          Number(generic[2]) - 1,
          Number(generic[1])
        );

      if (
        !isNaN(d.getTime()) &&
        d.getFullYear() > 1971
      ) {
        return d;
      }
    }
  }

  return null;
}


// ============================================================
// FCA ARTICLE PAGE FALLBACK
//
// Only used when FCA RSS doesn't expose a valid date.
// ============================================================

async function fetchFCAPageDate(item) {

  if (!item.link) {
    return null;
  }

  try {

    const url =
      "https://api.allorigins.win/raw?url=" +
      encodeURIComponent(item.link);

    const response =
      await fetch(
        url,
        {
          cache: "no-store"
        }
      );

    if (!response.ok) {
      return null;
    }

    const html =
      await response.text();

    const match =
      html.match(
        /First\s+published\s*:?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i
      );

    if (!match) {
      return null;
    }

    return new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1])
    );

  } catch (err) {

    console.warn(
      "FCA page date fallback failed:",
      err.message
    );

    return null;
  }
}


// ============================================================
// FETCH ONE SOURCE
//
// Up to 3 attempts.
// ============================================================

async function fetchSource(
  source,
  attempt = 1
) {

  try {

    const response =
      await fetch(
        proxyUrl(source.feed) +
        "&t=" +
        Date.now(),
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );
    }


    const data =
      await response.json();


    if (
      !data ||
      data.status !== "ok" ||
      !Array.isArray(data.items) ||
      data.items.length === 0
    ) {

      throw new Error(
        "No usable RSS items"
      );
    }


    let items =
      data.items
        .slice(0, 8)
        .map(
          item => {

            let date =
              parseDate(
                item.pubDate ||
                item.published ||
                item.isoDate ||
                item.updated ||
                item.date ||
                item.pubdate ||
                item["dc:date"]
              );


            // FCA gets its own date parser.
            if (
              source.name === "FCA"
            ) {

              const fcaDate =
                extractFCADate(item);

              if (fcaDate) {
                date = fcaDate;
              }
            }


            return {

              title:
                item.title ||
                "Untitled update",

              link:
                item.link ||
                item.guid ||
                "#",

              date,

              source:
                source.name,

              jurisdiction:
                source.jurisdiction,

              category:
                source.category,

              // Keep original RSS item for
              // FCA fallback processing.
              _raw:
                item
            };
          }
        );


    // --------------------------------------------------------
    // FCA fallback only where RSS did not give a date.
    // --------------------------------------------------------

    if (
      source.name === "FCA"
    ) {

      for (
        const item of items
      ) {

        if (
          !item.date ||
          item.date.getFullYear() <= 1971
        ) {

          const pageDate =
            await fetchFCAPageDate(
              item
            );

          if (pageDate) {
            item.date = pageDate;
          }

          // Keep FCA page requests gentle.
          await new Promise(
            resolve =>
              setTimeout(
                resolve,
                100
              )
          );
        }
      }
    }


    return items;

  } catch (err) {

    console.warn(
      `Attempt ${attempt} failed for ${source.name}:`,
      err.message
    );


    if (attempt < 3) {

      // Increasing retry delay:
      // 1.2s → 2.4s
      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            1200 * attempt
          )
      );


      return fetchSource(
        source,
        attempt + 1
      );
    }


    console.warn(
      `Giving up on ${source.name} for this refresh.`
    );


    return [];
  }
}


// ============================================================
// RENDER FEED
// ============================================================

function renderFeed() {

  const list =
    document.getElementById(
      "dash-feed-list"
    );

  if (!list) return;


  const filtered =
    activeFilter === "all"
      ? allItems
      : allItems.filter(
          i =>
            i.category ===
            activeFilter
        );


  if (
    filtered.length === 0
  ) {

    list.innerHTML =
      `<div class="dash-empty">
        No updates loaded for this filter yet.
      </div>`;

    return;
  }


  list.innerHTML =
    filtered
      .map(
        item => `
    <div class="dash-row">

      <a
        class="dash-title"
        href="${item.link}"
        target="_blank"
        rel="noopener"
      >${item.title}</a>

      <div class="dash-meta">

        <span class="dash-source">
          ${item.source} · ${item.jurisdiction}
        </span>

        <span class="dash-time">
          ${formatDate(item.date)}
        </span>

      </div>

    </div>`
      )
      .join("");
}


// ============================================================
// HOMEPAGE PREVIEW
// ============================================================

function renderHomePreview(
  limit = 5
) {

  const el =
    document.getElementById(
      "home-dashboard-preview"
    );

  if (!el) return;


  if (
    allItems.length === 0
  ) {

    el.innerHTML =
      `<div class="dash-empty">
        Loading live updates…
      </div>`;

    return;
  }


  el.innerHTML =
    allItems
      .slice(0, limit)
      .map(
        item => `
    <div class="dash-row">

      <a
        class="dash-title"
        href="${item.link}"
        target="_blank"
        rel="noopener"
      >${item.title}</a>

      <div class="dash-meta">

        <span class="dash-source">
          ${item.source} · ${item.jurisdiction}
        </span>

        <span class="dash-time">
          ${formatDate(item.date)}
        </span>

      </div>

    </div>`
      )
      .join("");
}


// ============================================================
// FILTERS
// ============================================================

function setupFilters() {

  const bar =
    document.getElementById(
      "dash-filters"
    );

  if (!bar) return;


  bar.innerHTML =
    FILTERS
      .map(
        f =>
          `<button
            class="dash-filter${
              f.key === "all"
                ? " active"
                : ""
            }"
            data-key="${f.key}"
          >${f.label}</button>`
      )
      .join("");


  bar.addEventListener(
    "click",
    e => {

      const btn =
        e.target.closest(
          ".dash-filter"
        );


      if (!btn) return;


      activeFilter =
        btn.dataset.key;


      bar
        .querySelectorAll(
          ".dash-filter"
        )
        .forEach(
          b =>
            b.classList.toggle(
              "active",
              b === btn
            )
        );


      renderFeed();
    }
  );
}


// ============================================================
// LOAD ALL SOURCES
//
// IMPORTANT:
// Do NOT hit all 21 simultaneously.
//
// Three at a time + retries keeps rss2json
// from randomly dropping sources.
// ============================================================

async function loadAll(
  isRefresh
) {

  // Never allow overlapping refreshes.
  if (loading) {
    return;
  }

  loading = true;


  const statusEl =
    document.getElementById(
      "dash-status-text"
    );

  const dot =
    document.getElementById(
      "dash-dot"
    );

  const feedList =
    document.getElementById(
      "dash-feed-list"
    );


  if (
    !isRefresh &&
    feedList
  ) {

    feedList.innerHTML =
      `<div class="dash-loading">
        Loading live updates from ${SOURCES.length} regulators…
      </div>`;
  }


  if (statusEl) {
    statusEl.textContent =
      "Refreshing…";
  }


  if (dot) {
    dot.classList.remove(
      "live"
    );
  }


  const results = [];


  // ----------------------------------------------------------
  // Fetch 3 regulators at a time.
  // ----------------------------------------------------------

  const BATCH_SIZE = 3;


  for (
    let i = 0;
    i < SOURCES.length;
    i += BATCH_SIZE
  ) {

    const batch =
      SOURCES.slice(
        i,
        i + BATCH_SIZE
      );


    const batchResults =
      await Promise.all(
        batch.map(
          source =>
            fetchSource(
              source
            )
        )
      );


    results.push(
      ...batchResults
    );


    // Small pause between batches.
    if (
      i + BATCH_SIZE <
      SOURCES.length
    ) {

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            500
          )
      );
    }
  }


  // ----------------------------------------------------------
  // Merge everything.
  // ----------------------------------------------------------

  const merged =
    results.flat();


  const failedCount =
    results.filter(
      r =>
        r.length === 0
    ).length;


  // ----------------------------------------------------------
  // Newest first.
  // ----------------------------------------------------------

  merged.sort(
    (a, b) => {

      const aTime =
        a.date instanceof Date
          ? a.date.getTime()
          : 0;

      const bTime =
        b.date instanceof Date
          ? b.date.getTime()
          : 0;

      return (
        bTime -
        aTime
      );
    }
  );


  allItems =
    merged;


  renderFeed();

  renderHomePreview();


  // ----------------------------------------------------------
  // Status.
  // ----------------------------------------------------------

  const now =
    new Date().toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );


  const working =
    SOURCES.length -
    failedCount;


  if (statusEl) {

    statusEl.textContent =
      `Last updated ${now} · ` +
      `${merged.length} updates from ` +
      `${working}/${SOURCES.length} sources`;
  }


  if (dot) {
    dot.classList.add(
      "live"
    );
  }


  // ----------------------------------------------------------
  // Error note.
  // ----------------------------------------------------------

  const errNote =
    document.getElementById(
      "dash-error-note"
    );


  if (
    failedCount > 0 &&
    errNote
  ) {

    errNote.style.display =
      "block";

    errNote.textContent =
      `${failedCount} source` +
      (
        failedCount > 1
          ? "s"
          : ""
      ) +
      ` didn't respond after retries — ` +
      `they will be tried again on the next refresh.`;

  } else if (
    errNote
  ) {

    errNote.style.display =
      "none";
  }


  loading = false;
}


// ============================================================
// START
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupFilters();

    loadAll(false);


    setInterval(
      () =>
        loadAll(true),

      REFRESH_MINUTES *
      60 *
      1000
    );
  }
);

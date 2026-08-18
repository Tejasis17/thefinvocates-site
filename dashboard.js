// ============================================================
// THE FINVOCATES — regulatory dashboard
//
// Static-site constraint: GitHub Pages has no backend, and most
// regulator RSS feeds don't allow direct browser fetches (CORS).
// This routes each feed through rss2json.com, a free public proxy
// that fetches server-side and returns JSON with CORS headers.
//
// Each source loads independently and renders immediately.
// One slow regulator never blocks the rest.
//
// ============================================================

const REFRESH_MINUTES = 15;


// ============================================================
// SOURCES
// ============================================================

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


// ============================================================
// FILTERS
// ============================================================

const FILTERS = [
  { key: "all", label: "All" },
  { key: "central-banks", label: "Central Banks" },
  { key: "standard-setters", label: "Global Standard-Setters" },
  { key: "conduct-markets", label: "Conduct & Markets" },
  { key: "us-agencies", label: "US Agencies" },
];


// ============================================================
// REGULATOR COLOURS
// ============================================================

const REGULATOR_COLORS = {

  "RBI": "#8b5cf6",

  "FCA": "#2563eb",

  "BoE": "#1d4ed8",

  "PRA": "#4338ca",

  "BIS/BCBS": "#475569",

  "FSB": "#64748b",

  "ECB": "#0891b2",

  "EBA": "#0e7490",

  "Federal Reserve": "#dc2626",

  "CFPB": "#b91c1c",

  "FINRA": "#be123c",

  "OCC": "#9f1239",

  "HKMA": "#0f766e",

  "BOJ": "#db2777",

  "FINMA": "#15803d",

  "SNB": "#166534",

  "BaFin": "#ca8a04",

  "Bank of Canada": "#c2410c",

  "RBA": "#ea580c",

  "Central Bank of Ireland": "#059669",

  "RBNZ": "#0284c7"
};


// ============================================================
// STATE
// ============================================================

let allItems = [];

let activeFilter = "all";

// Prevent overlapping refresh cycles.
let loading = false;


// ============================================================
// PROXY
// ============================================================

function proxyUrl(feedUrl) {

  return (
    "https://api.rss2json.com/v1/api.json?rss_url=" +
    encodeURIComponent(feedUrl)
  );
}


// ============================================================
// DATE PARSER
// ============================================================

function parseDate(value) {

  if (!value) {
    return null;
  }


  const direct =
    new Date(value);


  if (
    !isNaN(direct.getTime()) &&
    direct.getFullYear() > 1971
  ) {

    return direct;
  }


  if (
    typeof value === "string"
  ) {

    const match =
      value.match(
        /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/
      );


    if (match) {

      const day =
        Number(match[1]);

      const month =
        Number(match[2]) - 1;

      const year =
        Number(match[3]);


      const d =
        new Date(
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


  for (
    const field of fields
  ) {

    if (!field) {
      continue;
    }


    const text =
      String(field)
        .replace(
          /<[^>]*>/g,
          " "
        )
        .replace(
          /\s+/g,
          " "
        )
        .trim();


    // FCA's own page wording.
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


    // Generic DD/MM/YYYY.
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
// Every regulator gets its own independent retry cycle.
// ============================================================

async function fetchSource(
  source,
  attempt = 1
) {

  try {

    const res =
      await fetch(
        proxyUrl(source.feed) +
        "&t=" +
        Date.now(),
        {
          cache: "no-store"
        }
      );


    if (!res.ok) {

      throw new Error(
        `${source.name}: HTTP ${res.status}`
      );
    }


    const data =
      await res.json();


    if (
      !data ||
      data.status !== "ok" ||
      !Array.isArray(data.items) ||
      data.items.length === 0
    ) {

      throw new Error(
        `${source.name}: no usable items`
      );
    }


    const items =
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


            // FCA gets special parsing.
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

              _raw:
                item
            };
          }
        );


    // --------------------------------------------------------
    // FCA page fallback.
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
            item.date =
              pageDate;
          }


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
      `Giving up on ${source.name} this refresh.`
    );


    return [];
  }
}


// ============================================================
// SOURCE LABEL
// ============================================================

function sourceLabel(item) {

  const color =
    REGULATOR_COLORS[
      item.source
    ] || "#64748b";


  return `
    <span
      class="dash-source-name"
      style="
        color:${color};
        font-weight:600;
      "
    >${item.source}</span>
    <span style="opacity:.55;"> · ${item.jurisdiction}</span>
  `;
}


// ============================================================
// RENDER FEED
// ============================================================

function renderFeed() {

  const list =
    document.getElementById(
      "dash-feed-list"
    );


  if (!list) {
    return;
  }


  const filtered =
    activeFilter === "all"
      ? allItems
      : allItems.filter(
          item =>
            item.category ===
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
          ${sourceLabel(item)}
        </span>

        <span class="dash-time">
          ${formatDate(item.date)}
        </span>

      </div>

    </div>

    `
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


  if (!el) {
    return;
  }


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
      .slice(
        0,
        limit
      )
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
          ${sourceLabel(item)}
        </span>

        <span class="dash-time">
          ${formatDate(item.date)}
        </span>

      </div>

    </div>

    `
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


  if (!bar) {
    return;
  }


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


      if (!btn) {
        return;
      }


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
// LOAD ALL — PROGRESSIVE / INSTANT
//
// ALL sources begin immediately.
//
// Each source:
//   1. fetches independently
//   2. retries independently
//   3. is rendered immediately when it returns
//
// A slow source never holds the others hostage.
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


  // ----------------------------------------------------------
  // Clear previous results on a fresh refresh.
  // ----------------------------------------------------------

  allItems = [];


  renderFeed();


  // ----------------------------------------------------------
  // Start EVERY regulator immediately.
  // ----------------------------------------------------------

  let completed = 0;

  let failed = 0;


  const sourcePromises =
    SOURCES.map(
      async source => {

        const items =
          await fetchSource(
            source
          );


        completed++;


        if (
          items.length === 0
        ) {

          failed++;
        }


        // ----------------------------------------------------
        // THIS IS THE IMPORTANT PART:
        //
        // As soon as this particular source returns,
        // put its results into the dashboard.
        // ----------------------------------------------------

        if (
          items.length > 0
        ) {

          allItems.push(
            ...items
          );


          allItems.sort(
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


          // Instant render.
          renderFeed();

          renderHomePreview();
        }


        // ----------------------------------------------------
        // Live progress indicator.
        // ----------------------------------------------------

        if (statusEl) {

          statusEl.textContent =
            `Loading · ${completed}/${SOURCES.length} regulators`;
        }


        return items;
      }
    );


  // ----------------------------------------------------------
  // Wait only for the FINAL status.
  //
  // The feed itself has already been rendering continuously.
  // ----------------------------------------------------------

  await Promise.all(
    sourcePromises
  );


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
    failed;


  if (statusEl) {

    statusEl.textContent =
      `Last updated ${now} · ` +
      `${allItems.length} updates from ` +
      `${working}/${SOURCES.length} sources`;
  }


  if (dot) {

    dot.classList.add(
      "live"
    );
  }


  const errNote =
    document.getElementById(
      "dash-error-note"
    );


  if (
    failed > 0 &&
    errNote
  ) {

    errNote.style.display =
      "block";


    errNote.textContent =
      `${failed} source` +
      (
        failed > 1
          ? "s"
          : ""
      ) +
      ` didn't respond after retries — ` +
      `they will be tried again.`;

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

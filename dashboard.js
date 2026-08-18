// ============================================================
// THE FINVOCATES — REGULATORY DASHBOARD
// ============================================================

const REFRESH_MINUTES = 15;


// ============================================================
// SOURCES
// ============================================================

const SOURCES = [

  {
    name: "RBI",
    jurisdiction: "India",
    category: "central-banks",
    feed: "https://www.rbi.org.in/pressreleases_rss.xml"
  },

  {
    name: "FCA",
    jurisdiction: "UK",
    category: "conduct-markets",
    feed: "https://www.fca.org.uk/news/rss.xml"
  },

  {
    name: "BoE",
    jurisdiction: "UK",
    category: "central-banks",
    feed: "https://www.bankofengland.co.uk/rss/news"
  },

  {
    name: "PRA",
    jurisdiction: "UK",
    category: "central-banks",
    feed: "https://www.bankofengland.co.uk/rss/news"
  },

  {
    name: "BIS/BCBS",
    jurisdiction: "Global",
    category: "standard-setters",
    feed: "https://www.bis.org/doclist/all_pressrels.rss"
  },

  {
    name: "FSB",
    jurisdiction: "Global",
    category: "standard-setters",
    feed: "https://www.fsb.org/feed/"
  },

  {
    name: "ECB",
    jurisdiction: "Eurozone",
    category: "central-banks",
    feed: "https://www.ecb.europa.eu/rss/press.xml"
  },

  {
    name: "EBA",
    jurisdiction: "EU",
    category: "conduct-markets",
    feed: "https://www.eba.europa.eu/news-press/news/rss.xml"
  },

  {
    name: "Federal Reserve",
    jurisdiction: "US",
    category: "central-banks",
    feed: "https://www.federalreserve.gov/feeds/press_all.xml"
  },

  {
    name: "CFPB",
    jurisdiction: "US",
    category: "us-agencies",
    feed: "https://www.consumerfinance.gov/about-us/newsroom/feed/"
  },

  {
    name: "FINRA",
    jurisdiction: "US",
    category: "us-agencies",
    feed: "https://feeds.finra.org/FINRANews"
  },

  {
    name: "OCC",
    jurisdiction: "US",
    category: "us-agencies",
    feed: "https://www.occ.gov/rss/occ_news.xml"
  },

  {
    name: "HKMA",
    jurisdiction: "Hong Kong",
    category: "central-banks",
    api: "https://api.hkma.gov.hk/public/press-releases?lang=en"
  },

  {
    name: "BOJ",
    jurisdiction: "Japan",
    category: "central-banks",
    feed: "https://www.boj.or.jp/en/rss/whatsnew.xml"
  },

  {
    name: "FINMA",
    jurisdiction: "Switzerland",
    category: "conduct-markets",
    feed: "https://www.finma.ch/en/rss/"
  },

  {
    name: "SNB",
    jurisdiction: "Switzerland",
    category: "central-banks",
    feed: "https://www.snb.ch/dir/rss/en/press_releases.xml"
  },

  {
    name: "BaFin",
    jurisdiction: "Germany",
    category: "conduct-markets",
    feed: "https://www.bafin.de/SiteGlobals/Functions/RSSFeed/EN/RSSNewsfeed_Veroeffentlichungen/RSSNewsfeed_Veroeffentlichungen_node.html"
  },

  {
    name: "Bank of Canada",
    jurisdiction: "Canada",
    category: "central-banks",
    feed: "https://www.bankofcanada.ca/feed/"
  },

  {
    name: "RBA",
    jurisdiction: "Australia",
    category: "central-banks",
    feed: "https://www.rba.gov.au/rss/rss-cb-media-releases.xml"
  },

  {
    name: "Central Bank of Ireland",
    jurisdiction: "Ireland",
    category: "central-banks",
    feed: "https://www.centralbank.ie/rss-feed"
  },

  {
    name: "RBNZ",
    jurisdiction: "New Zealand",
    category: "central-banks",
    feed: "https://www.rbnz.govt.nz/-/media/rss/news"
  }
];


// ============================================================
// FILTERS
// ============================================================

const FILTERS = [
  { key: "all", label: "All" },
  { key: "central-banks", label: "Central Banks" },
  { key: "standard-setters", label: "Global Standard-Setters" },
  { key: "conduct-markets", label: "Conduct & Markets" },
  { key: "us-agencies", label: "US Agencies" }
];


// ============================================================
// STATE
// ============================================================

let allItems = [];
let activeFilter = "all";
let loading = false;


// ============================================================
// COLOURS
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
// HELPERS
// ============================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function proxyUrl(url) {

  return (
    "https://api.rss2json.com/v1/api.json?rss_url=" +
    encodeURIComponent(url)
  );
}


// ============================================================
// DATE PARSING
// ============================================================

function parseDateValue(value) {

  if (!value) {
    return null;
  }

  const direct = new Date(value);

  if (
    !isNaN(direct.getTime()) &&
    direct.getFullYear() > 1971
  ) {
    return direct;
  }


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


function parseItemDate(item) {

  const values = [

    item.pubDate,
    item.published,
    item.isoDate,
    item.updated,
    item.date,
    item.pubdate,
    item["dc:date"]
  ];

  for (const value of values) {

    const parsed =
      parseDateValue(value);

    if (parsed) {
      return parsed;
    }
  }

  return null;
}


// ============================================================
// FCA DATE EXTRACTION
// ============================================================

function extractFCADate(item) {

  // First inspect every likely RSS field.
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

    if (!field) {
      continue;
    }

    const text =
      String(field)
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();


    // FCA's own page format.
    const firstPublished =
      text.match(
        /First\s+published\s*:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i
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
// FCA PAGE FALLBACK
// ============================================================

async function fetchFCAPageDate(
  item
) {

  if (!item.link) {
    return null;
  }


  try {

    const url =
      "https://api.allorigins.win/raw?url=" +
      encodeURIComponent(
        item.link
      );


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


    // FCA page text contains:
    //
    // First published: 03/08/2026
    //

    const match =
      html.match(
        /First\s+published\s*:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i
      );


    if (!match) {
      return null;
    }


    return new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1])
    );

  } catch (error) {

    console.warn(
      "FCA page date fallback failed:",
      error.message
    );

    return null;
  }
}


// ============================================================
// FINAL DATE FORMAT
// ============================================================

function formatDate(
  dateValue,
  item
) {

  if (
    item &&
    item.source === "FCA"
  ) {

    const fcaDate =
      item.fcaDate ||
      extractFCADate(item);


    if (
      fcaDate &&
      !isNaN(
        fcaDate.getTime()
      )
    ) {

      return fcaDate.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric"
        }
      );
    }


    return "Date unavailable";
  }


  const date =
    dateValue instanceof Date
      ? dateValue
      : parseDateValue(dateValue);


  if (!date) {
    return "Date unavailable";
  }


  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}


// ============================================================
// NORMALISE RSS
// ============================================================

function normaliseItems(
  source,
  items
) {

  if (!Array.isArray(items)) {
    return [];
  }


  return items
    .slice(0, 8)
    .map(item => {

      const date =
        parseItemDate(item);


      return {

        title:
          item.title ||
          "Untitled update",

        link:
          item.link ||
          item.guid ||
          "#",

        date,

        fcaDate:
          source.name === "FCA"
            ? extractFCADate(item)
            : null,

        source:
          source.name,

        jurisdiction:
          source.jurisdiction,

        category:
          source.category
      };
    });
}


// ============================================================
// RSS FETCH
// ============================================================

async function fetchRSS(
  source,
  attempt = 1
) {

  try {

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        12000
      );


    const response =
      await fetch(
        proxyUrl(
          source.feed
        ) +
        "&cache=" +
        Date.now(),
        {
          cache: "no-store",
          signal: controller.signal
        }
      );


    clearTimeout(timeout);


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );
    }


    const data =
      await response.json();


    if (
      !data ||
      !Array.isArray(
        data.items
      )
    ) {

      throw new Error(
        "No RSS items returned"
      );
    }


    return normaliseItems(
      source,
      data.items
    );

  } catch (error) {

    if (attempt < 2) {

      await sleep(900);

      return fetchRSS(
        source,
        attempt + 1
      );
    }


    throw error;
  }
}


// ============================================================
// HKMA JSON
// ============================================================

async function fetchHKMA(
  source
) {

  try {

    const response =
      await fetch(
        source.api +
        "&offset=0",
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


    const records =
      data &&
      data.result &&
      Array.isArray(
        data.result.records
      )
        ? data.result.records
        : [];


    return records
      .slice(0, 8)
      .map(item => {

        const date =
          parseDateValue(
            item.date ||
            item.pubDate ||
            item.published
          );


        return {

          title:
            item.title ||
            "Untitled update",

          link:
            item.link ||
            "#",

          date,

          fcaDate: null,

          source:
            source.name,

          jurisdiction:
            source.jurisdiction,

          category:
            source.category
        };
      });

  } catch (error) {

    console.warn(
      "HKMA failed:",
      error.message
    );

    return [];
  }
}


// ============================================================
// FCA ENRICHMENT
// ============================================================

async function enrichFCADates(
  items
) {

  const result = [];


  for (
    const item of items
  ) {

    if (
      item.fcaDate
    ) {

      result.push(item);

      continue;
    }


    // Only fall back to page parsing
    // where the RSS item didn't give us
    // a usable FCA date.

    if (
      item.source === "FCA"
    ) {

      const pageDate =
        await fetchFCAPageDate(
          item
        );


      if (pageDate) {

        item.fcaDate =
          pageDate;

        item.date =
          pageDate;
      }
    }


    result.push(item);

    // Keep this light.
    await sleep(100);
  }


  return result;
}


// ============================================================
// ONE SOURCE
// ============================================================

async function fetchSource(
  source
) {

  // ----------------------------------------------------------
  // HKMA
  // ----------------------------------------------------------

  if (source.api) {

    return fetchHKMA(
      source
    );
  }


  // ----------------------------------------------------------
  // Everything else through RSS2JSON.
  // ----------------------------------------------------------

  try {

    let items =
      await fetchRSS(
        source
      );


    // FCA gets page-level date
    // enrichment only when needed.

    if (
      source.name === "FCA"
    ) {

      items =
        await enrichFCADates(
          items
        );
    }


    return items;

  } catch (error) {

    console.warn(
      `${source.name} failed:`,
      error.message
    );

    return [];
  }
}


// ============================================================
// FETCH ALL SOURCES
// ============================================================

async function fetchAllSources() {

  const results = [];

  const batchSize = 3;


  for (
    let i = 0;
    i < SOURCES.length;
    i += batchSize
  ) {

    const batch =
      SOURCES.slice(
        i,
        i + batchSize
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


    if (
      i + batchSize <
      SOURCES.length
    ) {

      await sleep(350);
    }
  }


  return results;
}


// ============================================================
// SOURCE LABEL
// ============================================================

function sourceLabel(
  item
) {

  const color =
    REGULATOR_COLORS[
      item.source
    ] || "#64748b";


  return `
    <span
      class="dash-source-name"
      style="color:${color}"
    >${item.source}</span>
    · ${item.jurisdiction}
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
                ${formatDate(
                  item.date,
                  item
                )}
              </span>

            </div>

          </div>

        `
      )
      .join("");
}


// ============================================================
// HOME PREVIEW
// ============================================================

function renderHomePreview(
  limit = 5
) {

  const element =
    document.getElementById(
      "home-dashboard-preview"
    );


  if (!element) {
    return;
  }


  if (
    allItems.length === 0
  ) {

    element.innerHTML =
      `<div class="dash-empty">
        Loading live updates…
      </div>`;

    return;
  }


  element.innerHTML =
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
                ${sourceLabel(item)}
              </span>

              <span class="dash-time">
                ${formatDate(
                  item.date,
                  item
                )}
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
        filter =>
          `<button
            class="dash-filter${
              filter.key === "all"
                ? " active"
                : ""
            }"
            data-key="${filter.key}"
          >${filter.label}</button>`
      )
      .join("");


  bar.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          ".dash-filter"
        );


      if (!button) {
        return;
      }


      activeFilter =
        button.dataset.key;


      bar
        .querySelectorAll(
          ".dash-filter"
        )
        .forEach(
          item =>
            item.classList.toggle(
              "active",
              item === button
            )
        );


      renderFeed();
    }
  );
}


// ============================================================
// LOAD
// ============================================================

async function loadAll(
  isRefresh
) {

  if (loading) {
    return;
  }


  loading = true;


  const status =
    document.getElementById(
      "dash-status-text"
    );


  const dot =
    document.getElementById(
      "dash-dot"
    );


  const feed =
    document.getElementById(
      "dash-feed-list"
    );


  if (
    !isRefresh &&
    feed
  ) {

    feed.innerHTML =
      `<div class="dash-loading">
        Loading live updates from ${SOURCES.length} regulators…
      </div>`;
  }


  if (status) {
    status.textContent =
      "Refreshing…";
  }


  if (dot) {
    dot.classList.remove(
      "live"
    );
  }


  try {

    const results =
      await fetchAllSources();


    const merged =
      results.flat();


    const failed =
      results.filter(
        result =>
          result.length === 0
      ).length;


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


        return bTime - aTime;
      }
    );


    allItems =
      merged;


    renderFeed();

    renderHomePreview();


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


    if (status) {

      status.textContent =
        `Last updated ${now} · ` +
        `${merged.length} updates from ` +
        `${working}/${SOURCES.length} sources`;
    }


    if (dot) {

      dot.classList.add(
        "live"
      );
    }


    const errorNote =
      document.getElementById(
        "dash-error-note"
      );


    if (
      failed > 0 &&
      errorNote
    ) {

      errorNote.style.display =
        "block";

      errorNote.textContent =
        `${failed} source` +
        (
          failed > 1
            ? "s"
            : ""
        ) +
        ` didn't respond this refresh — ` +
        `they'll retry automatically.`;

    } else if (
      errorNote
    ) {

      errorNote.style.display =
        "none";
    }


  } catch (error) {

    console.error(
      "Dashboard refresh failed:",
      error
    );


    if (status) {

      status.textContent =
        "Refresh failed — retrying automatically";
    }

  } finally {

    loading = false;
  }
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

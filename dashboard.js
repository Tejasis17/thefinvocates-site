// ============================================================
// THE FINVOCATES — REGULATORY DASHBOARD
// ============================================================

const REFRESH_MINUTES = 15;

const SOURCES = [

  // ----------------------------------------------------------
  // INDIA
  // ----------------------------------------------------------

  {
    name: "RBI",
    jurisdiction: "India",
    category: "central-banks",
    feed: "https://www.rbi.org.in/pressreleases_rss.xml"
  },

  // ----------------------------------------------------------
  // UNITED KINGDOM
  // ----------------------------------------------------------

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
    feed: "https://www.bankofengland.co.uk/rss/prudential-regulation",
    fallbackFeeds: [
      "https://www.bankofengland.co.uk/rss/news"
    ]
  },

  // ----------------------------------------------------------
  // GLOBAL
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // EUROPE
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // UNITED STATES
  // ----------------------------------------------------------

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
    feed: "https://www.consumerfinance.gov/about-us/newsroom/feed/",
    fallbackFeeds: [
      "https://www.consumerfinance.gov/feed/"
    ]
  },

  {
    name: "FINRA",
    jurisdiction: "US",
    category: "us-agencies",
    feed: "http://feeds.finra.org/FINRANews",
    fallbackFeeds: [
      "https://feeds.finra.org/FINRANews"
    ]
  },

  {
    name: "OCC",
    jurisdiction: "US",
    category: "us-agencies",
    feed: "https://www.occ.gov/rss/occ_news.xml",
    fallbackFeeds: [
      "https://www.occ.gov/rss/news-releases.xml"
    ]
  },

  // ----------------------------------------------------------
  // HONG KONG
  // ----------------------------------------------------------

  {
    name: "HKMA",
    jurisdiction: "Hong Kong",
    category: "central-banks",

    // HKMA now has an official JSON API.
    api:
      "https://api.hkma.gov.hk/public/press-releases?lang=en"
  },

  // ----------------------------------------------------------
  // JAPAN
  // ----------------------------------------------------------

  {
    name: "BOJ",
    jurisdiction: "Japan",
    category: "central-banks",
    feed: "https://www.boj.or.jp/en/rss/whatsnew.xml"
  },

  // ----------------------------------------------------------
  // SWITZERLAND
  // ----------------------------------------------------------

  {
    name: "FINMA",
    jurisdiction: "Switzerland",
    category: "conduct-markets",
    feed: "https://www.finma.ch/en/news/rss/"
  },

  {
    name: "SNB",
    jurisdiction: "Switzerland",
    category: "central-banks",
    feed: "https://www.snb.ch/dir/rss/en/press_releases.xml",
    fallbackFeeds: [
      "https://www.snb.ch/en/services-events/digital-services/rss-calendar-feeds"
    ]
  },

  // ----------------------------------------------------------
  // GERMANY
  // ----------------------------------------------------------

  {
    name: "BaFin",
    jurisdiction: "Germany",
    category: "conduct-markets",
    feed:
      "https://www.bafin.de/SiteGlobals/Functions/RSSFeed/EN/RSSGenerator_news_en.xml",
    fallbackFeeds: [
      "https://www.bafin.de/SiteGlobals/Functions/RSSFeed/EN/RSSNewsfeed_Veroeffentlichungen/RSSNewsfeed_Veroeffentlichungen_node.html"
    ]
  },

  // ----------------------------------------------------------
  // CANADA
  // ----------------------------------------------------------

  {
    name: "Bank of Canada",
    jurisdiction: "Canada",
    category: "central-banks",
    feed: "https://www.bankofcanada.ca/feed/"
  },

  // ----------------------------------------------------------
  // AUSTRALIA
  // ----------------------------------------------------------

  {
    name: "RBA",
    jurisdiction: "Australia",
    category: "central-banks",
    feed:
      "https://www.rba.gov.au/rss/rss-cb-media-releases.xml"
  },

  // ----------------------------------------------------------
  // IRELAND
  // ----------------------------------------------------------

  {
    name: "Central Bank of Ireland",
    jurisdiction: "Ireland",
    category: "central-banks",
    feed: "https://www.centralbank.ie/rss-feed",
    fallbackFeeds: [
      "https://www.centralbank.ie/fns/rss-feeds"
    ]
  },

  // ----------------------------------------------------------
  // NEW ZEALAND
  // ----------------------------------------------------------

  {
    name: "RBNZ",
    jurisdiction: "New Zealand",
    category: "central-banks",
    feed:
      "https://www.rbnz.govt.nz/-/media/rss/news",
    fallbackFeeds: [
      "https://www.rbnz.govt.nz/rss/news"
    ]
  }
];


// ============================================================
// FILTERS
// ============================================================

const FILTERS = [
  {
    key: "all",
    label: "All"
  },
  {
    key: "central-banks",
    label: "Central Banks"
  },
  {
    key: "standard-setters",
    label: "Global Standard-Setters"
  },
  {
    key: "conduct-markets",
    label: "Conduct & Markets"
  },
  {
    key: "us-agencies",
    label: "US Agencies"
  }
];


// ============================================================
// STATE
// ============================================================

let allItems = [];

let activeFilter = "all";

let loading = false;


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
// SMALL SOURCE-COLOUR STYLE
// ============================================================

(function addSourceColourStyles() {

  if (
    document.getElementById(
      "dash-source-colours"
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "dash-source-colours";

  style.textContent = `
    .dash-source {
      font-weight: 500;
    }

    .dash-source-name {
      font-weight: 600;
    }
  `;

  document.head.appendChild(
    style
  );

})();


// ============================================================
// RSS2JSON
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

function parseItemDate(item) {

  const candidates = [

    item.pubDate,

    item.published,

    item.isoDate,

    item.updated,

    item.date,

    item.pubdate,

    item["dc:date"]
  ];

  for (
    const value of candidates
  ) {

    if (!value) {
      continue;
    }

    const direct =
      new Date(value);

    if (
      !isNaN(
        direct.getTime()
      ) &&
      direct.getFullYear() > 1971
    ) {

      return direct;
    }


    // --------------------------------------------------------
    // DD/MM/YYYY
    // --------------------------------------------------------

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
          !isNaN(
            d.getTime()
          ) &&
          d.getFullYear() > 1971
        ) {

          return d;
        }
      }
    }
  }

  return null;
}


// ============================================================
// EXACT DATE DISPLAY
// ============================================================

function formatDate(
  dateValue,
  item
) {

  // ----------------------------------------------------------
  // FCA
  // ----------------------------------------------------------

  if (
    item &&
    item.source === "FCA"
  ) {

    const raw =
      item.fcaDate;

    if (raw) {

      const parsed =
        new Date(raw);

      if (
        !isNaN(
          parsed.getTime()
        ) &&
        parsed.getFullYear() > 1971
      ) {

        return parsed.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric"
          }
        );
      }


      const match =
        String(raw).match(
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
        );

      if (match) {

        return new Date(
          Number(match[3]),
          Number(match[2]) - 1,
          Number(match[1])
        ).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric"
          }
        );
      }
    }

    return "Date unavailable";
  }


  // ----------------------------------------------------------
  // NORMAL
  // ----------------------------------------------------------

  if (!dateValue) {

    return "Date unavailable";
  }

  const date =
    dateValue instanceof Date
      ? dateValue
      : new Date(dateValue);

  if (
    isNaN(
      date.getTime()
    ) ||
    date.getFullYear() <= 1971
  ) {

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
// NORMALISE RSS ITEMS
// ============================================================

function normaliseItems(
  source,
  items
) {

  if (
    !Array.isArray(items)
  ) {

    return [];
  }

  return items
    .slice(0, 8)
    .map(item => {

      const rawDate =
        item.pubDate ||
        item.published ||
        item.isoDate ||
        item.updated ||
        item.date ||
        item.pubdate ||
        item["dc:date"] ||
        "";

      return {

        title:
          item.title ||
          "Untitled update",

        link:
          item.link ||
          item.guid ||
          "#",

        date:
          parseItemDate(
            item
          ),

        fcaDate:
          source.name === "FCA"
            ? rawDate
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
// FETCH RSS THROUGH RSS2JSON
// ============================================================

async function fetchRSS(
  source,
  feed,
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

    const url =
      proxyUrl(feed) +
      "&cache=" +
      Date.now();

    const response =
      await fetch(
        url,
        {
          cache: "no-store",
          signal: controller.signal
        }
      );

    clearTimeout(
      timeout
    );

    if (
      !response.ok
    ) {

      throw new Error(
        `${source.name}: HTTP ${response.status}`
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
        `${source.name}: invalid RSS response`
      );
    }

    return normaliseItems(
      source,
      data.items
    );

  } catch (error) {

    if (
      attempt < 2
    ) {

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            900
          )
      );

      return fetchRSS(
        source,
        feed,
        attempt + 1
      );
    }

    throw error;
  }
}


// ============================================================
// HKMA — OFFICIAL JSON API
// ============================================================

async function fetchHKMA(
  source
) {

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      12000
    );

  try {

    const response =
      await fetch(
        source.api +
        "&offset=0",
        {
          cache: "no-store",
          signal: controller.signal
        }
      );

    clearTimeout(
      timeout
    );

    if (
      !response.ok
    ) {

      throw new Error(
        `HKMA API HTTP ${response.status}`
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
        : data &&
          data.result &&
          Array.isArray(
            data.result.data
          )
          ? data.result.data
          : [];

    return records
      .slice(0, 8)
      .map(item => {

        const rawDate =
          item.date ||
          item.pubDate ||
          item.published;

        return {

          title:
            item.title ||
            "Untitled update",

          link:
            item.link ||
            "#",

          date:
            rawDate
              ? new Date(
                  rawDate
                )
              : null,

          fcaDate:
            null,

          source:
            source.name,

          jurisdiction:
            source.jurisdiction,

          category:
            source.category
        };
      });

  } finally {

    clearTimeout(
      timeout
    );
  }
}


// ============================================================
// FETCH ONE SOURCE
// ============================================================

async function fetchSource(
  source
) {

  // ----------------------------------------------------------
  // HKMA gets its own official API.
  // ----------------------------------------------------------

  if (
    source.api
  ) {

    try {

      return await fetchHKMA(
        source
      );

    } catch (error) {

      console.warn(
        "HKMA API failed:",
        error.message
      );

      return [];
    }
  }


  // ----------------------------------------------------------
  // Normal RSS + fallbacks.
  // ----------------------------------------------------------

  const feeds = [

    source.feed,

    ...(source.fallbackFeeds || [])
  ];


  for (
    const feed of feeds
  ) {

    if (!feed) {
      continue;
    }

    try {

      const items =
        await fetchRSS(
          source,
          feed
        );

      if (
        items.length > 0
      ) {

        return items;
      }

    } catch (error) {

      console.warn(
        `${source.name} failed:`,
        feed,
        error.message
      );
    }
  }


  console.warn(
    `${source.name}: all feed attempts failed`
  );

  return [];
}


// ============================================================
// FETCH ALL 21
// ============================================================

async function fetchAllSources() {

  const results = [];

  // Small batches protect RSS2JSON.
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

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            350
          )
      );
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
// MAIN FEED
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
// LOAD / REFRESH
// ============================================================

async function loadAll(
  isRefresh
) {

  // Never overlap refresh cycles.
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


    const failedCount =
      results.filter(
        result =>
          result.length === 0
      ).length;


    // Newest first.
    merged.sort(
      (a, b) => {

        const dateA =
          a.date instanceof Date
            ? a.date.getTime()
            : 0;

        const dateB =
          b.date instanceof Date
            ? b.date.getTime()
            : 0;

        return (
          dateB -
          dateA
        );
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


    const workingSources =
      SOURCES.length -
      failedCount;


    if (status) {

      status.textContent =
        `Last updated ${now} · ` +
        `${merged.length} updates from ` +
        `${workingSources}/${SOURCES.length} sources`;
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
      failedCount > 0 &&
      errorNote
    ) {

      errorNote.style.display =
        "block";

      errorNote.textContent =
        `${failedCount} source` +
        `${
          failedCount > 1
            ? "s"
            : ""
        } didn't respond this refresh — ` +
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

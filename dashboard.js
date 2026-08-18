// ============================================================
// THE FINVOCATES — Regulatory Dashboard
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
    feed: "https://www.bankofengland.co.uk/rss/prudential-regulation",
    fallbackFeeds: [
      "https://www.bankofengland.co.uk/rss/news"
    ]
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
    fallbackPage: "https://www.occ.gov/rss/index-rss.html"
  },

  {
    name: "HKMA",
    jurisdiction: "Hong Kong",
    category: "central-banks",
    api: "https://api.hkma.gov.hk/public/press-releases?lang=en&offset=0"
  },

  {
    name: "BOJ",
    jurisdiction: "Japan",
    category: "central-banks",
    feed: "https://www.boj.or.jp/en/rss/whatsnew.xml"
  },

  // ==========================================================
  // SWITZERLAND
  // ==========================================================

  {
    name: "FINMA",
    jurisdiction: "Switzerland",
    category: "conduct-markets",
    feed: "https://www.finma.ch/en/news/rss/",
    fallbackPage: "https://www.finma.ch/en/rss/"
  },

  {
    name: "SNB",
    jurisdiction: "Switzerland",
    category: "central-banks",
    feed: "https://www.snb.ch/dir/rss/en/press_releases.xml",
    fallbackPage: "https://www.snb.ch/en/news-publications/media-releases"
  },

  // ==========================================================
  // GERMANY
  // ==========================================================

  {
    name: "BaFin",
    jurisdiction: "Germany",
    category: "conduct-markets",
    feed: "https://www.bafin.de/SiteGlobals/Functions/RSSFeed/EN/RSSGenerator_news_en.xml",
    fallbackPage: "https://www.bafin.de/EN/PublikationenDaten/Publikationen/publikationen_node_en.html"
  },

  // ==========================================================
  // CANADA
  // ==========================================================

  {
    name: "Bank of Canada",
    jurisdiction: "Canada",
    category: "central-banks",
    feed: "https://www.bankofcanada.ca/feed/",
    fallbackPage: "https://www.bankofcanada.ca/rss-feeds/"
  },

  // ==========================================================
  // AUSTRALIA
  // ==========================================================

  {
    name: "RBA",
    jurisdiction: "Australia",
    category: "central-banks",
    feed: "https://www.rba.gov.au/rss/rss-cb-media-releases.xml",
    fallbackPage: "https://www.rba.gov.au/media-releases/index.html"
  },

  // ==========================================================
  // IRELAND
  // ==========================================================

  {
    name: "Central Bank of Ireland",
    jurisdiction: "Ireland",
    category: "central-banks",
    feed: "https://www.centralbank.ie/rss-feed",
    fallbackPage: "https://www.centralbank.ie/news-media"
  },

  // ==========================================================
  // NEW ZEALAND
  // ==========================================================

  {
    name: "RBNZ",
    jurisdiction: "New Zealand",
    category: "central-banks",
    feed: "https://www.rbnz.govt.nz/-/media/rss/news",
    fallbackPage: "https://www.rbnz.govt.nz/news-and-events/news"
  }
];


// ============================================================
// CATEGORIES
// ============================================================

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "central-banks", label: "Central Banks" },
  { key: "standard-setters", label: "Global Standard-Setters" },
  { key: "conduct-markets", label: "Conduct & Markets" },
  { key: "us-agencies", label: "US Agencies" }
];


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
// STATE
// ============================================================

let activeCategory = "all";
let activeJurisdiction = "all";
let loading = false;

const lastSuccessfulItems = {};


// ============================================================
// HELPERS
// ============================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function sourceColor(name) {
  return REGULATOR_COLORS[name] || "#64748b";
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function rss2jsonUrl(feed) {
  return (
    "https://api.rss2json.com/v1/api.json?rss_url=" +
    encodeURIComponent(feed)
  );
}


function allOriginsUrl(url) {
  return (
    "https://api.allorigins.win/raw?url=" +
    encodeURIComponent(url)
  );
}


// ============================================================
// DATES
// ============================================================

function parseDate(value) {

  if (!value) return null;

  const d = new Date(value);

  if (
    !isNaN(d.getTime()) &&
    d.getFullYear() > 1971
  ) {
    return d;
  }

  if (typeof value === "string") {

    const m = value.match(
      /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/
    );

    if (m) {

      const x = new Date(
        Number(m[3]),
        Number(m[2]) - 1,
        Number(m[1])
      );

      if (
        !isNaN(x.getTime()) &&
        x.getFullYear() > 1971
      ) {
        return x;
      }
    }
  }

  return null;
}


function formatDate(date) {

  if (!date) return "Date unavailable";

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
// FCA
// ============================================================

function extractFCADate(item) {

  const fields = [
    item.pubDate,
    item.published,
    item.isoDate,
    item.updated,
    item.date,
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

    const first =
      text.match(
        /First\s+published\s*:?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i
      );

    if (first) {

      return new Date(
        Number(first[3]),
        Number(first[2]) - 1,
        Number(first[1])
      );
    }

    const generic =
      text.match(
        /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/
      );

    if (generic) {

      return new Date(
        Number(generic[3]),
        Number(generic[2]) - 1,
        Number(generic[1])
      );
    }
  }

  return null;
}


// ============================================================
// ITEM NORMALISATION
// ============================================================

function normaliseItem(item, source) {

  let date =
    parseDate(
      item.pubDate ||
      item.published ||
      item.isoDate ||
      item.updated ||
      item.date ||
      item["dc:date"]
    );

  if (source.name === "FCA") {

    const fcaDate =
      extractFCADate(item);

    if (fcaDate) {
      date = fcaDate;
    }
  }

  return {
    title:
      item.title ||
      item.name ||
      "Untitled update",

    link:
      item.link ||
      item.url ||
      item.guid ||
      "#",

    date,

    source: source.name,
    jurisdiction: source.jurisdiction,
    category: source.category
  };
}


// ============================================================
// RSS2JSON
// ============================================================

async function tryRss2Json(source, feed) {

  const response =
    await fetch(
      rss2jsonUrl(feed) +
      "&t=" +
      Date.now(),
      {
        cache: "no-store"
      }
    );

  if (!response.ok) {
    throw new Error(
      `RSS2JSON HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  if (
    !data ||
    !Array.isArray(data.items) ||
    !data.items.length
  ) {
    throw new Error(
      "RSS2JSON returned no items"
    );
  }

  return data.items
    .slice(0, 8)
    .map(
      item =>
        normaliseItem(
          item,
          source
        )
    );
}


// ============================================================
// RAW RSS / ATOM
// ============================================================

async function tryRawXml(source, feed) {

  const response =
    await fetch(
      allOriginsUrl(feed) +
      "&t=" +
      Date.now(),
      {
        cache: "no-store"
      }
    );

  if (!response.ok) {
    throw new Error(
      `Raw feed HTTP ${response.status}`
    );
  }

  const xml =
    await response.text();

  const doc =
    new DOMParser()
      .parseFromString(
        xml,
        "text/xml"
      );

  const nodes = [
    ...doc.querySelectorAll("item"),
    ...doc.querySelectorAll("entry")
  ];

  if (!nodes.length) {
    throw new Error(
      "No RSS/Atom entries"
    );
  }

  return nodes
    .slice(0, 8)
    .map(node => {

      const title =
        node.querySelector("title")
          ?.textContent
          ?.trim();

      const linkNode =
        node.querySelector("link");

      const link =
        linkNode?.getAttribute("href") ||
        linkNode?.textContent?.trim() ||
        "#";

      const date =
        node.querySelector("pubDate")
          ?.textContent ||
        node.querySelector("published")
          ?.textContent ||
        node.querySelector("updated")
          ?.textContent ||
        node.querySelector("date")
          ?.textContent ||
        "";

      const description =
        node.querySelector("description")
          ?.textContent ||
        node.querySelector("summary")
          ?.textContent ||
        "";

      return normaliseItem(
        {
          title,
          link,
          pubDate: date,
          description
        },
        source
      );
    });
}


// ============================================================
// PAGE FALLBACK
//
// Used for the six difficult sources if their RSS layer fails.
// Extracts article links + dates from the regulator's current
// official page rather than depending exclusively on RSS.
// ============================================================

async function fetchPageFallback(source) {

  if (!source.fallbackPage) {
    return [];
  }

  try {

    const response =
      await fetch(
        allOriginsUrl(
          source.fallbackPage
        ) +
        "&t=" +
        Date.now(),
        {
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        `Page HTTP ${response.status}`
      );
    }

    const html =
      await response.text();


    const doc =
      new DOMParser()
        .parseFromString(
          html,
          "text/html"
        );


    const candidates = [];


    // --------------------------------------------------------
    // Generic article/link discovery.
    // --------------------------------------------------------

    doc.querySelectorAll(
      "article, li, .card, .item, .news-item, .media-item, .search-result"
    ).forEach(node => {

      const a =
        node.querySelector(
          "a[href]"
        );

      if (!a) return;

      const title =
        (
          a.textContent ||
          ""
        ).trim();

      if (
        title.length < 10
      ) {
        return;
      }


      const href =
        a.getAttribute(
          "href"
        );


      if (!href) return;


      let link;

      try {

        link =
          new URL(
            href,
            source.fallbackPage
          ).href;

      } catch (_) {

        return;
      }


      const text =
        (
          node.textContent ||
          ""
        )
          .replace(/\s+/g, " ")
          .trim();


      // Prefer a date visible in the item.
      const dateMatch =
        text.match(
          /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\b/
        ) ||
        text.match(
          /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i
        );


      let date = null;


      if (dateMatch) {

        if (
          dateMatch[2] &&
          isNaN(Number(dateMatch[2]))
        ) {

          const monthMap = {
            january:0,
            february:1,
            march:2,
            april:3,
            may:4,
            june:5,
            july:6,
            august:7,
            september:8,
            october:9,
            november:10,
            december:11
          };


          date =
            new Date(
              Number(dateMatch[3]),
              monthMap[
                dateMatch[2].toLowerCase()
              ],
              Number(dateMatch[1])
            );

        } else {

          date =
            new Date(
              Number(dateMatch[3]),
              Number(dateMatch[2]) - 1,
              Number(dateMatch[1])
            );
        }
      }


      candidates.push({
        title,
        link,
        date
      });
    });


    // --------------------------------------------------------
    // Also inspect normal links on the current page.
    // --------------------------------------------------------

    if (
      candidates.length < 3
    ) {

      doc.querySelectorAll(
        "a[href]"
      ).forEach(a => {

        const title =
          (
            a.textContent ||
            ""
          ).trim();

        if (
          title.length < 20
        ) {
          return;
        }


        const href =
          a.getAttribute(
            "href"
          );


        if (!href) return;


        let link;

        try {

          link =
            new URL(
              href,
              source.fallbackPage
            ).href;

        } catch (_) {

          return;
        }


        // Keep only likely article/news URLs.
        if (
          !/news|press|media|release|publication|statement|speech|announcement/i.test(
            link
          )
        ) {
          return;
        }


        if (
          candidates.some(
            x =>
              x.link === link
          )
        ) {
          return;
        }


        candidates.push({
          title,
          link,
          date:null
        });
      });
    }


    return candidates
      .slice(0, 8)
      .map(
        item =>
          ({
            title: item.title,
            link: item.link,
            date: item.date,
            source: source.name,
            jurisdiction: source.jurisdiction,
            category: source.category
          })
      );

  } catch (err) {

    console.warn(
      `${source.name}: page fallback failed`,
      err.message
    );

    return [];
  }
}


// ============================================================
// HKMA
// ============================================================

async function tryHKMA(source) {

  const response =
    await fetch(
      source.api +
      "&t=" +
      Date.now(),
      {
        cache: "no-store"
      }
    );

  if (!response.ok) {

    throw new Error(
      `HKMA API HTTP ${response.status}`
    );
  }

  const data =
    await response.json();


  const records =
    data?.result?.records ||
    data?.result?.data ||
    [];


  if (
    !Array.isArray(records) ||
    !records.length
  ) {

    throw new Error(
      "HKMA returned no records"
    );
  }


  return records
    .slice(0, 8)
    .map(
      record => ({
        title:
          record.title ||
          "Untitled update",

        link:
          record.link ||
          "#",

        date:
          parseDate(
            record.date ||
            record.pubDate ||
            record.published
          ),

        source: source.name,
        jurisdiction: source.jurisdiction,
        category: source.category
      })
    );
}


// ============================================================
// MASTER FETCH
// ============================================================

async function fetchSource(source) {

  // API source
  if (source.api) {

    try {

      return await tryHKMA(
        source
      );

    } catch (err) {

      console.warn(
        `${source.name}: API failed`,
        err.message
      );
    }
  }


  // Primary RSS
  try {

    return await tryRss2Json(
      source,
      source.feed
    );

  } catch (_) {}


  // Raw primary RSS
  try {

    return await tryRawXml(
      source,
      source.feed
    );

  } catch (_) {}


  // Fallback RSS URLs
  for (
    const feed of (
      source.fallbackFeeds || []
    )
  ) {

    try {

      return await tryRss2Json(
        source,
        feed
      );

    } catch (_) {}


    try {

      return await tryRawXml(
        source,
        feed
      );

    } catch (_) {}
  }


  // Official page fallback
  const pageItems =
    await fetchPageFallback(
      source
    );


  if (pageItems.length) {
    return pageItems;
  }


  return [];
}


// ============================================================
// SOURCE BLOCK
// ============================================================

function createSourceBlock(source) {

  const color =
    sourceColor(
      source.name
    );


  const block =
    document.createElement(
      "div"
    );


  block.className =
    "dash-source-block";


  block.dataset.source =
    source.name;


  block.dataset.category =
    source.category;


  block.dataset.jurisdiction =
    source.jurisdiction;


  block.innerHTML = `

    <div
      class="dash-source-heading"
      style="
        border-left:3px solid ${color};
        padding-left:10px;
        margin:18px 0 8px;
        display:flex;
        align-items:center;
        gap:8px;
        flex-wrap:wrap;
      "
    >

      <span
        style="
          color:${color};
          font-weight:700;
        "
      >
        ${escapeHtml(source.name)}
      </span>

      <span style="opacity:.5;">
        ${escapeHtml(source.jurisdiction)}
      </span>

      <span
        class="dash-source-status"
        style="
          opacity:.5;
          font-size:.82em;
        "
      >
        Loading…
      </span>

      <button
        type="button"
        class="dash-source-retry"
        data-source="${escapeHtml(source.name)}"
        style="
          margin-left:auto;
          border:1px solid ${color};
          color:${color};
          background:transparent;
          border-radius:999px;
          padding:3px 9px;
          cursor:pointer;
          font-size:.78em;
        "
      >
        ↻ Retry
      </button>

    </div>

    <div
      class="dash-source-items"
    ></div>
  `;


  return block;
}


// ============================================================
// BUILD
// ============================================================

function buildDashboard() {

  const list =
    document.getElementById(
      "dash-feed-list"
    );


  if (!list) return;


  list.innerHTML = "";


  const fragment =
    document.createDocumentFragment();


  SOURCES.forEach(
    source => {

      fragment.appendChild(
        createSourceBlock(
          source
        )
      );
    }
  );


  list.appendChild(
    fragment
  );
}


// ============================================================
// RENDER SOURCE
// ============================================================

function renderSource(
  source,
  items,
  statusText
) {

  const block =
    [...document.querySelectorAll(
      ".dash-source-block"
    )]
      .find(
        x =>
          x.dataset.source ===
          source.name
      );


  if (!block) return;


  const container =
    block.querySelector(
      ".dash-source-items"
    );


  const status =
    block.querySelector(
      ".dash-source-status"
    );


  if (!container) return;


  container.innerHTML = "";


  if (!items.length) {

    if (status) {
      status.textContent =
        statusText ||
        "Temporarily unavailable";
    }

    return;
  }


  const fragment =
    document.createDocumentFragment();


  items.forEach(
    item => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "dash-row";


      row.innerHTML = `

        <a
          class="dash-title"
          href="${escapeHtml(item.link)}"
          target="_blank"
          rel="noopener"
        >
          ${escapeHtml(item.title)}
        </a>

        <div class="dash-meta">

          <span class="dash-source">

            <span
              style="
                color:${sourceColor(item.source)};
                font-weight:700;
              "
            >
              ${escapeHtml(item.source)}
            </span>

            <span style="opacity:.5;">
              · ${escapeHtml(item.jurisdiction)}
            </span>

          </span>

          <span class="dash-time">
            ${formatDate(item.date)}
          </span>

        </div>
      `;


      fragment.appendChild(
        row
      );
    }
  );


  container.appendChild(
    fragment
  );


  if (status) {

    status.textContent =
      statusText ||
      `${items.length} updates`;
  }
}


// ============================================================
// STATE
// ============================================================

function rebuildAllItems() {

  const items = [];


  SOURCES.forEach(
    source => {

      const sourceItems =
        lastSuccessfulItems[
          source.name
        ];


      if (
        Array.isArray(sourceItems)
      ) {

        items.push(
          ...sourceItems
        );
      }
    }
  );


  items.sort(
    (a,b) => {

      const at =
        a.date instanceof Date
          ? a.date.getTime()
          : 0;

      const bt =
        b.date instanceof Date
          ? b.date.getTime()
          : 0;

      return bt - at;
    }
  );


  return items;
}


// ============================================================
// HOME PREVIEW
// ============================================================

function renderHomePreview() {

  const el =
    document.getElementById(
      "home-dashboard-preview"
    );


  if (!el) return;


  const items =
    rebuildAllItems();


  if (!items.length) {

    el.innerHTML =
      `<div class="dash-empty">
        Loading live updates…
      </div>`;

    return;
  }


  el.innerHTML =
    items
      .slice(0,5)
      .map(
        item =>
          `
          <div class="dash-row">

            <a
              class="dash-title"
              href="${escapeHtml(item.link)}"
              target="_blank"
              rel="noopener"
            >
              ${escapeHtml(item.title)}
            </a>

            <div class="dash-meta">

              <span class="dash-source">

                <span
                  style="
                    color:${sourceColor(item.source)};
                    font-weight:700;
                  "
                >
                  ${escapeHtml(item.source)}
                </span>

                <span style="opacity:.5;">
                  · ${escapeHtml(item.jurisdiction)}
                </span>

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

function makeFilterButton(
  label,
  color,
  active
) {

  const b =
    document.createElement(
      "button"
    );


  b.type = "button";

  b.className =
    "dash-live-filter";


  b.textContent =
    label;


  b.style.cssText = `
    border:1px solid ${color};
    color:${active ? "#fff" : color};
    background:${active ? color : "transparent"};
    border-radius:999px;
    padding:5px 11px;
    cursor:pointer;
    font-size:.78em;
  `;


  return b;
}


function createFilterUI() {

  const list =
    document.getElementById(
      "dash-feed-list"
    );


  if (!list) return;


  const old =
    document.getElementById(
      "dash-live-filters"
    );


  if (old) {
    old.remove();
  }


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.id =
    "dash-live-filters";


  wrapper.style.cssText = `
    margin-bottom:18px;
    display:flex;
    flex-direction:column;
    gap:8px;
  `;


  // ----------------------------------------------------------
  // JURISDICTION
  // ----------------------------------------------------------

  const jRow =
    document.createElement(
      "div"
    );


  jRow.style.cssText = `
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    align-items:center;
  `;


  const jLabel =
    document.createElement(
      "span"
    );


  jLabel.textContent =
    "Jurisdiction";


  jLabel.style.cssText = `
    font-size:.78em;
    opacity:.5;
    margin-right:3px;
  `;


  jRow.appendChild(jLabel);


  const jurisdictions =
    [
      ...new Set(
        SOURCES.map(
          s =>
            s.jurisdiction
        )
      )
    ];


  const allJ =
    makeFilterButton(
      "All",
      "#64748b",
      activeJurisdiction ===
        "all"
    );


  allJ.dataset.jurisdiction =
    "all";


  jRow.appendChild(allJ);


  jurisdictions.forEach(
    jurisdiction => {

      const s =
        SOURCES.find(
          x =>
            x.jurisdiction ===
            jurisdiction
        );


      const b =
        makeFilterButton(
          jurisdiction,
          sourceColor(s?.name),
          activeJurisdiction ===
            jurisdiction
        );


      b.dataset.jurisdiction =
        jurisdiction;


      jRow.appendChild(b);
    }
  );


  // ----------------------------------------------------------
  // CATEGORY
  // ----------------------------------------------------------

  const cRow =
    document.createElement(
      "div"
    );


  cRow.style.cssText = `
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    align-items:center;
  `;


  const cLabel =
    document.createElement(
      "span"
    );


  cLabel.textContent =
    "Category";


  cLabel.style.cssText = `
    font-size:.78em;
    opacity:.5;
    margin-right:3px;
  `;


  cRow.appendChild(cLabel);


  CATEGORIES.forEach(
    category => {

      const b =
        makeFilterButton(
          category.label,
          "#64748b",
          activeCategory ===
            category.key
        );


      b.dataset.category =
        category.key;


      cRow.appendChild(b);
    }
  );


  wrapper.appendChild(
    jRow
  );

  wrapper.appendChild(
    cRow
  );


  list.parentNode.insertBefore(
    wrapper,
    list
  );


  wrapper.addEventListener(
    "click",
    event => {

      const j =
        event.target.closest(
          "[data-jurisdiction]"
        );


      if (j) {

        activeJurisdiction =
          j.dataset.jurisdiction;

        updateFilters();

        return;
      }


      const c =
        event.target.closest(
          "[data-category]"
        );


      if (c) {

        activeCategory =
          c.dataset.category;

        updateFilters();
      }
    }
  );
}


function updateFilters() {

  document
    .querySelectorAll(
      ".dash-live-filter"
    )
    .forEach(
      b => {

        const jurisdiction =
          b.dataset.jurisdiction;

        const category =
          b.dataset.category;


        const isActive =
          jurisdiction !==
            undefined
            ? jurisdiction ===
              activeJurisdiction
            : category ===
              activeCategory;


        const color =
          b.style.borderColor;


        b.style.background =
          isActive
            ? color
            : "transparent";


        b.style.color =
          isActive
            ? "#fff"
            : color;
      }
    );


  document
    .querySelectorAll(
      ".dash-source-block"
    )
    .forEach(
      block => {

        const category =
          block.dataset.category;

        const jurisdiction =
          block.dataset.jurisdiction;


        block.style.display =
          (
            (
              activeCategory === "all" ||
              activeCategory === category
            ) &&
            (
              activeJurisdiction === "all" ||
              activeJurisdiction === jurisdiction
            )
          )
          ? ""
          : "none";
      }
    );
}


// ============================================================
// RETRY
// ============================================================

async function retrySource(
  source
) {

  const block =
    [...document.querySelectorAll(
      ".dash-source-block"
    )]
      .find(
        x =>
          x.dataset.source ===
          source.name
      );


  if (!block) return;


  const button =
    block.querySelector(
      ".dash-source-retry"
    );

  const status =
    block.querySelector(
      ".dash-source-status"
    );


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "↻ Retrying…";

    button.style.opacity =
      ".55";
  }


  if (status) {
    status.textContent =
      "Trying feed…";
  }


  const items =
    await fetchSource(
      source
    );


  if (items.length) {

    lastSuccessfulItems[
      source.name
    ] = items;


    renderSource(
      source,
      items,
      `${items.length} updates`
    );

  } else {

    const old =
      lastSuccessfulItems[
        source.name
      ];


    if (
      old &&
      old.length
    ) {

      renderSource(
        source,
        old,
        "Retry failed · previous results retained"
      );

    } else {

      renderSource(
        source,
        [],
        "Temporarily unavailable"
      );
    }
  }


  renderHomePreview();

  updateFilters();


  if (button) {

    button.disabled =
      false;

    button.textContent =
      "↻ Retry";

    button.style.opacity =
      "1";
  }
}


function setupRetry() {

  const list =
    document.getElementById(
      "dash-feed-list"
    );


  if (!list) return;


  list.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          ".dash-source-retry"
        );


      if (!button) return;


      const source =
        SOURCES.find(
          s =>
            s.name ===
            button.dataset.source
        );


      if (source) {
        retrySource(source);
      }
    }
  );
}


// ============================================================
// PROGRESSIVE LOAD
// ============================================================

async function loadAll() {

  if (loading) return;

  loading = true;


  const status =
    document.getElementById(
      "dash-status-text"
    );

  const dot =
    document.getElementById(
      "dash-dot"
    );


  if (dot) {
    dot.classList.remove("live");
  }


  let completed = 0;


  if (status) {

    status.textContent =
      `Loading · 0/${SOURCES.length} regulators`;
  }


  SOURCES.forEach(
    async source => {

      const items =
        await fetchSource(
          source
        );


      if (items.length) {

        lastSuccessfulItems[
          source.name
        ] = items;


        renderSource(
          source,
          items,
          `${items.length} updates`
        );

      } else {

        const old =
          lastSuccessfulItems[
            source.name
          ];


        if (
          old &&
          old.length
        ) {

          renderSource(
            source,
            old,
            "Refresh unavailable · previous results retained"
          );

        } else {

          renderSource(
            source,
            [],
            "Temporarily unavailable"
          );
        }
      }


      renderHomePreview();


      completed++;


      if (status) {

        const working =
          SOURCES.filter(
            s =>
              Array.isArray(
                lastSuccessfulItems[
                  s.name
                ]
              ) &&
              lastSuccessfulItems[
                s.name
              ].length
          ).length;


        status.textContent =
          `Loading · ${completed}/${SOURCES.length} regulators · ${working} available`;
      }


      if (
        completed ===
        SOURCES.length
      ) {

        finishLoad(
          status,
          dot
        );
      }
    }
  );
}


// ============================================================
// FINISH
// ============================================================

function finishLoad(
  status,
  dot
) {

  const items =
    rebuildAllItems();


  renderHomePreview();

  updateFilters();


  const working =
    SOURCES.filter(
      s =>
        Array.isArray(
          lastSuccessfulItems[
            s.name
          ]
        ) &&
        lastSuccessfulItems[
          s.name
        ].length
    ).length;


  const now =
    new Date().toLocaleTimeString(
      "en-IN",
      {
        hour:"2-digit",
        minute:"2-digit"
      }
    );


  if (status) {

    status.textContent =
      `Last updated ${now} · ` +
      `${items.length} updates from ` +
      `${working}/${SOURCES.length} sources`;
  }


  if (dot) {
    dot.classList.add("live");
  }


  const note =
    document.getElementById(
      "dash-error-note"
    );


  if (note) {

    const failed =
      SOURCES.length -
      working;


    if (failed) {

      note.style.display =
        "block";


      note.textContent =
        `${failed} source${
          failed === 1 ? "" : "s"
        } unavailable — existing results retained. ` +
        `Use its ↻ Retry button if needed.`;

    } else {

      note.style.display =
        "none";
    }
  }


  loading = false;
}


// ============================================================
// START
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    buildDashboard();

    createFilterUI();

    setupRetry();

    loadAll();


    setInterval(
      loadAll,
      REFRESH_MINUTES *
      60 *
      1000
    );
  }
);

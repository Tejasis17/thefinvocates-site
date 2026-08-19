// ============================================================
// THE FINVOCATES — Regulatory Dashboard
// Live • Progressive • Lightweight
// ============================================================

const REFRESH_MINUTES = 15;


// ============================================================
// SOURCES
// ============================================================

const SOURCES = [

  {
    name: "RBI",
    fullName: "Reserve Bank of India",
    jurisdiction: "India",
    category: "central-banks",

    feeds: [
      "https://www.rbi.org.in/pressreleases_rss.xml",
      "https://rbi.org.in/notifications_rss.xml"
    ]
  },

  {
    name: "FCA",
    fullName: "Financial Conduct Authority",
    jurisdiction: "UK",
    category: "conduct-markets",

    feeds: [
      "https://www.fca.org.uk/news/rss.xml"
    ]
  },

  {
    name: "BoE",
    fullName: "Bank of England",
    jurisdiction: "UK",
    category: "central-banks",

    feeds: [
      "https://www.bankofengland.co.uk/rss/news"
    ]
  },

  {
    name: "PRA",
    fullName: "Prudential Regulation Authority",
    jurisdiction: "UK",
    category: "central-banks",

    feeds: [
      "https://www.bankofengland.co.uk/rss/prudential-regulation",
      "https://www.bankofengland.co.uk/rss/news"
    ]
  },

  {
    name: "BIS/BCBS",
    fullName: "Bank for International Settlements / Basel Committee on Banking Supervision",
    jurisdiction: "Global",
    category: "standard-setters",

    feeds: [
      "https://www.bis.org/doclist/all_pressrels.rss"
    ]
  },

  {
    name: "FSB",
    fullName: "Financial Stability Board",
    jurisdiction: "Global",
    category: "standard-setters",

    feeds: [
      "https://www.fsb.org/feed/"
    ]
  },

  {
    name: "ECB",
    fullName: "European Central Bank",
    jurisdiction: "Eurozone",
    category: "central-banks",

    feeds: [
      "https://www.ecb.europa.eu/rss/press.xml"
    ]
  },

  {
    name: "EBA",
    fullName: "European Banking Authority",
    jurisdiction: "EU",
    category: "conduct-markets",

    feeds: [
      "https://www.eba.europa.eu/news-press/news/rss.xml"
    ]
  },

  {
    name: "Federal Reserve",
    fullName: "Board of Governors of the Federal Reserve System",
    jurisdiction: "US",
    category: "central-banks",

    feeds: [
      "https://www.federalreserve.gov/feeds/press_all.xml"
    ]
  },

{
  name: "CFPB",
  fullName: "Consumer Financial Protection Bureau",
  jurisdiction: "US",
  category: "us-agencies",

  feeds: [
    "https://www.consumerfinance.gov/about-us/newsroom/feed/"
  ],

  fallbackPage:
    "https://www.consumerfinance.gov/about-us/newsroom/"
},

  {
    name: "FINRA",
    fullName: "Financial Industry Regulatory Authority",
    jurisdiction: "US",
    category: "us-agencies",

    feeds: [
      "http://feeds.finra.org/FINRANews",
      "https://feeds.finra.org/FINRANews"
    ]
  },

  {
    name: "OCC",
    fullName: "Office of the Comptroller of the Currency",
    jurisdiction: "US",
    category: "us-agencies",

    feeds: [
      "https://www.occ.gov/rss/occ_news.xml"
    ],

    fallbackPage:
      "https://www.occ.gov/rss/index-rss.html"
  },

  // HKMA deliberately returned to the RSS feed that
  // was working before the API change.
  {
    name: "HKMA",
    fullName: "Hong Kong Monetary Authority",
    jurisdiction: "Hong Kong",
    category: "central-banks",

    feeds: [
      "https://www.hkma.gov.hk/eng/other-information/rss/rss_press-release.xml"
    ]
  },

  {
    name: "BOJ",
    fullName: "Bank of Japan",
    jurisdiction: "Japan",
    category: "central-banks",

    feeds: [
      "https://www.boj.or.jp/en/rss/whatsnew.xml"
    ]
  },

  {
    name: "FINMA",
    fullName: "Swiss Financial Market Supervisory Authority",
    jurisdiction: "Switzerland",
    category: "conduct-markets",

    feeds: [
      "https://www.finma.ch/fr/rss/news/",
      "https://www.finma.ch/fr/rss/sanktionen/"
    ],

    fallbackPage:
      "https://www.finma.ch/fr/rss/"
  },

  {
    name: "SNB",
    fullName: "Swiss National Bank",
    jurisdiction: "Switzerland",
    category: "central-banks",

    feeds: [
      "https://www.snb.ch/public/rss/en/news"
    ],

    fallbackPage:
      "https://www.snb.ch/en/news-publications/news"
  },

  {
    name: "BaFin",
    fullName: "Federal Financial Supervisory Authority",
    jurisdiction: "Germany",
    category: "conduct-markets",

    feeds: [
      "https://www.bafin.de/EN/service/rss/_function/rssnewsfeed.xml?nn=187494"
    ],

    fallbackPage:
      "https://www.bafin.de/EN/service/rss/rss_node_en.html"
  },

  {
    name: "Bank of Canada",
    fullName: "Bank of Canada",
    jurisdiction: "Canada",
    category: "central-banks",

    feeds: [
      "https://www.bankofcanada.ca/feed/"
    ],

    fallbackPage:
      "https://www.bankofcanada.ca/rss-feeds/"
  },

  {
    name: "RBA",
    fullName: "Reserve Bank of Australia",
    jurisdiction: "Australia",
    category: "central-banks",

    feeds: [
      "https://www.rba.gov.au/rss/rss-cb-media-releases.xml"
    ],

    fallbackPage:
      "https://www.rba.gov.au/media-releases/index.html"
  },

  {
    name: "Central Bank of Ireland",
    fullName: "Central Bank of Ireland",
    jurisdiction: "Ireland",
    category: "central-banks",

    feeds: [
      "https://www.centralbank.ie/feeds/news-media-feed"
    ],

    fallbackPage:
      "https://www.centralbank.ie/news-media"
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
  "Central Bank of Ireland": "#059669"
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
// FCA DATE
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
// NORMALISE ITEM
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

  const document =
    new DOMParser()
      .parseFromString(
        xml,
        "text/xml"
      );

  const nodes = [
    ...document.querySelectorAll("item"),
    ...document.querySelectorAll("entry")
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
          ?.trim() ||
        "Untitled update";

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

      return normaliseItem(
        {
          title,
          link,
          pubDate: date
        },
        source
      );
    });
}


// ============================================================
// RSS DISCOVERY
// ============================================================

async function discoverFeedFromPage(source) {

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
      return [];
    }

    const html =
      await response.text();

    const document =
      new DOMParser()
        .parseFromString(
          html,
          "text/html"
        );

    const links =
      [
        ...document.querySelectorAll(
          "a[href]"
        )
      ];

    const candidates =
      links.filter(
        link => {

          const text =
            (
              link.textContent ||
              ""
            ).toLowerCase();

          const href =
            (
              link.getAttribute("href") ||
              ""
            ).toLowerCase();

          return (
            text.includes("rss") ||
            text.includes("feed") ||
            href.includes("rss") ||
            href.includes("feed")
          );
        }
      );


    for (
      const link of candidates
    ) {

      let href =
        link.getAttribute(
          "href"
        );

      if (!href) continue;


      try {

        href =
          new URL(
            href,
            source.fallbackPage
          ).href;

      } catch (_) {

        continue;
      }


      if (
        href ===
        source.fallbackPage
      ) {

        continue;
      }


      try {

        const items =
          await tryRawXml(
            source,
            href
          );

        if (items.length) {
          return items;
        }

      } catch (_) {}
    }

  } catch (err) {

    console.warn(
      `${source.name}: RSS discovery failed`,
      err.message
    );
  }

  return [];
}


// ============================================================
// HKMA
// ============================================================
//
// RESTORED TO THE VERSION THAT WAS WORKING.
// ============================================================

// No special HKMA API adapter here.
// HKMA uses its normal RSS path above.


// ============================================================
// SOURCE FETCHER
// ============================================================

async function fetchSource(source) {

  // ----------------------------------------------------------
  // Multiple feeds — RBI / FINMA / etc.
  // ----------------------------------------------------------

  if (
    Array.isArray(source.feeds) &&
    source.feeds.length
  ) {

    const merged = [];


    for (
      const feed of source.feeds
    ) {

      try {

        const items =
          await tryRss2Json(
            source,
            feed
          );

        merged.push(
          ...items
        );

        continue;

      } catch (_) {}


      try {

        const items =
          await tryRawXml(
            source,
            feed
          );

        merged.push(
          ...items
        );

      } catch (_) {}
    }


    if (merged.length) {

      const unique = [];


      merged.forEach(
        item => {

          if (
            !unique.some(
              x =>
                x.link ===
                item.link
            )
          ) {

            unique.push(item);
          }
        }
      );


      unique.sort(
        (a, b) => {

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


      return unique.slice(0, 8);
    }
  }


  // ----------------------------------------------------------
  // Single feed.
  // ----------------------------------------------------------

  if (source.feed) {

    try {

      return await tryRss2Json(
        source,
        source.feed
      );

    } catch (_) {}


    try {

      return await tryRawXml(
        source,
        source.feed
      );

    } catch (_) {}
  }


  // ----------------------------------------------------------
  // Official-page RSS discovery.
  // ----------------------------------------------------------

  const discovered =
    await discoverFeedFromPage(
      source
    );


  if (
    discovered.length
  ) {

    return discovered;
  }


  return [];
}


// ============================================================
// FULL NAME TOOLTIP
// ============================================================

function fullNameTooltip(source) {

  const color =
    sourceColor(
      source.name
    );


  return `
    <span
      class="regulator-name-wrap"
      style="
        position:relative;
        display:inline-flex;
        align-items:center;
      "
    >

      <span
        class="regulator-name"
        style="
          color:${color};
          font-weight:700;
          cursor:help;
        "
      >
        ${escapeHtml(source.name)}
      </span>

      <span
        class="regulator-tooltip"
        style="
          display:none;
          position:absolute;
          left:0;
          top:calc(100% + 8px);
          z-index:1000;
          white-space:nowrap;
          background:rgba(255,255,255,.94);
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
          border:1px solid ${color};
          color:${color};
          border-radius:999px;
          padding:6px 11px;
          font-size:12px;
          line-height:1.2;
          font-weight:600;
          box-shadow:0 8px 22px rgba(0,0,0,.08);
          pointer-events:none;
        "
      >
        ${escapeHtml(source.fullName)}
      </span>

    </span>
  `;
}


// ============================================================
// TOOLTIP CSS
// ============================================================

(function installTooltipCSS() {

  if (
    document.getElementById(
      "regulator-tooltip-css"
    )
  ) {
    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "regulator-tooltip-css";


  style.textContent = `

    .regulator-name-wrap:hover
    .regulator-tooltip {
      display:block !important;
    }

  `;


  document.head.appendChild(
    style
  );

})();


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

      ${fullNameTooltip(source)}

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
// BUILD DASHBOARD
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
    [
      ...document.querySelectorAll(
        ".dash-source-block"
      )
    ]
      .find(
        node =>
          node.dataset.source ===
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


      const itemSource =
        SOURCES.find(
          s =>
            s.name ===
            item.source
        );


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

            ${fullNameTooltip(
              itemSource || {
                name:item.source,
                fullName:item.source
              }
            )}

            <span style="opacity:.5;">
              · ${escapeHtml(
                item.jurisdiction
              )}
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
// MASTER STATE
// ============================================================

function rebuildAllItems() {

  const merged = [];


  SOURCES.forEach(
    source => {

      const items =
        lastSuccessfulItems[
          source.name
        ];


      if (
        Array.isArray(items)
      ) {

        merged.push(
          ...items
        );
      }
    }
  );


  merged.sort(
    (a, b) => {

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


  return merged;
}


// ============================================================
// HOMEPAGE PREVIEW
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
      `
      <div class="dash-empty">
        Loading live updates…
      </div>
      `;

    return;
  }


  el.innerHTML =
    items
      .slice(0, 5)
      .map(
        item => {

          const source =
            SOURCES.find(
              s =>
                s.name ===
                item.source
            );


          return `
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

                  ${
                    fullNameTooltip(
                      source || {
                        name:item.source,
                        fullName:item.source
                      }
                    )
                  }

                  <span style="opacity:.5;">
                    · ${escapeHtml(
                      item.jurisdiction
                    )}
                  </span>

                </span>

                <span class="dash-time">
                  ${formatDate(item.date)}
                </span>

              </div>

            </div>
          `;
        }
      )
      .join("");
}


// ============================================================
// FILTER BUTTON
// ============================================================

function makeFilterButton(
  label,
  color,
  active
) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "dash-live-filter";


  button.textContent =
    label;


  button.style.cssText = `
    border:1px solid ${color};
    color:${active ? "#fff" : color};
    background:${active ? color : "transparent"};
    border-radius:999px;
    padding:5px 11px;
    cursor:pointer;
    font-size:.78em;
  `;


  return button;
}


// ============================================================
// FILTER UI
// ============================================================

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


  // Jurisdictions
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


  jRow.appendChild(
    jLabel
  );


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


  jRow.appendChild(
    allJ
  );


  jurisdictions.forEach(
    jurisdiction => {

      const source =
        SOURCES.find(
          s =>
            s.jurisdiction ===
            jurisdiction
        );


      const b =
        makeFilterButton(
          jurisdiction,
          sourceColor(
            source?.name
          ),
          activeJurisdiction ===
            jurisdiction
        );


      b.dataset.jurisdiction =
        jurisdiction;


      jRow.appendChild(
        b
      );
    }
  );


  // Categories
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


  cRow.appendChild(
    cLabel
  );


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


      cRow.appendChild(
        b
      );
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


// ============================================================
// FILTER APPLICATION
// ============================================================

function updateFilters() {

  document
    .querySelectorAll(
      ".dash-live-filter"
    )
    .forEach(
      button => {

        const jurisdiction =
          button.dataset.jurisdiction;

        const category =
          button.dataset.category;


        const active =
          jurisdiction !== undefined
            ? jurisdiction ===
              activeJurisdiction
            : category ===
              activeCategory;


        const color =
          button.style.borderColor;


        button.style.background =
          active
            ? color
            : "transparent";


        button.style.color =
          active
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


        const visible =
          (
            activeCategory ===
              "all" ||
            activeCategory ===
              category
          ) &&
          (
            activeJurisdiction ===
              "all" ||
            activeJurisdiction ===
              jurisdiction
          );


        block.style.display =
          visible ? "" : "none";
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
    [
      ...document.querySelectorAll(
        ".dash-source-block"
      )
    ]
      .find(
        b =>
          b.dataset.source ===
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

    const previous =
      lastSuccessfulItems[
        source.name
      ];


    if (
      previous &&
      previous.length
    ) {

      renderSource(
        source,
        previous,
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


// ============================================================
// RETRY EVENT
// ============================================================

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


      if (!button) {
        return;
      }


      const source =
        SOURCES.find(
          s =>
            s.name ===
            button.dataset.source
        );


      if (source) {

        retrySource(
          source
        );
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

    dot.classList.remove(
      "live"
    );
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

        const previous =
          lastSuccessfulItems[
            source.name
          ];


        if (
          previous &&
          previous.length
        ) {

          renderSource(
            source,
            previous,
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
              ].length > 0
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
      source =>
        Array.isArray(
          lastSuccessfulItems[
            source.name
          ]
        ) &&
        lastSuccessfulItems[
          source.name
        ].length > 0
    ).length;


  const now =
    new Date().toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
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


    if (failed > 0) {

      note.style.display =
        "block";


      note.textContent =
        `${failed} source${
          failed === 1
            ? ""
            : "s"
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
// ============================================================
// LIVE STATUS SYNC
// Keeps the top counter + bottom warning synchronized with
// the actual regulator blocks currently rendered.
// ============================================================

(function installLiveStatusSync() {

  function syncStatus() {

    const feed =
      document.getElementById(
        "dash-feed-list"
      );

    if (!feed) return;


    const blocks =
      [
        ...feed.querySelectorAll(
          ".dash-source-block"
        )
      ];


    if (!blocks.length) return;


    // A source is considered available only when it has
    // actually rendered one or more items.
    const available =
      blocks.filter(
        block =>
          block.querySelector(
            ".dash-source-items"
          )?.children.length > 0
      ).length;


    const total =
      blocks.length;


    // --------------------------------------------------------
    // TOP STATUS
    // --------------------------------------------------------

    const status =
      document.getElementById(
        "dash-status-text"
      );


    if (status) {

      if (available < total) {

        status.textContent =
          `Loading · ${available}/${total} regulators · ${available} available`;

      } else {

        const now =
          new Date().toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit"
            }
          );


        const updates =
          feed.querySelectorAll(
            ".dash-row"
          ).length;


        status.textContent =
          `Last updated ${now} · ` +
          `${updates} updates from ` +
          `${available}/${total} sources`;
      }
    }


    // --------------------------------------------------------
    // BOTTOM WARNING
    // --------------------------------------------------------

    const note =
      document.getElementById(
        "dash-error-note"
      );


    if (!note) return;


    const missing =
      total - available;


    if (missing === 0) {

      note.style.display =
        "none";

      return;
    }


    note.style.display =
      "block";


    note.textContent =
      `${missing} source` +
      (
        missing === 1
          ? ""
          : "s"
      ) +
      ` unavailable — existing results retained. ` +
      `Use its ↻ Retry button if needed.`;
  }


  // Run once immediately.
  syncStatus();


  // Watch the actual dashboard DOM.
  const feed =
    document.getElementById(
      "dash-feed-list"
    );


  if (!feed) return;


  const observer =
    new MutationObserver(
      () => syncStatus()
    );


  observer.observe(
    feed,
    {
      childList: true,
      subtree: true
    }
  );


  // Small periodic safety check.
  setInterval(
    syncStatus,
    1000
  );

})();

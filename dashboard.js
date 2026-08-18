// ============================================================
// THE FINVOCATES — regulatory dashboard
// Lightweight progressive RSS dashboard
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
  { name: "RBNZ", jurisdiction: "New Zealand", category: "central-banks", feed: "https://www.rbnz.govt.nz/-/media/rss/news" }
];


// ============================================================
// CATEGORY FILTERS
// ============================================================

const FILTERS = [
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
  "Central Bank of Ireland": "#059669",
  "RBNZ": "#0284c7"
};


// ============================================================
// STATE
// ============================================================

let allItems = [];

let activeCategory =
  "all";

let activeJurisdiction =
  "all";

let loading = false;


// Last successful results survive failed refreshes.
const lastSuccessfulItems = {};


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

  if (!value) return null;

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

      const d =
        new Date(
          Number(match[3]),
          Number(match[2]) - 1,
          Number(match[1])
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

    if (!field) continue;

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
// FCA PAGE DATE FALLBACK
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
      !Array.isArray(data.items) ||
      data.items.length === 0
    ) {

      throw new Error(
        `${source.name}: empty feed`
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
                source.category
            };
          }
        );


    // FCA fallback.
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
        }
      }
    }


    return items;

  } catch (err) {

    console.warn(
      `Attempt ${attempt} failed for ${source.name}:`,
      err.message
    );


    if (
      attempt < 3
    ) {

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            1000 * attempt
          )
      );


      return fetchSource(
        source,
        attempt + 1
      );
    }


    return [];
  }
}


// ============================================================
// SOURCE LABEL
// ============================================================

function sourceLabel(
  source
) {

  const color =
    REGULATOR_COLORS[
      source.name
    ] || "#64748b";


  return `
    <span
      style="
        color:${color};
        font-weight:700;
      "
    >${source.name}</span>

    <span
      style="opacity:.5;"
    >
      · ${source.jurisdiction}
    </span>
  `;
}


// ============================================================
// CREATE ITEM ROW
// ============================================================

function createRow(
  item
) {

  const row =
    document.createElement(
      "div"
    );


  row.className =
    "dash-row";


  row.innerHTML = `

    <a
      class="dash-title"
      href="${item.link}"
      target="_blank"
      rel="noopener"
    >
      ${item.title}
    </a>

    <div class="dash-meta">

      <span class="dash-source">
        ${sourceLabel({
          name: item.source,
          jurisdiction: item.jurisdiction
        })}
      </span>

      <span class="dash-time">
        ${formatDate(item.date)}
      </span>

    </div>
  `;


  return row;
}


// ============================================================
// SOURCE CONTAINER
// ============================================================

function createSourceContainer(
  source
) {

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "dash-source-block";


  wrapper.dataset.source =
    source.name;


  wrapper.dataset.category =
    source.category;


  wrapper.dataset.jurisdiction =
    source.jurisdiction;


  const color =
    REGULATOR_COLORS[
      source.name
    ] || "#64748b";


  wrapper.innerHTML = `

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
        ${source.name}
      </span>

      <span
        style="opacity:.5;"
      >
        ${source.jurisdiction}
      </span>

      <span
        class="dash-source-status"
        style="
          opacity:.5;
          font-size:.85em;
        "
      >
        Loading…
      </span>

      <button
        class="dash-source-retry"
        type="button"
        data-source="${source.name}"
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


  return wrapper;
}


// ============================================================
// BUILD 21 PERMANENT SOURCE CONTAINERS
// ============================================================

function buildSourceContainers() {

  const list =
    document.getElementById(
      "dash-feed-list"
    );


  if (!list) {
    return;
  }


  list.innerHTML = "";


  const fragment =
    document.createDocumentFragment();


  SOURCES.forEach(
    source => {

      fragment.appendChild(
        createSourceContainer(
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
// RENDER ONE SOURCE
// ============================================================

function renderSourceResult(
  source,
  items,
  statusText
) {

  const blocks =
    document.querySelectorAll(
      ".dash-source-block"
    );


  let block = null;


  blocks.forEach(
    candidate => {

      if (
        candidate.dataset.source ===
        source.name
      ) {
        block = candidate;
      }
    }
  );


  if (!block) {
    return;
  }


  const itemContainer =
    block.querySelector(
      ".dash-source-items"
    );


  const status =
    block.querySelector(
      ".dash-source-status"
    );


  if (!itemContainer) {
    return;
  }


  // Only replace the contents of THIS regulator.
  itemContainer.innerHTML = "";


  if (
    items.length === 0
  ) {

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

      fragment.appendChild(
        createRow(item)
      );
    }
  );


  itemContainer.appendChild(
    fragment
  );


  if (status) {

    status.textContent =
      `${items.length} updates`;
  }
}


// ============================================================
// JURISDICTIONS
// ============================================================

function getJurisdictions() {

  return [
    ...new Set(
      SOURCES.map(
        source =>
          source.jurisdiction
      )
    )
  ];
}


// ============================================================
// JURISDICTION COLOUR
//
// For jurisdictions with multiple regulators, use the first
// regulator's established colour. No new colour scheme is
// introduced.
// ============================================================

function jurisdictionColor(
  jurisdiction
) {

  const source =
    SOURCES.find(
      s =>
        s.jurisdiction ===
        jurisdiction
    );


  return source
    ? (
        REGULATOR_COLORS[
          source.name
        ] || "#64748b"
      )
    : "#64748b";
}


// ============================================================
// JURISDICTION FILTER BAR
// ============================================================

function setupJurisdictionFilters() {

  const bar =
    document.getElementById(
      "dash-jurisdictions"
    );


  if (!bar) {
    return;
  }


  const jurisdictions =
    getJurisdictions();


  bar.innerHTML = `

    <button
      class="dash-filter dash-jurisdiction-filter active"
      data-jurisdiction="all"
    >
      All Jurisdictions
    </button>

    ${
      jurisdictions
        .map(
          jurisdiction => {

            const color =
              jurisdictionColor(
                jurisdiction
              );


            return `
              <button
                class="dash-filter dash-jurisdiction-filter"
                data-jurisdiction="${jurisdiction}"
                style="
                  border-color:${color};
                  color:${color};
                "
              >
                ${jurisdiction}
              </button>
            `;
          }
        )
        .join("")
    }
  `;


  bar.addEventListener(
    "click",
    event => {

      const btn =
        event.target.closest(
          ".dash-jurisdiction-filter"
        );


      if (!btn) {
        return;
      }


      activeJurisdiction =
        btn.dataset.jurisdiction;


      bar
        .querySelectorAll(
          ".dash-jurisdiction-filter"
        )
        .forEach(
          b =>
            b.classList.toggle(
              "active",
              b === btn
            )
        );


      renderFilters();
    }
  );
}


// ============================================================
// CATEGORY FILTERS
// ============================================================

function setupCategoryFilters() {

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
          `
          <button
            class="dash-filter${
              f.key === "all"
                ? " active"
                : ""
            }"
            data-key="${f.key}"
          >
            ${f.label}
          </button>
          `
      )
      .join("");


  bar.addEventListener(
    "click",
    event => {

      const btn =
        event.target.closest(
          ".dash-filter"
        );


      if (!btn) {
        return;
      }


      activeCategory =
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


      renderFilters();
    }
  );
}


// ============================================================
// APPLY BOTH FILTERS
// ============================================================

function renderFilters() {

  const blocks =
    document.querySelectorAll(
      ".dash-source-block"
    );


  blocks.forEach(
    block => {

      const category =
        block.dataset.category;


      const jurisdiction =
        block.dataset.jurisdiction;


      const categoryMatch =
        activeCategory === "all" ||
        category === activeCategory;


      const jurisdictionMatch =
        activeJurisdiction === "all" ||
        jurisdiction ===
          activeJurisdiction;


      block.style.display =
        categoryMatch &&
        jurisdictionMatch
          ? ""
          : "none";
    }
  );
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
      `
      <div class="dash-empty">
        Loading live updates…
      </div>
      `;

    return;
  }


  const sorted =
    [...allItems]
      .sort(
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


  el.innerHTML =
    sorted
      .slice(0, limit)
      .map(
        item =>
          `
          <div class="dash-row">

            <a
              class="dash-title"
              href="${item.link}"
              target="_blank"
              rel="noopener"
            >
              ${item.title}
            </a>

            <div class="dash-meta">

              <span class="dash-source">
                ${sourceLabel({
                  name: item.source,
                  jurisdiction:
                    item.jurisdiction
                })}
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
// REBUILD ALL ITEMS FROM SUCCESSFUL SOURCE SNAPSHOTS
// ============================================================

function rebuildAllItems() {

  allItems = [];


  SOURCES.forEach(
    source => {

      const items =
        lastSuccessfulItems[
          source.name
        ];


      if (
        Array.isArray(items)
      ) {

        allItems.push(
          ...items
        );
      }
    }
  );


  allItems.sort(
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
}


// ============================================================
// RETRY ONE REGULATOR
// ============================================================

async function retrySource(
  source
) {

  const block =
    [...document.querySelectorAll(
      ".dash-source-block"
    )]
      .find(
        el =>
          el.dataset.source ===
          source.name
      );


  if (!block) {
    return;
  }


  const retryButton =
    block.querySelector(
      ".dash-source-retry"
    );


  const status =
    block.querySelector(
      ".dash-source-status"
    );


  if (retryButton) {

    retryButton.disabled =
      true;

    retryButton.textContent =
      "↻ Retrying…";

    retryButton.style.opacity =
      ".55";
  }


  if (status) {

    status.textContent =
      "Retrying…";
  }


  const items =
    await fetchSource(
      source
    );


  if (
    items.length > 0
  ) {

    lastSuccessfulItems[
      source.name
    ] = items;


    renderSourceResult(
      source,
      items,
      `${items.length} updates`
    );

  } else {

    // DO NOT delete old results.
    const old =
      lastSuccessfulItems[
        source.name
      ];


    if (
      old &&
      old.length > 0
    ) {

      renderSourceResult(
        source,
        old,
        "Retry failed · showing last results"
      );

    } else {

      renderSourceResult(
        source,
        [],
        "Temporarily unavailable"
      );
    }
  }


  rebuildAllItems();

  renderHomePreview();

  renderFilters();


  if (retryButton) {

    retryButton.disabled =
      false;

    retryButton.textContent =
      "↻ Retry";

    retryButton.style.opacity =
      "1";
  }
}


// ============================================================
// RETRY BUTTON LISTENER
// ============================================================

function setupRetryButtons() {

  const list =
    document.getElementById(
      "dash-feed-list"
    );


  if (!list) {
    return;
  }


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


      if (!source) {
        return;
      }


      retrySource(
        source
      );
    }
  );
}


// ============================================================
// GLOBAL REFRESH
//
// Existing successful data stays visible.
// Each source independently replaces ONLY its own data if
// the new fetch succeeds.
// ============================================================

async function loadAll(
  isRefresh
) {

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


  if (dot) {

    dot.classList.remove(
      "live"
    );
  }


  // On first load create the 21 slots.
  if (!isRefresh) {

    buildSourceContainers();
  }


  if (statusEl) {

    statusEl.textContent =
      `Loading · 0/${SOURCES.length} regulators`;
  }


  let completed =
    0;

  let failed =
    0;


  // ----------------------------------------------------------
  // Each feed is independent.
  // ----------------------------------------------------------

  SOURCES.forEach(
    async source => {

      const items =
        await fetchSource(
          source
        );


      if (
        items.length > 0
      ) {

        // Save last known good result.
        lastSuccessfulItems[
          source.name
        ] = items;


        // Immediately update THIS regulator.
        renderSourceResult(
          source,
          items,
          `${items.length} updates`
        );

      } else {

        failed++;


        // Keep previous successful result.
        const old =
          lastSuccessfulItems[
            source.name
          ];


        if (
          old &&
          old.length > 0
        ) {

          renderSourceResult(
            source,
            old,
            "Refresh unavailable · showing last results"
          );

        } else {

          renderSourceResult(
            source,
            [],
            "Temporarily unavailable"
          );
        }
      }


      // Rebuild master state from last known good results.
      rebuildAllItems();

      renderHomePreview();


      completed++;


      if (statusEl) {

        statusEl.textContent =
          `Loading · ${completed}/${SOURCES.length} regulators`;
      }


      // ------------------------------------------------------
      // When every request has finished.
      // ------------------------------------------------------

      if (
        completed ===
        SOURCES.length
      ) {

        finishRefresh(
          failed,
          statusEl,
          dot
        );
      }
    }
  );
}


// ============================================================
// FINISH GLOBAL REFRESH
// ============================================================

function finishRefresh(
  failed,
  statusEl,
  dot
) {

  rebuildAllItems();

  renderHomePreview();

  renderFilters();


  const now =
    new Date().toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );


  // Number of regulators with a current/last-known-good result.
  const successfulSources =
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


  if (statusEl) {

    statusEl.textContent =
      `Last updated ${now} · ` +
      `${allItems.length} updates from ` +
      `${successfulSources}/${SOURCES.length} sources`;
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
      `${failed} source${
        failed > 1
          ? "s"
          : ""
      } unavailable this refresh — ` +
      `existing results have been retained. ` +
      `Use that regulator's ↻ Retry button if needed.`;

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

    setupCategoryFilters();

    setupJurisdictionFilters();

    setupRetryButtons();

    buildSourceContainers();

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

// ============================================================
// THE FINVOCATES — Regulatory Intelligence Dashboard
// Lightweight • Progressive • Colour Coded • Per-source Retry
// ============================================================

const REFRESH_MINUTES = 15;


// ============================================================
// SOURCES
// ============================================================

const SOURCES = [
  { name:"RBI", jurisdiction:"India", category:"central-banks", feed:"https://www.rbi.org.in/pressreleases_rss.xml" },
  { name:"FCA", jurisdiction:"UK", category:"conduct-markets", feed:"https://www.fca.org.uk/news/rss.xml" },
  { name:"BoE", jurisdiction:"UK", category:"central-banks", feed:"https://www.bankofengland.co.uk/rss/news" },
  { name:"PRA", jurisdiction:"UK", category:"central-banks", feed:"https://www.bankofengland.co.uk/rss/prudential-regulation" },
  { name:"BIS/BCBS", jurisdiction:"Global", category:"standard-setters", feed:"https://www.bis.org/doclist/all_rss.xml" },
  { name:"FSB", jurisdiction:"Global", category:"standard-setters", feed:"https://www.fsb.org/feed/" },
  { name:"ECB", jurisdiction:"Eurozone", category:"central-banks", feed:"https://www.ecb.europa.eu/rss/press.xml" },
  { name:"EBA", jurisdiction:"EU", category:"conduct-markets", feed:"https://www.eba.europa.eu/news-press/news/rss.xml" },
  { name:"Federal Reserve", jurisdiction:"US", category:"central-banks", feed:"https://www.federalreserve.gov/feeds/press_all.xml" },
  { name:"CFPB", jurisdiction:"US", category:"us-agencies", feed:"https://www.consumerfinance.gov/about-us/newsroom/feed/" },
  { name:"FINRA", jurisdiction:"US", category:"us-agencies", feed:"https://feeds.finra.org/news-and-events/feed" },
  { name:"OCC", jurisdiction:"US", category:"us-agencies", feed:"https://www.occ.gov/rss/index-rss.html" },
  { name:"HKMA", jurisdiction:"Hong Kong", category:"central-banks", feed:"https://www.hkma.gov.hk/eng/rss/press-releases.xml" },
  { name:"BOJ", jurisdiction:"Japan", category:"central-banks", feed:"https://www.boj.or.jp/en/rss/whatsnew.xml" },
  { name:"FINMA", jurisdiction:"Switzerland", category:"conduct-markets", feed:"https://www.finma.ch/en/news/rss/" },
  { name:"SNB", jurisdiction:"Switzerland", category:"central-banks", feed:"https://www.snb.ch/en/services-events/digital-services/rss-calendar-feeds" },
  { name:"BaFin", jurisdiction:"Germany", category:"conduct-markets", feed:"https://www.bafin.de/SiteGlobals/Functions/RSSFeed/EN/RSSGenerator_news_en.xml" },
  { name:"Bank of Canada", jurisdiction:"Canada", category:"central-banks", feed:"https://www.bankofcanada.ca/valet/fixed_income_yield_curves/feed" },
  { name:"RBA", jurisdiction:"Australia", category:"central-banks", feed:"https://www.rba.gov.au/rss/rss-cb-media-releases.xml" },
  { name:"Central Bank of Ireland", jurisdiction:"Ireland", category:"central-banks", feed:"https://www.centralbank.ie/rss-feed" },
  { name:"RBNZ", jurisdiction:"New Zealand", category:"central-banks", feed:"https://www.rbnz.govt.nz/-/media/rss/news" }
];


// ============================================================
// COLOURS
// ============================================================

const REGULATOR_COLORS = {
  "RBI":"#8b5cf6",
  "FCA":"#2563eb",
  "BoE":"#1d4ed8",
  "PRA":"#4338ca",
  "BIS/BCBS":"#475569",
  "FSB":"#64748b",
  "ECB":"#0891b2",
  "EBA":"#0e7490",
  "Federal Reserve":"#dc2626",
  "CFPB":"#b91c1c",
  "FINRA":"#be123c",
  "OCC":"#9f1239",
  "HKMA":"#0f766e",
  "BOJ":"#db2777",
  "FINMA":"#15803d",
  "SNB":"#166534",
  "BaFin":"#ca8a04",
  "Bank of Canada":"#c2410c",
  "RBA":"#ea580c",
  "Central Bank of Ireland":"#059669",
  "RBNZ":"#0284c7"
};


// ============================================================
// CATEGORIES
// ============================================================

const CATEGORIES = [
  { key:"all", label:"All" },
  { key:"central-banks", label:"Central Banks" },
  { key:"standard-setters", label:"Global Standard-Setters" },
  { key:"conduct-markets", label:"Conduct & Markets" },
  { key:"us-agencies", label:"US Agencies" }
];


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

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}


function sourceColor(name) {

  return REGULATOR_COLORS[name] || "#64748b";
}


function proxyRss2Json(url) {

  return (
    "https://api.rss2json.com/v1/api.json?rss_url=" +
    encodeURIComponent(url)
  );
}


function proxyAllOrigins(url) {

  return (
    "https://api.allorigins.win/raw?url=" +
    encodeURIComponent(url)
  );
}


// ============================================================
// DATE
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
      day:"numeric",
      month:"short",
      year:"numeric"
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

    const text = String(field)
      .replace(/<[^>]*>/g," ")
      .replace(/\s+/g," ")
      .trim();

    const first = text.match(
      /First\s+published\s*:?\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i
    );

    if (first) {

      return new Date(
        Number(first[3]),
        Number(first[2]) - 1,
        Number(first[1])
      );
    }

    const generic = text.match(
      /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/
    );

    if (generic) {

      const d = new Date(
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
// NORMALISE RSS ITEM
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

    source:source.name,

    jurisdiction:
      source.jurisdiction,

    category:
      source.category
  };
}


// ============================================================
// PARSE RAW XML FALLBACK
// ============================================================

function parseXmlFeed(xml, source) {

  const parser =
    new DOMParser();

  const doc =
    parser.parseFromString(
      xml,
      "text/xml"
    );

  const nodes = [
    ...doc.querySelectorAll("item"),
    ...doc.querySelectorAll("entry")
  ];

  if (!nodes.length) {
    return [];
  }

  return nodes
    .slice(0,8)
    .map(node => {

      const title =
        node.querySelector("title")
          ?.textContent
          ?.trim();

      const linkNode =
        node.querySelector("link");

      let link =
        linkNode?.getAttribute("href") ||
        linkNode?.textContent?.trim() ||
        "#";

      const date =
        node.querySelector("pubDate")?.textContent ||
        node.querySelector("published")?.textContent ||
        node.querySelector("updated")?.textContent ||
        node.querySelector("date")?.textContent ||
        node.querySelector("dc\\:date")?.textContent ||
        "";

      const description =
        node.querySelector("description")?.textContent ||
        node.querySelector("summary")?.textContent ||
        "";

      return normaliseItem(
        {
          title,
          link,
          pubDate:date,
          description
        },
        source
      );
    });
}


// ============================================================
// FETCH RSS2JSON
// ============================================================

async function tryRss2Json(source) {

  const response =
    await fetch(
      proxyRss2Json(source.feed) +
      "&t=" +
      Date.now(),
      {
        cache:"no-store"
      }
    );

  if (!response.ok) {
    throw new Error(
      `rss2json HTTP ${response.status}`
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
      "rss2json returned no items"
    );
  }

  return data.items
    .slice(0,8)
    .map(
      item =>
        normaliseItem(
          item,
          source
        )
    );
}


// ============================================================
// FETCH RAW XML
// ============================================================

async function tryRawXml(source) {

  const response =
    await fetch(
      proxyAllOrigins(source.feed) +
      "&t=" +
      Date.now(),
      {
        cache:"no-store"
      }
    );

  if (!response.ok) {
    throw new Error(
      `raw proxy HTTP ${response.status}`
    );
  }

  const xml =
    await response.text();

  const items =
    parseXmlFeed(
      xml,
      source
    );

  if (!items.length) {
    throw new Error(
      "raw XML contained no items"
    );
  }

  return items;
}


// ============================================================
// FETCH ONE SOURCE
// ============================================================

async function fetchSource(source) {

  // First path: RSS2JSON
  try {

    return await tryRss2Json(
      source
    );

  } catch (firstError) {

    console.warn(
      `${source.name}: RSS2JSON failed`,
      firstError.message
    );
  }


  // Second path: raw XML through AllOrigins
  try {

    return await tryRawXml(
      source
    );

  } catch (secondError) {

    console.warn(
      `${source.name}: raw XML failed`,
      secondError.message
    );
  }


  // Third attempt: RSS2JSON once more.
  // Useful for intermittent proxy failures.
  try {

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          700
        )
    );

    return await tryRss2Json(
      source
    );

  } catch (thirdError) {

    console.warn(
      `${source.name}: final attempt failed`,
      thirdError.message
    );
  }


  return [];
}


// ============================================================
// SOURCE BLOCK
// ============================================================

function createSourceBlock(
  source
) {

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


  const color =
    sourceColor(
      source.name
    );


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

    <div class="dash-source-items"></div>
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
  status
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

  const statusEl =
    block.querySelector(
      ".dash-source-status"
    );


  if (!container) return;


  // IMPORTANT:
  // We only clear this regulator's own items.
  container.innerHTML = "";


  if (!items.length) {

    if (statusEl) {
      statusEl.textContent =
        status ||
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


  if (statusEl) {

    statusEl.textContent =
      status ||
      `${items.length} updates`;
  }
}


// ============================================================
// REBUILD MASTER ITEM LIST
// ============================================================

function rebuildItems() {

  allItems = [];


  SOURCES.forEach(
    source => {

      const items =
        lastSuccessfulItems[
          source.name
        ];


      if (
        Array.isArray(items) &&
        items.length
      ) {

        allItems.push(
          ...items
        );
      }
    }
  );


  allItems.sort(
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
}


// ============================================================
// FILTER UI
//
// CREATED ENTIRELY BY JS.
// No special HTML container required.
// ============================================================

function createFilterUI() {

  const feedList =
    document.getElementById(
      "dash-feed-list"
    );

  if (!feedList) return;


  // Remove previously created filter area.
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
    margin:0 0 18px 0;
    display:flex;
    flex-direction:column;
    gap:8px;
  `;


  // ----------------------------------------------------------
  // JURISDICTIONS
  // ----------------------------------------------------------

  const jurisdictions = [
    ...new Set(
      SOURCES.map(
        s => s.jurisdiction
      )
    )
  ];


  const jurisdictionRow =
    document.createElement(
      "div"
    );

  jurisdictionRow.style.cssText = `
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    align-items:center;
  `;


  const jurisdictionLabel =
    document.createElement(
      "span"
    );

  jurisdictionLabel.textContent =
    "Jurisdiction";

  jurisdictionLabel.style.cssText = `
    font-size:.78em;
    opacity:.5;
    margin-right:3px;
  `;


  jurisdictionRow.appendChild(
    jurisdictionLabel
  );


  const allJurisdiction =
    makeFilterButton(
      "All",
      "#64748b",
      activeJurisdiction === "all"
    );


  allJurisdiction.dataset.jurisdiction =
    "all";


  jurisdictionRow.appendChild(
    allJurisdiction
  );


  jurisdictions.forEach(
    jurisdiction => {

      const source =
        SOURCES.find(
          s =>
            s.jurisdiction ===
            jurisdiction
        );


      const color =
        sourceColor(
          source?.name
        );


      const button =
        makeFilterButton(
          jurisdiction,
          color,
          activeJurisdiction ===
            jurisdiction
        );


      button.dataset.jurisdiction =
        jurisdiction;


      jurisdictionRow.appendChild(
        button
      );
    }
  );


  // ----------------------------------------------------------
  // CATEGORY
  // ----------------------------------------------------------

  const categoryRow =
    document.createElement(
      "div"
    );

  categoryRow.style.cssText = `
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    align-items:center;
  `;


  const categoryLabel =
    document.createElement(
      "span"
    );

  categoryLabel.textContent =
    "Category";

  categoryLabel.style.cssText = `
    font-size:.78em;
    opacity:.5;
    margin-right:3px;
  `;


  categoryRow.appendChild(
    categoryLabel
  );


  CATEGORIES.forEach(
    category => {

      const button =
        makeFilterButton(
          category.label,
          "#64748b",
          activeCategory ===
            category.key
        );


      button.dataset.category =
        category.key;


      categoryRow.appendChild(
        button
      );
    }
  );


  wrapper.appendChild(
    jurisdictionRow
  );

  wrapper.appendChild(
    categoryRow
  );


  feedList.parentNode.insertBefore(
    wrapper,
    feedList
  );


  // ----------------------------------------------------------
  // EVENTS
  // ----------------------------------------------------------

  wrapper.addEventListener(
    "click",
    event => {

      const jurisdictionButton =
        event.target.closest(
          "[data-jurisdiction]"
        );


      if (jurisdictionButton) {

        activeJurisdiction =
          jurisdictionButton
            .dataset
            .jurisdiction;


        refreshFilterButtons();

        applyFilters();

        return;
      }


      const categoryButton =
        event.target.closest(
          "[data-category]"
        );


      if (categoryButton) {

        activeCategory =
          categoryButton
            .dataset
            .category;


        refreshFilterButtons();

        applyFilters();
      }
    }
  );
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

  button.textContent =
    label;


  button.className =
    "dash-live-filter";


  button.style.cssText = `
    border:1px solid ${color};
    color:${color};
    background:${
      active
        ? color
        : "transparent"
    };
    ${
      active
        ? "color:#fff;"
        : ""
    }
    border-radius:999px;
    padding:5px 11px;
    cursor:pointer;
    font-size:.78em;
    transition:all .15s ease;
  `;


  return button;
}


// ============================================================
// REFRESH FILTER BUTTON VISUALS
// ============================================================

function refreshFilterButtons() {

  document
    .querySelectorAll(
      ".dash-live-filter"
    )
    .forEach(
      button => {

        const jurisdiction =
          button.dataset
            .jurisdiction;

        const category =
          button.dataset
            .category;


        let active = false;


        if (
          jurisdiction !== undefined
        ) {

          active =
            jurisdiction ===
            activeJurisdiction;

        } else if (
          category !== undefined
        ) {

          active =
            category ===
            activeCategory;
        }


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
}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyFilters() {

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


        const categoryOK =
          activeCategory === "all" ||
          activeCategory === category;


        const jurisdictionOK =
          activeJurisdiction === "all" ||
          activeJurisdiction ===
            jurisdiction;


        block.style.display =
          categoryOK &&
          jurisdictionOK
            ? ""
            : "none";
      }
    );
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


  if (!allItems.length) {

    el.innerHTML =
      `<div class="dash-empty">
        Loading live updates…
      </div>`;

    return;
  }


  el.innerHTML =
    allItems
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
        "Retry failed · showing previous results"
      );

    } else {

      renderSource(
        source,
        [],
        "Temporarily unavailable"
      );
    }
  }


  rebuildItems();

  renderHomePreview();

  applyFilters();


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


      if (!button) return;


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


  const statusEl =
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


  if (statusEl) {

    statusEl.textContent =
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


        // IMMEDIATE DISPLAY
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
            "Refresh unavailable · showing previous results"
          );

        } else {

          renderSource(
            source,
            [],
            "Temporarily unavailable"
          );
        }
      }


      // Update global state without touching source DOM.
      rebuildItems();

      renderHomePreview();


      completed++;


      if (statusEl) {

        statusEl.textContent =
          `Loading · ${completed}/${SOURCES.length} regulators`;
      }


      if (
        completed ===
        SOURCES.length
      ) {

        finishLoad(
          statusEl,
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
  statusEl,
  dot
) {

  rebuildItems();

  renderHomePreview();

  applyFilters();


  const now =
    new Date().toLocaleTimeString(
      "en-IN",
      {
        hour:"2-digit",
        minute:"2-digit"
      }
    );


  const working =
    SOURCES.filter(
      source =>
        lastSuccessfulItems[
          source.name
        ]?.length
    ).length;


  if (statusEl) {

    statusEl.textContent =
      `Last updated ${now} · ` +
      `${allItems.length} updates from ` +
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
          failed === 1 ? "" : "s"
        } unavailable — ` +
        `existing results retained. ` +
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

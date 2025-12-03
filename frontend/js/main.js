/* js/main.js — UPDATED */

/* =========================
   CONSTANTS
========================= */
const API_BASE = "http://localhost:8080";
const PLACEHOLDER = "images/placeholder.jpg";

/* for related-home load-more */
window.__relatedAll = [];
window.__relatedIndex = 0;

/* =========================
   Helpers
========================= */
const esc = (t) =>
  String(t || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const fmtDate = (d) => {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

function slugLink(slug) {
  return `article.html?slug=${encodeURIComponent(slug)}`;
}

/* =========================
   Fetch helper
========================= */
async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const t = await res.text().catch(() => null);
    throw new Error(`HTTP ${res.status}: ${t || res.statusText}`);
  }
  return res.json();
}

/* =========================
   DOM Ready
========================= */
document.addEventListener("DOMContentLoaded", async () => {

  /* ❌ DUPLICATE with header.js → so COMMENTED */
  // setTopDate();

  initLiveBtn();
  wireFooterHelpers();

  try {
    const [latest, trending, featured, editorials] = await Promise.all([
      fetchJson(`${API_BASE}/api/public/news/latest?limit=50`),
      fetchJson(`${API_BASE}/api/public/news/trending?limit=20`),
      fetchJson(`${API_BASE}/api/public/news/featured`),
      fetchJson(`${API_BASE}/api/public/news/editorials?limit=20`),
    ]);

    window.allArticles = Array.isArray(latest) ? latest : [];
    window.trendingArticles = Array.isArray(trending) ? trending : [];
    window.featuredArticles = Array.isArray(featured) ? featured : [];
    window.editorialArticles = Array.isArray(editorials) ? editorials : [];

    renderColumns(
      window.allArticles,
      window.trendingArticles,
      window.featuredArticles,
      window.editorialArticles
    );

    initInfiniteFeed({ pageSize: 6, maxPages: 5 });
    initLazyYouTubeForInfiniteSection();
    initRelatedHomeLoadMore();
  } catch (err) {
    console.error("Failed to load initial lists:", err);
  }
});



function initLiveBtn() {
  const liveBtn = document.querySelector(".live-btn");
  if (!liveBtn) return;
  liveBtn.classList.add("blink");
  liveBtn.addEventListener("click", () => {
    window.open("https://www.youtube.com/", "_blank");
  });
}

/* =========================
   Lazy-load YouTube Sidebar
========================= */
function initLazyYouTubeForInfiniteSection() {
  const section = document.getElementById("infiniteFeedSection");
  if (!section) return;

  const placeholders = Array.from(
    section.querySelectorAll(".lazy-yt[data-video-id]")
  );
  if (!placeholders.length) return;

  const observer = new IntersectionObserver(
    (entries, ob) => {
      if (!entries[0] || !entries[0].isIntersecting) return;

      placeholders.forEach((ph) => {
        const vid = ph.getAttribute("data-video-id");
        if (!vid) return;

        const iframe = document.createElement("iframe");
        iframe.setAttribute("loading", "lazy");
        iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(
          vid
        )}?rel=0`;
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;

        ph.innerHTML = "";
        ph.appendChild(iframe);
      });

      ob.disconnect();
    },
    { rootMargin: "0px 0px -150px 0px", threshold: 0.12 }
  );

  observer.observe(section);
}

/* =========================================================
   INFINITE FEED (Latest Stories)
========================================================= */
function initInfiniteFeed(opts = {}) {
  const pageSize = opts.pageSize || 6;
  const maxPages = opts.maxPages || 5;
  let period = opts.periodDays || "all";

  const feedList = document.getElementById("feedList");
  const sentinel = document.getElementById("feedSentinel");
  const loader = document.getElementById("feedLoader");
  if (!feedList) return;

  if (sentinel) sentinel.style.display = "none";

  let page = 0;

  const filterByPeriod = (arr, periodDays) => {
    if (!periodDays || periodDays === "all") return arr;
    const days = parseInt(periodDays, 10);
    if (!days) return arr;

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    return arr.filter((it) => {
      try {
        return new Date(it.publishedAt).getTime() >= cutoff;
      } catch {
        return false;
      }
    });
  };

  const renderFeedCard = (it) => {
    const img = it.imageUrl || PLACEHOLDER;
    const excerpt =
      it.summary || (it.content ? it.content.slice(0, 150) + "..." : "");

    return `
      <a class="feed-card" href="${slugLink(it.slug || it.id)}">
        <div class="f-thumb">
          <img src="${esc(img)}" loading="lazy" alt="${esc(it.title)}">
        </div>
        <div class="f-body">
          <strong>${esc(it.title)}</strong>
          <div class="meta">${fmtDate(it.publishedAt)} • ${esc(
      it.category || ""
    )}</div>
          <div class="excerpt">${esc(excerpt)}</div>
        </div>
      </a>
    `;
  };

  function renderPage(pageIndex) {
    const all = (window.allArticles || []).slice();
    const filtered = filterByPeriod(all, period);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const safePage =
      pageIndex < 0 ? 0 : pageIndex >= totalPages ? totalPages - 1 : pageIndex;

    page = safePage;

    const start = page * pageSize;
    const slice = filtered.slice(start, start + pageSize);

    if (loader) loader.style.display = "block";
    feedList.innerHTML = "";

    setTimeout(() => {
      feedList.innerHTML = slice.map(renderFeedCard).join("");
      if (loader) loader.style.display = "none";
      renderPaginationButtons(totalPages, page);
    }, 150);
  }

  function ensurePaginationContainer() {
    let wrap = document.getElementById("feedPagination");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "feedPagination";
      wrap.className = "feed-pagination";
      wrap.style.textAlign = "center";
      wrap.style.margin = "18px 0";
      feedList.parentElement.appendChild(wrap);
    }
    return wrap;
  }

  function renderPaginationButtons(totalPages, currentPage) {
    const wrap = ensurePaginationContainer();
    if (totalPages <= 1) {
      wrap.innerHTML = "";
      return;
    }

    const pagesToShow = Math.min(totalPages, maxPages);
    let startPage = 0;

    if (totalPages > maxPages) {
      startPage = Math.max(
        0,
        Math.min(currentPage - Math.floor(maxPages / 2), totalPages - maxPages)
      );
    }

    let html = "";
    for (let i = 0; i < pagesToShow; i++) {
      const pageNumber = startPage + i;
      const label = pageNumber + 1;
      html += `<button class="feed-page-btn${
        pageNumber === currentPage ? " active" : ""
      }" data-page="${pageNumber}">${label}</button>`;
    }
    wrap.innerHTML = html;

    wrap.querySelectorAll(".feed-page-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = parseInt(btn.getAttribute("data-page") || "0", 10);
        renderPage(p);
      });
    });
  }

  function setPeriod(newPeriod) {
    period = newPeriod || "all";
    document.querySelectorAll(".feed-filter").forEach((b) => {
      b.classList.toggle(
        "active",
        b.getAttribute("data-period") === String(period)
      );
    });
    renderPage(0);
  }

  document.querySelectorAll(".feed-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = btn.getAttribute("data-period") || "all";
      setPeriod(p);
    });
  });

  renderPage(0);
}

/* =========================
   Footer helpers
========================= */
function wireFooterHelpers() {
  const cy = document.getElementById("copyYear");
  if (cy) cy.textContent = new Date().getFullYear();

  const back = document.getElementById("backToTop");
  if (back) {
    back.addEventListener("click", (ev) => {
      ev.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const form = document.getElementById("newsletterForm");
  const msg = document.getElementById("newsletterMsg");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const email =
        (document.getElementById("newsletterEmail") || {}).value || "";
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        if (msg) msg.textContent = "Valid email daalein.";
        return;
      }
      form.reset();
      if (msg) msg.textContent = "Shukriya — aap subscribe ho gaye hain.";
      setTimeout(() => (msg.textContent = ""), 3500);
    });
  }
}

/* =========================
   Render homepage columns
========================= */
function renderColumns(
  all,
  trendingArr = [],
  featuredArr = [],
  editorialArr = []
) {
  all = Array.isArray(all) ? all.slice() : [];
  trendingArr = Array.isArray(trendingArr) ? trendingArr.slice() : [];
  featuredArr = Array.isArray(featuredArr) ? featuredArr.slice() : [];
  editorialArr = Array.isArray(editorialArr) ? editorialArr.slice() : [];

  all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  /* TRENDING */
  const trendingEl = document.getElementById("trendingList");
  const trendingItems = (trendingArr.length ? trendingArr : all).slice(0, 4);
  if (trendingEl) {
    trendingEl.innerHTML = trendingItems
      .map((it) => {
        const img = it.imageUrl || PLACEHOLDER;
        return `
          <a class="small-card" href="${slugLink(it.slug || it.id)}">
            <div class="thumb">
              <img src="${esc(img)}" loading="lazy" alt="${esc(it.title)}">
            </div>
            <div class="small-text">
              <strong>${esc(it.title)}</strong>
              <div class="meta">${fmtDate(it.publishedAt)}</div>
            </div>
          </a>`;
      })
      .join("");
  }

  /* LATEST SLIDER */
  const latestEl = document.getElementById("latestList");
  const sliderSlides = all.slice(0, 6);

  if (latestEl) {
    if (sliderSlides.length) {
      latestEl.innerHTML = `
        <div class="fs-slides">
          ${sliderSlides
            .map((it) => {
              const img = it.imageUrl || PLACEHOLDER;
              return `
                <a class="fs-slide" href="${slugLink(it.slug || it.id)}">
                  <img src="${esc(img)}" loading="lazy" alt="${esc(it.title)}">
                  <div class="fs-caption">
                    <div class="kicker">${esc(it.category || "")}</div>
                    <h2>${esc(it.title)}</h2>
                    <div class="meta">${fmtDate(it.publishedAt)}</div>
                  </div>
                </a>`;
            })
            .join("")}
        </div>`;

      try {
        initFeatureSlider("latestList");
      } catch (e) {
        console.warn("Slider init failed:", e);
      }
    } else {
      latestEl.innerHTML = "<p>No latest stories available.</p>";
    }
  }

  /* EDITORIAL */
  const editorialEl = document.getElementById("editorialList");
  let editorialItems = editorialArr.length ? editorialArr : all.slice(3);
  editorialItems = editorialItems.slice(0, 4);

  if (editorialEl) {
    editorialEl.innerHTML = editorialItems
      .map((it) => {
        const img = it.imageUrl || PLACEHOLDER;
        return `
          <a class="small-card" href="${slugLink(it.slug || it.id)}">
            <div class="thumb"><img src="${esc(img)}" loading="lazy"></div>
            <div class="small-text">
              <strong>${esc(it.title)}</strong>
              <div class="meta">${fmtDate(it.publishedAt)}</div>
            </div>
          </a>`;
      })
      .join("");
  }

  /* RELATED HOME SECTION */
  const relatedTarget = featuredArr[0] || all[0] || null;
  if (relatedTarget)
    buildRelatedStore(
      relatedTarget.slug || relatedTarget.id,
      relatedTarget.category,
      all
    );
  renderRelatedBatch();
}

/* =========================
   Slider Logic
========================= */
function initFeatureSlider(containerId = "latestList") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const slidesWrap = container.querySelector(".fs-slides");
  if (!slidesWrap) return;

  const slides = Array.from(slidesWrap.children);
  if (!slides.length) return;

  let cur = 0;
  let timer = null;
  const autoplayMs = 3500;

  slidesWrap.style.position = "relative";
  slidesWrap.style.overflow = "hidden";

  slides.forEach((s, i) => {
    s.style.position = "absolute";
    s.style.inset = "0";
    s.style.opacity = i === 0 ? "1" : "0";
    s.style.transition = "opacity .4s ease";
  });

  function show(i) {
    slides.forEach((s, idx) => {
      s.style.opacity = idx === i ? "1" : "0";
    });
    cur = i;
  }

  function next() {
    show((cur + 1) % slides.length);
  }

  function start() {
    stop();
    timer = setInterval(next, autoplayMs);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  container.addEventListener("mouseenter", stop);
  container.addEventListener("mouseleave", start);

  start();
}

/* =========================
   Related home (Load More)
========================= */
function buildRelatedStore(featureId, featureCategory, items) {
  const cat = featureCategory ? String(featureCategory).toLowerCase() : null;
  let related = [];

  if (cat) {
    related = items.filter(
      (it) =>
        String(it.id) !== String(featureId) &&
        String(it.category || "").toLowerCase() === cat
    );
  }

  if (!related.length)
    related = items.filter((it) => String(it.id) !== String(featureId));

  window.__relatedAll = related;
  window.__relatedIndex = 0;
}

function renderRelatedBatch(batchSize = 4) {
  const grid = document.getElementById("relatedHomeGrid");
  if (!grid) return;

  const all = window.__relatedAll || [];
  let idx = window.__relatedIndex || 0;

  if (!all.length) {
    grid.innerHTML = "";
    return;
  }

  const slice = all.slice(idx, idx + batchSize);
  const html = slice
    .map((it) => {
      const img = it.imageUrl || PLACEHOLDER;
      return `
      <a class="related-card" href="${slugLink(it.slug || it.id)}">
        <div class="thumb"><img src="${esc(img)}" loading="lazy"></div>
        <div class="body">
          <span class="kicker">${esc(it.category || "")}</span>
          <strong>${esc(it.title)}</strong>
          <div class="meta">${fmtDate(it.publishedAt)}</div>
        </div>
      </a>`;
    })
    .join("");

  if (idx === 0) {
    grid.innerHTML = html;
  } else {
    grid.insertAdjacentHTML("beforeend", html);
  }

  window.__relatedIndex = idx + slice.length;

  const btn = document.getElementById("relatedShowMore");
  if (btn) {
    if (window.__relatedIndex >= all.length) {
      btn.style.display = "none";
    } else {
      btn.style.display = "inline-block";
    }
  }
}

function initRelatedHomeLoadMore() {
  const btn = document.getElementById("relatedShowMore");
  if (!btn) return;
  btn.addEventListener("click", () => {
    renderRelatedBatch(4);
  });
}

/* ----------------------------------------------------------
   DUPLICATE YOUTUBE SIDEBAR DOMContentLoaded → COMMENTED
------------------------------------------------------------ */


document.addEventListener("DOMContentLoaded", function () {
  const ytItems = document.querySelectorAll(".yt-item");

  ytItems.forEach(item => {
    const videoId = item.getAttribute("data-video-id");
    const thumb = item.querySelector(".yt-thumb");

    thumb.style.backgroundImage = `url('https://img.youtube.com/vi/${videoId}/hqdefault.jpg')`;
    thumb.style.backgroundSize = "cover";

    item.addEventListener("click", function () {
      item.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                frameborder="0"
                allow="autoplay; encrypted-media"
                allowfullscreen></iframe>`;
    });
  });

  window.addEventListener("scroll", function () {
    document.querySelectorAll("iframe").forEach(frame => {
      const rect = frame.getBoundingClientRect();

      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        const src = frame.src.replace("?autoplay=1", "");
        frame.src = src;
      }
    });
  });
});



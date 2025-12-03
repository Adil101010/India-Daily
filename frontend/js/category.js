/* category.js — FINAL WITH SUBCATEGORY SUPPORT */

(async function () {
  const API_BASE = "http://localhost:8080";

  const getQuery = (n) => new URL(location.href).searchParams.get(n);

  const catParam = getQuery("cat") || getQuery("category") || "";
  const categoryName = decodeURIComponent(catParam || "");

  const esc = (t) => String(t || "");
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

  // DOM refs
  const cardsGrid = document.getElementById("cardsGrid");
  const popularList = document.getElementById("popularList");
  const catTitle = document.getElementById("catTitle");
  const catDesc = document.getElementById("catDesc");
  const catCount = document.getElementById("catCount");
  const searchInput = document.getElementById("catSearch");
  const perPageSel = document.getElementById("perPage");
  const pagerEl = document.getElementById("pager");
  const loadMoreBtn = document.getElementById("loadMore");

  const subTabsSection = document.getElementById("subcategoryTabs");
  const subTabsList = document.getElementById("subtabsList");

  // Set category title
  if (catTitle) catTitle.textContent = categoryName || "All Stories";
  if (catDesc)
    catDesc.textContent = categoryName
      ? `${categoryName} से ताज़ा ख़बरें`
      : "Latest stories across India Daily";

  // State
  let allItems = [];
  let filtered = [];
  let currentList = [];
  let activeFilter = "all";
  let perPage = 9;
  let page = 1;

  let activeSubcategory = null;
  let subcategories = [];

  /* -----------------------------
     LOAD DATA FROM BACKEND
  ------------------------------ */
  async function fetchCategoryNews() {
    if (!categoryName) return [];
    const res = await fetch(
      `${API_BASE}/api/public/news/category?name=${encodeURIComponent(
        categoryName
      )}`
    );
    return res.ok ? await res.json() : [];
  }

  async function fetchTrending() {
    const res = await fetch(`${API_BASE}/api/public/news/trending?limit=20`);
    return res.ok ? await res.json() : [];
  }

  async function fetchLatest() {
    const res = await fetch(`${API_BASE}/api/public/news/latest?limit=50`);
    return res.ok ? await res.json() : [];
  }

  /* -----------------------------
     SUBCATEGORIES
  ------------------------------ */
  async function loadSubcategories() {
    if (!categoryName || !subTabsSection || !subTabsList) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/public/news/subcategories?category=${encodeURIComponent(
          categoryName
        )}`
      );
      if (!res.ok) return;

      subcategories = await res.json();
      if (!subcategories.length) return;

      subTabsSection.style.display = "block";

      // "All" button
      subTabsList.innerHTML =
        '<button class="subtab-btn active" data-sub="">All</button>';

      subcategories.forEach((sub) => {
        const btn = document.createElement("button");
        btn.className = "subtab-btn";
        btn.textContent = sub;
        btn.dataset.sub = sub;
        subTabsList.appendChild(btn);
      });

      subTabsList.querySelectorAll(".subtab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          subTabsList
            .querySelectorAll(".subtab-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          activeSubcategory = btn.dataset.sub || null;
          applyFilters();
        });
      });
    } catch (e) {
      console.warn("Subcategories load error:", e);
    }
  }

  /* -----------------------------
     INITIAL LOAD
  ------------------------------ */
  async function loadAll() {
    const [catData, trending, latest] = await Promise.all([
      fetchCategoryNews(),
      fetchTrending(),
      fetchLatest(),
    ]);

    allItems = catData.length ? catData : latest;

    allItems = allItems.map((x) => ({
      ...x,
      views: x.views || Math.floor(Math.random() * 5000),
      shares: x.shares || Math.floor(Math.random() * 1000),
      featuredImage: x.imageUrl || "images/placeholder.jpg",
    }));

    filtered = allItems.slice();

    if (catCount) catCount.textContent = `${filtered.length} stories`;

    currentList = sortLatest(filtered);

    // subcategories
    await loadSubcategories();

    renderCards();
    renderPager();
    renderPopular(trending);

    setupEvents();
  }

  /* -----------------------------
     SORTING HELPERS
  ------------------------------ */
  const sortLatest = (arr) =>
    arr
      .slice()
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      );

  const sortTrending = (arr) =>
    arr.slice().sort((a, b) => (b.shares || 0) - (a.shares || 0));

  const sortMostViewed = (arr) =>
    arr.slice().sort((a, b) => (b.views || 0) - (a.views || 0));

  /* -----------------------------
     CARD TEMPLATE
  ------------------------------ */
  const createCard = (it) => `
    <a class="card" href="article.html?slug=${it.slug}">
      <div class="thumb">
        <img src="${esc(it.featuredImage)}" loading="lazy" alt="${esc(
    it.title
  )}">
      </div>
      <div class="body">
        <div class="kicker">${esc(it.category || "")}</div>
        <h3>${esc(it.title)}</h3>
        <div class="meta">${fmt(it.publishedAt)} • India Daily</div>
      </div>
    </a>
  `;

  /* -----------------------------
     RENDER FUNCTIONS
  ------------------------------ */
  function renderCards(pg = page) {
    const start = (pg - 1) * perPage;
    const slice = currentList.slice(start, start + perPage);

    cardsGrid.innerHTML = slice.map(createCard).join("");

    loadMoreBtn.disabled =
      slice.length < perPage || start + perPage >= currentList.length;
    loadMoreBtn.textContent = loadMoreBtn.disabled ? "No more" : "Load more";
  }

  function renderPager() {
    pagerEl.innerHTML = "";
    const pages = Math.ceil(currentList.length / perPage);
    if (pages <= 1) return;

    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === page) btn.classList.add("active");

      btn.addEventListener("click", () => {
        page = i;
        renderCards();
        renderPager();
        window.scrollTo({ top: 200, behavior: "smooth" });
      });

      pagerEl.appendChild(btn);
    }
  }

  function renderPopular(list) {
    if (!popularList) return;

    const pop = (list.length ? list : sortMostViewed(allItems)).slice(0, 5);

    popularList.innerHTML = pop
      .map(
        (p) => `
      <a href="article.html?slug=${p.slug}" class="popular-item">
        ${esc(p.title)}
      </a>`
      )
      .join("");
  }

  /* -----------------------------
     APPLY FILTERS
  ------------------------------ */
  function applyFilters() {
    let list = filtered.slice();
    const q = searchInput.value.toLowerCase().trim();

    // Subcategory filter
    if (activeSubcategory) {
      list = list.filter(
        (it) =>
          String(it.subcategory || "").toLowerCase() ===
          activeSubcategory.toLowerCase()
      );
    }

    // Search filter
    if (q) {
      list = list.filter((it) =>
        (it.title || "").toLowerCase().includes(q)
      );
    }

    // Sort filter
    if (activeFilter === "latest") list = sortLatest(list);
    else if (activeFilter === "trending") list = sortTrending(list);
    else if (activeFilter === "mostviewed") list = sortMostViewed(list);
    else list = sortLatest(list);

    currentList = list;
    page = 1;

    renderCards();
    renderPager();
  }

  /* ------------------------------
     EVENTS
  ------------------------------ */
  function setupEvents() {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        activeFilter = btn.dataset.filter;
        applyFilters();
      });
    });

    let t = null;
    searchInput.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(applyFilters, 300);
    });

    perPageSel.addEventListener("change", () => {
      perPage = parseInt(perPageSel.value, 10);
      applyFilters();
    });

    loadMoreBtn.addEventListener("click", () => {
      page++;
      renderCards(page);
    });
  }

  loadAll();
})();

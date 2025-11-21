/* category.js
   - uses window.allArticles (from main.js) or falls back to ./data/article.json
   - filters by ?cat=... (case-insensitive)
   - supports search, filter buttons (latest/trending/mostviewed), pagination and load-more
*/

(function () {
  const getQuery = (name) => new URL(location.href).searchParams.get(name);

  const catParam = getQuery('cat') || getQuery('category') || null;
  const catNormalized = (catParam || '').toLowerCase();

  // UI refs
  const catTitle    = document.getElementById('catTitle');
  const catDesc     = document.getElementById('catDesc');
  const catCount    = document.getElementById('catCount');
  const cardsGrid   = document.getElementById('cardsGrid');
  const popularList = document.getElementById('popularList');
  const searchInput = document.getElementById('catSearch');
  const perPageSel  = document.getElementById('perPage');
  const pagerEl     = document.getElementById('pager');
  const loadMoreBtn = document.getElementById('loadMore');

  if (!cardsGrid || !perPageSel || !pagerEl || !loadMoreBtn) {
    console.warn('category.js: Required DOM elements not found.');
    return;
  }

  // helpers
  const esc = (s) => String(s || '');
  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

  const sortLatest = (arr) =>
    arr.slice().sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const sortTrending = (arr) =>
    arr.slice().sort((a, b) => (b.shares || 0) - (a.shares || 0));

  const sortMostViewed = (arr) =>
    arr.slice().sort((a, b) => (b.views || 0) - (a.views || 0));

  const createCardHTML = (it) => `
    <a class="card" href="article.html?id=${it.id}">
      <div class="thumb">
        <img src="${esc(it.featuredImage)}"
             loading="lazy"
             alt="${esc(it.title)}">
      </div>
      <div class="body">
        <div class="kicker">${esc(it.category || '')}</div>
        <h3>${esc(it.title)}</h3>
        <div class="meta">
          ${fmt(it.publishedAt)} • ${esc(it.author?.name || 'India Daily')}
        </div>
      </div>
    </a>
  `;

  // state
  let items =
    window.allArticles && Array.isArray(window.allArticles)
      ? window.allArticles.slice()
      : null;

  // async init
  (async function init() {
    if (!items) {
      try {
        // filename aligned with data/article.json
        const res = await fetch('./data/articles.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const j = await res.json();
        items = (j.items || []).slice();
      } catch (e) {
        console.error('category: failed to load data', e);
        items = [];
      }
    }

    // normalize publishedAt fallback
    items.forEach((it) => {
      if (!it.publishedAt) {
        it.publishedAt = it.date || new Date().toISOString();
      }
    });

    // filter to category if provided
    let filtered = catNormalized
      ? items.filter((i) =>
          String(i.category || '').toLowerCase().includes(catNormalized)
        )
      : items.slice();

    // header text
    const catLabel = catParam ? decodeURIComponent(catParam) : null;

    if (catTitle) {
      catTitle.textContent = catLabel || (catNormalized ? catNormalized : 'All Stories');
    }

    if (catDesc) {
      catDesc.textContent = catLabel
        ? `Latest from ${catLabel}`
        : 'Latest stories across categories';
    }

    if (catCount) {
      catCount.textContent = `${filtered.length} stories`;
    }

    // pagination state
    let page       = 1;
    let perPage    = parseInt(perPageSel.value, 10) || 9;
    let activeFilter = 'all';
    let currentList  = sortLatest(filtered);

    function renderPopularSidebar() {
      if (!popularList) return;
      const popular = sortMostViewed(filtered).slice(0, 5);
      popularList.innerHTML = popular
        .map(
          (p) => `
        <a href="article.html?id=${p.id}"
           style="display:block;padding:8px 0;border-bottom:1px dashed #f1f1f1">
          ${esc(p.title)}
        </a>`
        )
        .join('');
    }

    function renderCards(list, pageNum = 1) {
      const start = (pageNum - 1) * perPage;
      const slice = list.slice(start, start + perPage);

      if (!slice.length) {
        cardsGrid.innerHTML =
          '<div style="padding:18px;background:#fff;border-radius:8px;">No articles found.</div>';
        return;
      }

      cardsGrid.innerHTML = slice.map(createCardHTML).join('');
      renderPopularSidebar();
    }

    function renderPager(total) {
      pagerEl.innerHTML = '';
      const pages = Math.max(1, Math.ceil(total / perPage));
      if (pages <= 1) return;

      for (let i = 1; i <= pages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === page) btn.className = 'active';
        btn.addEventListener('click', () => {
          page = i;
          renderCards(currentList, page);
          renderPager(currentList.length);
          window.scrollTo({ top: 200, behavior: 'smooth' });
        });
        pagerEl.appendChild(btn);
      }
    }

    function applyFilterAndRender() {
      const searchQ =
        searchInput && searchInput.value
          ? searchInput.value.toLowerCase().trim()
          : '';

      let list = filtered.slice();

      // filter type
      if (activeFilter === 'latest') {
        list = sortLatest(list);
      } else if (activeFilter === 'trending') {
        list = sortTrending(list);
      } else if (activeFilter === 'mostviewed') {
        list = sortMostViewed(list);
      } else {
        list = sortLatest(list);
      }

      // search
      if (searchQ) {
        list = list.filter((it) => {
          const t = (it.title || '').toLowerCase();
          const e = (it.excerpt || '').toLowerCase();
          return t.includes(searchQ) || e.includes(searchQ);
        });
      }

      currentList = list;
      page = 1;
      renderCards(currentList, page);
      renderPager(currentList.length);

      if (catCount) {
        // show currently matching count
        catCount.textContent = `${currentList.length} stories`;
      }

      // reset load more button
      if (loadMoreBtn) {
        loadMoreBtn.disabled = currentList.length <= perPage;
        loadMoreBtn.textContent =
          currentList.length <= perPage ? 'No more' : 'Load more';
      }
    }

    // filter buttons
    document.querySelectorAll('.filter-btn').forEach((b) => {
      b.addEventListener('click', () => {
        document
          .querySelectorAll('.filter-btn')
          .forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        activeFilter = b.getAttribute('data-filter') || 'all';
        applyFilterAndRender();
      });
    });

    // search input
    if (searchInput) {
      let t = null;
      searchInput.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => applyFilterAndRender(), 260);
      });
    }

    // per-page change
    perPageSel.addEventListener('change', () => {
      perPage = parseInt(perPageSel.value, 10) || 9;
      applyFilterAndRender();
    });

    // load more button
    loadMoreBtn.addEventListener('click', () => {
      const nextStart = page * perPage;
      const slice = currentList.slice(nextStart, nextStart + perPage);

      if (!slice.length) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'No more';
        return;
      }

      cardsGrid.insertAdjacentHTML(
        'beforeend',
        slice.map(createCardHTML).join('')
      );
      page++;

      if (page * perPage >= currentList.length) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'No more';
      }
    });

    // initial render
    applyFilterAndRender();

    // small sidebar newsletter handler
    const sidebarNewsletter = document.getElementById('sidebarNewsletter');
    if (sidebarNewsletter) {
      sidebarNewsletter.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Subscribed (demo)');
        this.reset();
      });
    }
  })();
})();

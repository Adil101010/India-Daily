/* js/main.js
   Combined main script:
   - top date
   - live button blink
   - load articles.json and render Trending/Latest/Editorials with clickable cards + lazy images
   - footer helpers: copyYear, back-to-top, newsletter demo
   - INFINITE FEED: client-side pagination (IntersectionObserver)
   - LATEST: slider (3 slides), small list under slider removed as requested
*/

/* Optional: uncomment if you have a carousel module
// import { initHero } from './carousel.js';
*/

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Top date
  const dateEl = document.getElementById('topDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // 2) Live button blink + click handler
  const liveBtn = document.querySelector('.live-btn');
  if (liveBtn) {
    liveBtn.classList.add('blink');
    liveBtn.addEventListener('click', () => {
      window.open('https://www.youtube.com/', '_blank'); // change to your channel
    });
  }

  // 3) Load articles.json and render
  try {
    const res = await fetch('./data/articles.json');
    if (!res.ok) throw new Error('Failed to load articles.json: ' + res.status);
    const json = await res.json();
    const items = json.items || [];

    /* ---------------------------
       expose global sorted list for infinite feed
       - window.allArticles will be used by initInfiniteFeed()
       - we sort by publishedAt desc here (latest first)
    --------------------------- */
    window.allArticles = items.slice().sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // Render homepage sections using the global list
    renderColumns(window.allArticles);

    // Start infinite feed (client-side pagination)
    // Page size set to 6 (change if you want fewer/more per load)
    initInfiniteFeed({ pageSize: 6 });

    // initialize lazy youtube for infinite section (placeholders replaced when visible)
    initLazyYouTubeForInfiniteSection();

  } catch (e) {
    console.error(e);
    // optional: show message in UI
  }

  // 4) Footer helpers
  const cy = document.getElementById('copyYear');
  if (cy) cy.textContent = new Date().getFullYear();

  const back = document.getElementById('backToTop');
  if (back) back.addEventListener('click', (ev) => {
    ev.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const form = document.getElementById('newsletterForm');
  const msg = document.getElementById('newsletterMsg');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (document.getElementById('newsletterEmail') || {}).value || '';
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        if (msg) msg.textContent = 'Valid email daalein.';
        return;
      }
      form.reset();
      if (msg) msg.textContent = 'Shukriya — aap subscribe ho gaye hain.';
      setTimeout(() => { if (msg) msg.textContent = ''; }, 3500);
    });
  }
});

/* ========== renderColumns(items) ===========
   Renders:
     - Trending (left)
     - Latest (center) -> slider (3 slides). small list under slider removed per request.
     - Editorials (right)
   Cards are anchors pointing to article.html?id=<id>
   Images use loading="lazy"
*/
function renderColumns(items) {
  if (!items || !items.length) return;

  const esc = t => String(t || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const fmt = d => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  };

  /* ===========================
     FEATURE SLIDER (vanilla)
     - We'll create a simple 3-slide slider for Latest
     - small list under slider removed as requested
     ============================ */

  function initFeatureSlider(containerId = 'latestList') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // find slides wrapper we created (.fs-slides)
    const slidesWrap = container.querySelector('.fs-slides');
    if (!slidesWrap) return;

    const slides = Array.from(slidesWrap.children);
    if (!slides.length) return;

    let cur = 0;
    let autoplay = true;
    let autoplayMs = 2000; // <<< 1 second per request
    let timer = null;

    // helpers
    function show(index) {
      slides.forEach((s, i) => {
        s.style.transition = 'opacity .3s ease';
        s.style.opacity = i === index ? '1' : '0';
        s.style.zIndex = i === index ? '2' : '1';
        s.classList.toggle('active', i === index);
      });
      cur = index;
    }

    function next() { show((cur + 1) % slides.length); }
    function prev() { show((cur - 1 + slides.length) % slides.length); }

    // create controls (arrows)
    let prevBtn = container.querySelector('.fs-prev');
    let nextBtn = container.querySelector('.fs-next');
    if (!prevBtn || !nextBtn) {
      prevBtn = document.createElement('button'); prevBtn.className = 'fs-prev'; prevBtn.setAttribute('aria-label','Previous');
      nextBtn = document.createElement('button'); nextBtn.className = 'fs-next'; nextBtn.setAttribute('aria-label','Next');
      container.appendChild(prevBtn); container.appendChild(nextBtn);
    }
    prevBtn.onclick = () => { prev(); restart(); };
    nextBtn.onclick = () => { next(); restart(); };

    // NOTE: dots / fs-dots intentionally removed as per request

    // autoplay
    function start() {
      if (!autoplay) return;
      stop();
      timer = setInterval(() => next(), autoplayMs);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    // pause on hover
    container.addEventListener('mouseenter', () => { autoplay = false; stop(); });
    container.addEventListener('mouseleave', () => { autoplay = true; start(); });

    // keyboard support
    container.tabIndex = -1;
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { prev(); restart(); }
      if (e.key === 'ArrowRight') { next(); restart(); }
    });

    // initialize styles for slides
    slides.forEach((s, i) => {
      s.style.position = 'absolute';
      s.style.top = '0';
      s.style.left = '0';
      s.style.width = '100%';
      s.style.opacity = '0';
      s.style.transition = 'opacity .3s ease';
    });
    slidesWrap.style.position = 'relative';
    slidesWrap.style.overflow = 'hidden';
    slidesWrap.style.minHeight = '220px';

    // show first slide
    show(0);
    start();
  }

  // TRENDING - left (first 4)
  const trendingItems = items.slice(0, 4);
  const trendingEl = document.getElementById('trendingList');
  if (trendingEl) {
    trendingEl.innerHTML = trendingItems.map(it => `
      <a class="small-card" href="article.html?id=${it.id}">
        <div class="thumb"><img src="${esc(it.featuredImage)}" loading="lazy" alt="${esc(it.title)}"></div>
        <div class="small-text">
          <strong>${esc(it.title)}</strong>
          <div class="meta">${fmt(it.publishedAt)}</div>
        </div>
      </a>
    `).join('');
  }

  // LATEST - center -> slider (top 3). small list under slider removed per request
  const sorted = items.slice().sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const sliderSlides = sorted.slice(0, 3);      // 3 big slides
  const latestEl = document.getElementById('latestList');

  if (latestEl) {
    let html = '';

    // Slider wrapper (fs-slides)
    html += `<div class="fs-slides">`;
    sliderSlides.forEach(it => {
      html += `
        <a class="fs-slide" href="article.html?id=${it.id}">
          <img src="${esc(it.featuredImage)}" loading="lazy" alt="${esc(it.title)}" />
          <div class="fs-caption">
            <div class="kicker">${esc(it.category || '')}</div>
            <h2>${esc(it.title)}</h2>
            <div class="meta">${fmt(it.publishedAt)}</div>
          </div>
        </a>
      `;
    });
    html += `</div>`; // end fs-slides

    // NOTE: small cards under slider intentionally removed as requested

    latestEl.innerHTML = html;

    // initialize slider (function defined above)
    try {
      initFeatureSlider('latestList');
    } catch (err) {
      console.warn('initFeatureSlider error', err);
    }

    // inject relatedHome row under main columns
    const feature = sliderSlides[0] || null;
    if (feature) {
      renderRelatedHome(feature.id, feature.category, items);
    }
  }

  // EDITORIALS - right
  // try to pick editorial-tagged items, otherwise fallback slice
  let editorialItems = items.filter(it => {
    const c = String(it.category || '').toLowerCase();
    return c.includes('editor') || c.includes('संपाद') || c.includes('editorial');
  });
  if (!editorialItems.length) editorialItems = items.slice(2, 6);

  const editorialEl = document.getElementById('editorialList');
  if (editorialEl) {
    editorialEl.innerHTML = editorialItems.slice(0,4).map(it => `
      <a class="small-card" href="article.html?id=${it.id}">
        <div class="thumb"><img src="${esc(it.featuredImage)}" loading="lazy" alt="${esc(it.title)}"></div>
        <div class="small-text">
          <strong>${esc(it.title)}</strong>
          <div class="meta">${fmt(it.publishedAt)}</div>
        </div>
      </a>
    `).join('');
  }
}

/* renderRelatedHome — populates #relatedHomeGrid with 4 cards
   Place this function in js/main.js (once)
*/
function renderRelatedHome(featureId, featureCategory, items){
  const grid = document.getElementById('relatedHomeGrid');
  if(!grid) return;

  const cat = featureCategory ? String(featureCategory).toLowerCase() : null;
  let related = [];
  if(cat){
    related = items.filter(it => String(it.id) !== String(featureId) && String(it.category || '').toLowerCase() === cat);
  }
  if(!related.length){
    related = items.filter(it => String(it.id) !== String(featureId));
  }
  related = related.slice(0, 4); // show 4

  const esc = t => String(t||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '';

  grid.innerHTML = related.map(it => `
    <a class="related-card" href="article.html?id=${it.id}">
      <div class="thumb"><img src="${esc(it.featuredImage)}" loading="lazy" alt="${esc(it.title)}"></div>
      <div class="body">
        <span class="kicker">${esc(it.category || '')}</span>
        <strong>${esc(it.title)}</strong>
        <div class="meta">${fmt(it.publishedAt)}</div>
      </div>
    </a>
  `).join('');
}

/* =========================
   INFINITE FEED with period filter
   Usage: const stop = initInfiniteFeed({pageSize:6, periodDays: 'all'})
   Call stop() to disconnect observer.
   Exposes returned controller: { setPeriod('all'|'1'|'10'|'30') }
   ========================= */

function initInfiniteFeed(opts = {}) {
  const pageSize = opts.pageSize || 6;
  let period = (opts.periodDays || 'all');  // 'all' or number of days as string like '1','10','30'
  const feedList = document.getElementById('feedList');
  const sentinel = document.getElementById('feedSentinel');
  const loader = document.getElementById('feedLoader');
  if (!feedList || !sentinel) return () => {};
  // State
  let page = 0;
  let loading = false;
  let finished = false;
  let observer = null;

  // helper to parse date and filter by period
  const filterByPeriod = (arr, periodDays) => {
    if (!periodDays || periodDays === 'all') return arr;
    const days = parseInt(periodDays, 10);
    if (!days) return arr;
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return arr.filter(it => {
      try {
        return new Date(it.publishedAt).getTime() >= cutoff;
      } catch { return false; }
    });
  };

  /* ===== Lazy-load YouTube in infiniteFeedSection when it appears =====
     Place placeholders in HTML like:
     <div class="lazy-yt" data-video-id="YOUTUBE_ID"></div>
  */
  function initLazyYouTubeForInfiniteSection() {
    const section = document.getElementById('infiniteFeedSection');
    if (!section) return;
    const placeholders = Array.from(section.querySelectorAll('.lazy-yt[data-video-id]'));
    if (!placeholders.length) return;

    const observer = new IntersectionObserver((entries, ob) => {
      if (!entries[0].isIntersecting) return;
      placeholders.forEach(ph => {
        const vid = ph.getAttribute('data-video-id');
        if (!vid) return;
        const iframe = document.createElement('iframe');
        iframe.setAttribute('loading','lazy');
        iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(vid)}?rel=0`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        ph.innerHTML = '';
        ph.appendChild(iframe);
      });
      ob.disconnect();
    }, { rootMargin: '0px 0px -150px 0px', threshold: 0.12 });

    observer.observe(section);
  }

  const renderFeedCard = (it) => {
    const esc = t => String(t || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    const fmt = (d) => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
    return `
      <a class="feed-card" href="article.html?id=${it.id}">
        <div class="f-thumb">
          <img src="${esc(it.featuredImage)}" loading="lazy" alt="${esc(it.title)}">
        </div>
        <div class="f-body">
          <strong>${esc(it.title)}</strong>
          <div class="meta">${fmt(it.publishedAt)} • ${esc(it.category||'')}</div>
          <div class="excerpt" style="margin-top:8px;color:#555">${esc(it.excerpt||'')}</div>
        </div>
      </a>
    `;
  };

  // load next page using filtered list
  function loadNext() {
    if (loading || finished) return;
    const all = (window.allArticles || []).slice(); // already sorted desc
    const filtered = filterByPeriod(all, period);
    const start = page * pageSize;
    const slice = filtered.slice(start, start + pageSize);

    if (!slice.length) {
      finished = true;
      if (loader) loader.style.display = 'none';
      return;
    }

    loading = true;
    if (loader) loader.style.display = 'block';

    setTimeout(() => {
      feedList.insertAdjacentHTML('beforeend', slice.map(renderFeedCard).join(''));
      page++;
      loading = false;
      if (loader) loader.style.display = 'none';
      if (page * pageSize >= filtered.length) finished = true;
    }, 300);
  }

  // observer setup
  function startObserver() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadNext();
    }, { rootMargin: '300px' });
    observer.observe(sentinel);
  }

  // reset feed (when period changes)
  function resetAndLoad() {
    if (observer) observer.disconnect();
    feedList.innerHTML = '';
    page = 0;
    finished = false;
    loading = false;
    if (loader) loader.style.display = 'none';
    loadNext();
    startObserver();
  }

  // expose method to change period and reload
  function setPeriod(newPeriod) {
    period = newPeriod || 'all';
    // highlight buttons (if exist)
    document.querySelectorAll('.feed-filter').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-period') === String(period));
    });
    resetAndLoad();
  }

  // init: wire up filter buttons (if exist)
  document.querySelectorAll('.feed-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-period') || 'all';
      setPeriod(p);
    });
  });

  // initial run
  resetAndLoad();

  // return controller to allow external control
  return { setPeriod, stop: () => observer && observer.disconnect() };
}

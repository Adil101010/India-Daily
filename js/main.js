/* js/main.js
   Combined main script:
   - top date
   - live button blink
   - load article.json and render Trending/Latest/Editorials with clickable cards + lazy images
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
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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

  // 3) Load article.json and render
  try {
    const res = await fetch('./data/articles.json'); // path aligned with folder structure
    if (!res.ok) throw new Error('Failed to load article.json: ' + res.status);
    const json = await res.json();
    const items = json.items || [];

    // Sort once (latest first) + expose
    window.allArticles = items.slice().sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    // Render homepage sections
    renderColumns(window.allArticles);

    // Infinite feed
    initInfiniteFeed({ pageSize: 6 });

    // Lazy YouTube in infinite section
    initLazyYouTubeForInfiniteSection();
  } catch (e) {
    console.error(e);
  }

  // 4) Footer helpers
  const cy = document.getElementById('copyYear');
  if (cy) cy.textContent = new Date().getFullYear();

  const back = document.getElementById('backToTop');
  if (back) {
    back.addEventListener('click', (ev) => {
      ev.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

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

  const esc = (t) =>
    String(t || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');

  const fmt = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  /* ===========================
     FEATURE SLIDER (vanilla)
     - simple 3-slide slider for Latest
     - small list under slider removed as requested
     ============================ */
  function initFeatureSlider(containerId = 'latestList') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const slidesWrap = container.querySelector('.fs-slides');
    if (!slidesWrap) return;

    const slides = Array.from(slidesWrap.children);
    if (!slides.length) return;

    let cur = 0;
    let autoplay = true;
    let autoplayMs = 2000; // 2 seconds per slide
    let timer = null;

    function show(index) {
      slides.forEach((s, i) => {
        s.style.transition = 'opacity .3s ease';
        s.style.opacity = i === index ? '1' : '0';
        s.style.zIndex = i === index ? '2' : '1';
        s.classList.toggle('active', i === index);
      });
      cur = index;
    }

    function next() {
      show((cur + 1) % slides.length);
    }

    function prev() {
      show((cur - 1 + slides.length) % slides.length);
    }

    // arrows
    let prevBtn = container.querySelector('.fs-prev');
    let nextBtn = container.querySelector('.fs-next');

    if (!prevBtn || !nextBtn) {
      prevBtn = document.createElement('button');
      prevBtn.className = 'fs-prev';
      prevBtn.setAttribute('aria-label', 'Previous');

      nextBtn = document.createElement('button');
      nextBtn.className = 'fs-next';
      nextBtn.setAttribute('aria-label', 'Next');

      container.appendChild(prevBtn);
      container.appendChild(nextBtn);
    }

    prevBtn.onclick = () => {
      prev();
      restart();
    };
    nextBtn.onclick = () => {
      next();
      restart();
    };

    // autoplay
    function start() {
      if (!autoplay) return;
      stop();
      timer = setInterval(() => next(), autoplayMs);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function restart() {
      stop();
      start();
    }

    // pause on hover
    container.addEventListener('mouseenter', () => {
      autoplay = false;
      stop();
    });

    container.addEventListener('mouseleave', () => {
      autoplay = true;
      start();
    });

    // keyboard support
    container.tabIndex = -1;
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prev();
        restart();
      }
      if (e.key === 'ArrowRight') {
        next();
        restart();
      }
    });

    // slide styles
    slides.forEach((s) => {
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

    // show first
    show(0);
    start();
  }

  // TRENDING - left (first 4)
  const trendingItems = items.slice(0, 4);
  const trendingEl = document.getElementById('trendingList');
  if (trendingEl) {
    trendingEl.innerHTML = trendingItems
      .map(
        (it) => `
      <a class="small-card" href="article.html?id=${it.id}">
        <div class="thumb">
          <img src="${esc(it.featuredImage)}" loading="lazy" alt="${esc(it.title)}">
        </div>
        <div class="small-text">
          <strong>${esc(it.title)}</strong>
          <div class="meta">${fmt(it.publishedAt)}</div>
        </div>
      </a>
    `
      )
      .join('');
  }

  // LATEST - center -> slider (top 3). small list under slider removed
  const sorted = items
    .slice()
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const sliderSlides = sorted.slice(0, 3);
  const latestEl = document.getElementById('latestList');

  if (latestEl) {
    let html = `<div class="fs-slides">`;

    sliderSlides.forEach((it) => {
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

    latestEl.innerHTML = html;

    try {
      initFeatureSlider('latestList');
    } catch (err) {
      console.warn('initFeatureSlider error', err);
    }

    // Related home section under main feature
    const feature = sliderSlides[0] || null;
    if (feature) {
      renderRelatedHome(feature.id, feature.category, items);
    }
  }

  // EDITORIALS - right
  let editorialItems = items.filter((it) => {
    const c = String(it.category || '').toLowerCase();
    return (
      c.includes('editor') ||
      c.includes('संपाद') ||
      c.includes('editorial')
    );
  });
  if (!editorialItems.length) editorialItems = items.slice(2, 6);

  const editorialEl = document.getElementById('editorialList');
  if (editorialEl) {
    editorialEl.innerHTML = editorialItems
      .slice(0, 4)
      .map(
        (it) => `
      <a class="small-card" href="article.html?id=${it.id}">
        <div class="thumb">
          <img src="${esc(it.featuredImage)}" loading="lazy" alt="${esc(it.title)}">
        </div>
        <div class="small-text">
          <strong>${esc(it.title)}</strong>
          <div class="meta">${fmt(it.publishedAt)}</div>
        </div>
      </a>
    `
      )
      .join('');
  }
}

/* renderRelatedHome — populates #relatedHomeGrid with 4 cards */
function renderRelatedHome(featureId, featureCategory, items) {
  const grid = document.getElementById('relatedHomeGrid');
  if (!grid) return;

  const cat = featureCategory ? String(featureCategory).toLowerCase() : null;
  let related = [];

  if (cat) {
    related = items.filter(
      (it) =>
        String(it.id) !== String(featureId) &&
        String(it.category || '').toLowerCase() === cat
    );
  }

  if (!related.length) {
    related = items.filter((it) => String(it.id) !== String(featureId));
  }

  related = related.slice(0, 4);

  const esc = (t) =>
    String(t || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      : '';

  grid.innerHTML = related
    .map(
      (it) => `
    <a class="related-card" href="article.html?id=${it.id}">
      <div class="thumb">
        <img src="${esc(it.featuredImage)}" loading="lazy" alt="${esc(it.title)}">
      </div>
      <div class="body">
        <span class="kicker">${esc(it.category || '')}</span>
        <strong>${esc(it.title)}</strong>
        <div class="meta">${fmt(it.publishedAt)}</div>
      </div>
    </a>
  `
    )
    .join('');
}

/* Lazy-load YouTube in infiniteFeedSection when it appears */
function initLazyYouTubeForInfiniteSection() {
  const section = document.getElementById('infiniteFeedSection');
  if (!section) return;

  const placeholders = Array.from(
    section.querySelectorAll('.lazy-yt[data-video-id]')
  );
  if (!placeholders.length) return;

  const observer = new IntersectionObserver(
    (entries, ob) => {
      if (!entries[0] || !entries[0].isIntersecting) return;

      placeholders.forEach((ph) => {
        const vid = ph.getAttribute('data-video-id');
        if (!vid) return;

        const iframe = document.createElement('iframe');
        iframe.setAttribute('loading', 'lazy');
        iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(
          vid
        )}?rel=0`;
        iframe.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        ph.innerHTML = '';
        ph.appendChild(iframe);
      });

      ob.disconnect();
    },
    { rootMargin: '0px 0px -150px 0px', threshold: 0.12 }
  );

  observer.observe(section);
}

/* =========================
   INFINITE FEED with period filter
   ========================= */
function initInfiniteFeed(opts = {}) {
  const pageSize = opts.pageSize || 6;
  let period = opts.periodDays || 'all'; // 'all' or '1'/'10'/'30'

  const feedList = document.getElementById('feedList');
  const sentinel = document.getElementById('feedSentinel');
  const loader = document.getElementById('feedLoader');
  if (!feedList || !sentinel) return () => {};

  let page = 0;
  let loading = false;
  let finished = false;
  let observer = null;

  const filterByPeriod = (arr, periodDays) => {
    if (!periodDays || periodDays === 'all') return arr;
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
    const esc = (t) =>
      String(t || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

    const fmt = (d) =>
      new Date(d).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

    return `
      <a class="feed-card" href="article.html?id=${it.id}">
        <div class="f-thumb">
          <img src="${esc(it.featuredImage)}" loading="lazy" alt="${esc(it.title)}">
        </div>
        <div class="f-body">
          <strong>${esc(it.title)}</strong>
          <div class="meta">${fmt(it.publishedAt)} • ${esc(
      it.category || ''
    )}</div>
          <div class="excerpt" style="margin-top:8px;color:#555">${esc(
            it.excerpt || ''
          )}</div>
        </div>
      </a>
    `;
  };

  function loadNext() {
    if (loading || finished) return;

    const all = (window.allArticles || []).slice();
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
      feedList.insertAdjacentHTML(
        'beforeend',
        slice.map(renderFeedCard).join('')
      );
      page++;
      loading = false;
      if (loader) loader.style.display = 'none';
      if (page * pageSize >= filtered.length) finished = true;
    }, 300);
  }

  function startObserver() {
    if (observer) observer.disconnect();

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNext();
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
  }

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

  function setPeriod(newPeriod) {
    period = newPeriod || 'all';
    document.querySelectorAll('.feed-filter').forEach((b) => {
      b.classList.toggle(
        'active',
        b.getAttribute('data-period') === String(period)
      );
    });
    resetAndLoad();
  }

  // wire filter buttons
  document.querySelectorAll('.feed-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-period') || 'all';
      setPeriod(p);
    });
  });

  // initial run
  resetAndLoad();

  return {
    setPeriod,
    stop: () => observer && observer.disconnect()
  };
}

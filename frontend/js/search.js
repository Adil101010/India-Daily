// js/search.js (module)
// Client-side search: debounced input, scoring, highlight, category filter, load more.

const qsGet = (k) => new URLSearchParams(location.search).get(k);

const debounce = (fn, ms = 300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), ms); };
};

// highlight matched words in a text (case-insensitive)
function highlightText(text, terms) {
  if (!terms || !terms.length) return escapeHtml(text);
  let out = escapeHtml(text);
  // sort terms by length desc to avoid nested matches
  const uniq = Array.from(new Set(terms.filter(Boolean))).sort((a,b)=>b.length-a.length);
  uniq.forEach(term => {
    const esc = escapeRegExp(term);
    const re = new RegExp(`(${esc})`, 'ig');
    out = out.replace(re, '<span class="highlight">$1</span>');
  });
  return out;
}
function escapeRegExp(s){ return String(s||'').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function escapeHtml(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

document.addEventListener('DOMContentLoaded', async () => {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const resultsList = document.getElementById('resultsList');
  const resultsSummary = document.getElementById('resultsSummary');
  const categoryFilter = document.getElementById('categoryFilter');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const noResultsEl = document.getElementById('noResults');
  const recentSearchesEl = document.getElementById('recentSearches');

  // pagination
  const PAGE_SIZE = 8;
  let page = 1;
  let lastResults = [];

  // prefill input from URL
  const initialQ = qsGet('q') ? decodeURIComponent(qsGet('q')) : '';
  const initialCat = qsGet('cat') ? decodeURIComponent(qsGet('cat')) : '';

  input.value = initialQ;
  // load articles (use cache if available)
  let articles = [];
  try {
    if (window.allArticles && Array.isArray(window.allArticles) && window.allArticles.length) {
      articles = window.allArticles.slice();
    } else {
      const res = await fetch('./data/articles.json');
      const json = await res.json();
      articles = (json.items || []).slice();
      window.allArticles = articles.slice();
    }
  } catch (err) {
    console.error('Failed to load articles.json', err);
    resultsList.innerHTML = '<p>Unable to load articles.</p>';
    return;
  }

  // populate category filter options
  const cats = Array.from(new Set(articles.map(a => a.category || '').filter(Boolean))).sort();
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
  if (initialCat) categoryFilter.value = initialCat;

  // recent searches (localStorage)
  const REC_KEY = 'id_search_recent';
  function getRecent() {
    try { return JSON.parse(localStorage.getItem(REC_KEY) || '[]'); } catch { return []; }
  }
  function pushRecent(q) {
    if (!q) return;
    const arr = getRecent().filter(x=>x!==q);
    arr.unshift(q);
    localStorage.setItem(REC_KEY, JSON.stringify(arr.slice(0,8)));
    renderRecent();
  }
  function renderRecent() {
    const arr = getRecent();
    if(!arr.length) { recentSearchesEl.innerHTML = '<div style="color:#777">कोई हाल की खोज नहीं</div>'; return; }
    recentSearchesEl.innerHTML = arr.map(s => `<a href="search.html?q=${encodeURIComponent(s)}">${escapeHtml(s)}</a>`).join(' ');
  }
  renderRecent();

  // scoring function: title match weight 3, excerpt 2, content 1, recency boost
  function scoreArticle(article, terms) {
    if (!terms.length) return 0;
    const title = String(article.title || '').toLowerCase();
    const excerpt = String(article.excerpt || '').toLowerCase();
    const content = String(article.contentHtml || '').toLowerCase();
    let score = 0;
    terms.forEach(t => {
      const s = t.toLowerCase();
      if (!s) return;
      if (title.includes(s)) score += 300;
      if (excerpt.includes(s)) score += 150;
      if (content.includes(s)) score += 75;
    });
    // recency boost (days since published)
    const days = (Date.now() - new Date(article.publishedAt || Date.now()).getTime()) / (1000*60*60*24);
    const recencyBoost = Math.max(0, 50 - Math.min(50, Math.round(days))); // recent articles get small boost
    score += recencyBoost;
    return score;
  }

  // main search logic
  function runSearch(q, cat) {
    const raw = String(q || '').trim();
    if (!raw) {
      // empty query: clear results or show popular
      resultsList.innerHTML = `<div style="color:#666">शब्द टाइप करें और परिणाम देखें.</div>`;
      resultsSummary.textContent = '';
      noResultsEl.style.display = 'none';
      loadMoreBtn.style.display = 'none';
      lastResults = [];
      return;
    }
    const terms = raw.split(/\s+/).filter(Boolean);
    // filter by category if selected
    let pool = articles.slice();
    if (cat) pool = pool.filter(a => String(a.category || '') === String(cat));
    // compute scores
    const scored = pool.map(a => ({ a, score: scoreArticle(a, terms) }));
    // filter out zero scores but also consider partial matches: keep only score>0
    const matched = scored.filter(x => x.score > 0).sort((x,y) => y.score - x.score);
    const results = matched.map(x => x.a);
    lastResults = results;
    page = 1;
    renderResultsPage();
    // update UI & recent
    resultsSummary.textContent = `Showing ${results.length} results for "${raw}"` + (cat ? ` • ${cat}` : '');
    noResultsEl.style.display = results.length ? 'none' : 'block';
    if (results.length) pushRecent(raw);
  }

  // render a page from lastResults
  function renderResultsPage(){
    const start = (page-1)*PAGE_SIZE;
    const slice = lastResults.slice(start, start + PAGE_SIZE);
    if (!slice.length) {
      if (page === 1) resultsList.innerHTML = '<div style="color:#666">कोई परिणाम नहीं मिला।</div>';
      loadMoreBtn.style.display = 'none';
      return;
    }
    const qWords = (input.value || '').trim().split(/\s+/).filter(Boolean);
    // if first page, replace; else append
    if (page === 1) resultsList.innerHTML = slice.map(r => renderResultItem(r, qWords)).join('');
    else resultsList.insertAdjacentHTML('beforeend', slice.map(r => renderResultItem(r, qWords)).join(''));
    // show load more if more pages
    loadMoreBtn.style.display = (start + PAGE_SIZE < lastResults.length) ? 'inline-block' : 'none';
  }

  function renderResultItem(item, qWords) {
    const thumb = item.featuredImage ? `<div class="result-thumb"><img src="${escapeHtml(item.featuredImage)}" loading="lazy" alt="${escapeHtml(item.title)}"></div>` : '';
    const title = highlightText(item.title || '', qWords);
    const excerpt = highlightText(item.excerpt || '', qWords);
    const meta = `${new Date(item.publishedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} • ${escapeHtml(item.category||'')}`;
    return `
      <a class="result-card" href="article.html?id=${encodeURIComponent(item.id)}">
        ${thumb}
        <div class="result-body">
          <h3>${title}</h3>
          <div class="result-meta">${meta}</div>
          <div class="result-excerpt">${excerpt}</div>
        </div>
      </a>
    `;
  }

  // UI wiring
  const debounced = debounce(() => {
    const q = input.value.trim();
    // update URL (pushState) so it's shareable
    const url = new URL(location.href);
    if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
    const sel = categoryFilter.value;
    if (sel) url.searchParams.set('cat', sel); else url.searchParams.delete('cat');
    history.replaceState({}, '', url.toString());
    runSearch(q, categoryFilter.value || '');
  }, 300);

  input.addEventListener('input', debounced);
  categoryFilter.addEventListener('change', () => {
    // on filter change, update URL and rerun search with current input
    const url = new URL(location.href);
    const sel = categoryFilter.value;
    if (sel) url.searchParams.set('cat', sel); else url.searchParams.delete('cat');
    history.replaceState({}, '', url.toString());
    // reset page & run
    page = 1;
    debounced();
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    categoryFilter.value = '';
    history.replaceState({}, '', 'search.html');
    resultsList.innerHTML = `<div style="color:#666">शब्द टाइप करें और परिणाम देखें.</div>`;
    resultsSummary.textContent = '';
    loadMoreBtn.style.display = 'none';
    noResultsEl.style.display = 'none';
  });

  loadMoreBtn.addEventListener('click', () => {
    page++;
    renderResultsPage();
  });

  // initial run if q present
  if (initialQ) {
    runSearch(initialQ, initialCat || '');
  } else {
    resultsList.innerHTML = `<div style="color:#666">शब्द लिखकर खोज शुरू करें — उदाहरण: "क्रिकेट"</div>`;
  }

});

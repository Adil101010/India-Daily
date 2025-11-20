/* category.js
   - loads articles.json (or window.allArticles from main.js)
   - filters by ?cat=... (case-insensitive)
   - supports search, filter buttons (latest/trending/mostviewed), pagination and load-more
*/

(async function(){
  const q = (name)=> new URL(location.href).searchParams.get(name);
  const catParam = q('cat') || q('category') || null;
  const catNormalized = (catParam || '').toLowerCase();

  // UI refs
  const catTitle = document.getElementById('catTitle');
  const catDesc = document.getElementById('catDesc');
  const catCount = document.getElementById('catCount');
  const cardsGrid = document.getElementById('cardsGrid');
  const popularList = document.getElementById('popularList');
  const searchInput = document.getElementById('catSearch');
  const perPageSel = document.getElementById('perPage');
  const pagerEl = document.getElementById('pager');
  const loadMoreBtn = document.getElementById('loadMore');

  // state
  let items = (window.allArticles && Array.isArray(window.allArticles) && window.allArticles.slice()) || null;
  if(!items){
    try {
      const res = await fetch('data/articles.json');
      const j = await res.json();
      items = (j.items || []).slice();
    } catch (e) {
      console.error('category: failed to load data', e);
      items = [];
    }
  }
  // normalize publishedAt fallback
  items.forEach(it => it.publishedAt = it.publishedAt || it.date || new Date().toISOString());

  // filter to category if provided
  let filtered = catNormalized ? items.filter(i => String(i.category || '').toLowerCase().includes(catNormalized)) : items.slice();

  // update header
  catTitle.textContent = catParam ? decodeURIComponent(catParam) : (catNormalized ? catNormalized : 'All Stories');
  catDesc.textContent = catParam ? `Latest from ${decodeURIComponent(catParam)}` : 'Latest stories across categories';
  catCount.textContent = `${filtered.length} stories`;

  // helpers
  const fmt = d => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  const esc = s => String(s||'');
  const createCardHTML = it=> `
    <a class="card" href="article.html?id=${it.id}">
      <div class="thumb"><img src="${esc(it.featuredImage)}" alt="${esc(it.title)}"></div>
      <div class="body">
        <div class="kicker">${esc(it.category||'')}</div>
        <h3>${esc(it.title)}</h3>
        <div class="meta">${fmt(it.publishedAt)} • ${esc(it.author?.name||'India Daily')}</div>
      </div>
    </a>
  `;

  // sorting helpers
  const sortLatest = arr => arr.slice().sort((a,b)=> new Date(b.publishedAt) - new Date(a.publishedAt));
  const sortTrending = arr => arr.slice().sort((a,b)=> (b.shares||0) - (a.shares||0));
  const sortMostViewed = arr => arr.slice().sort((a,b)=> (b.views||0) - (a.views||0));

  // UI state: pagination
  let page = 1;
  let perPage = parseInt(perPageSel.value,10) || 9;
  let activeFilter = 'all';
  let currentList = sortLatest(filtered);

  // render functions
  function renderCards(list, pageNum=1){
    cardsGrid.innerHTML = '';
    const start = (pageNum-1) * perPage;
    const slice = list.slice(start, start + perPage);
    if(!slice.length){
      cardsGrid.innerHTML = `<div style="padding:18px;background:#fff;border-radius:8px;">No articles found.</div>`;
      return;
    }
    cardsGrid.innerHTML = slice.map(createCardHTML).join('');
    // update popular sidebar
    const popular = sortMostViewed(filtered).slice(0,5);
    popularList.innerHTML = popular.map(p => `<a href="article.html?id=${p.id}" style="display:block;padding:8px 0;border-bottom:1px dashed #f1f1f1">${esc(p.title)}</a>`).join('');
  }

  function renderPager(total){
    pagerEl.innerHTML = '';
    const pages = Math.max(1, Math.ceil(total / perPage));
    if(pages <= 1) return;
    for(let i=1;i<=pages;i++){
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = (i===page ? 'active' : '');
      btn.addEventListener('click', ()=> {
        page = i;
        renderCards(currentList, page);
        renderPager(total);
        window.scrollTo({top:200,behavior:'smooth'});
      });
      pagerEl.appendChild(btn);
    }
  }

  // apply filter function
  function applyFilterAndRender(){
    // search
    const q = (searchInput && searchInput.value)? searchInput.value.toLowerCase().trim() : '';
    let list = filtered.slice();

    // filter by activeFilter
    if(activeFilter === 'latest') list = sortLatest(list);
    else if(activeFilter === 'trending') list = sortTrending(list);
    else if(activeFilter === 'mostviewed') list = sortMostViewed(list);
    else list = sortLatest(list);

    // apply search term
    if(q){
      list = list.filter(it => (it.title || '').toLowerCase().includes(q) || (it.excerpt||'').toLowerCase().includes(q));
    }

    currentList = list;
    page = 1;
    renderCards(currentList, page);
    renderPager(currentList.length);
    catCount.textContent = `${filtered.length} stories`;
  }

  // wire filter buttons
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.addEventListener('click', ()=> {
      document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      activeFilter = b.getAttribute('data-filter') || 'all';
      applyFilterAndRender();
    });
  });

  // search input
  if(searchInput){
    let t = null;
    searchInput.addEventListener('input', ()=> {
      clearTimeout(t);
      t = setTimeout(()=> applyFilterAndRender(), 260);
    });
  }

  // perPage change
  perPageSel.addEventListener('change', ()=> {
    perPage = parseInt(perPageSel.value,10) || 9;
    applyFilterAndRender();
  });

  // load more button
  loadMoreBtn.addEventListener('click', ()=> {
    // append next page
    const nextStart = page * perPage;
    const slice = currentList.slice(nextStart, nextStart + perPage);
    if(!slice.length) { loadMoreBtn.disabled = true; loadMoreBtn.textContent = 'No more'; return; }
    cardsGrid.insertAdjacentHTML('beforeend', slice.map(createCardHTML).join(''));
    page++;
  });

  // initial render
  applyFilterAndRender();

  // utilities: update copyYear, backToTop, etc (reuse from main.js if present)
  try { document.getElementById('copyYear').textContent = new Date().getFullYear(); } catch(e){}
  const back = document.getElementById('backToTop'); if(back) back.addEventListener('click', (ev)=>{ ev.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); });

  // newsletter small handlers
  const sidebarNewsletter = document.getElementById('sidebarNewsletter');
  if(sidebarNewsletter) sidebarNewsletter.addEventListener('submit', function(e){ e.preventDefault(); alert('Subscribed (demo)'); this.reset(); });

})();

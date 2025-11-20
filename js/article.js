/* js/article.js — Ultra-polished final loader */
(async function(){

  function getQueryParam(name){
    try { const url = new URL(window.location.href); return url.searchParams.get(name); } catch (e) { return null; }
  }
  function esc(s=''){ return String(s == null ? '' : s); }
  function fmtDate(d){ if(!d) return ''; const dt = new Date(d); return dt.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }); }
  function readTimeFromHtml(html){
    if(!html) return 1;
    const text = html.replace(/<[^>]*>/g,' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length || 0;
    return Math.max(1, Math.round(words / 200));
  }
  function showMessage(msg){
    const root = document.getElementById('articleCard') || document.body;
    root.innerHTML = `<div style="padding:24px;font-size:18px;color:#333">${esc(msg)}</div>`;
  }

  // load list (prefer global shared list)
  let items = (window.allArticles && Array.isArray(window.allArticles) && window.allArticles.slice()) || null;
  if(!items){
    try {
      const res = await fetch('data/articles.json');
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      items = (json.items || []).slice();
    } catch (err) {
      console.error('Failed to load articles.json', err);
      showMessage('Content load failed. Check data/articles.json and reload the page.');
      return;
    }
  }
  if(!items || !items.length){
    showMessage('No articles found in data/articles.json.');
    return;
  }

  // pick article (id or slug) or fallback to first
  const idParam = getQueryParam('id') || getQueryParam('slug') || null;
  let article = null;
  if(idParam){
    article = items.find(it => String(it.id) === String(idParam) || String(it.slug) === String(idParam));
    if(!article){ showMessage('Article not found for id/slug: ' + esc(idParam)); return; }
  } else {
    article = items[0];
  }

  // Featured image + OG/Twitter
  const featWrap = document.getElementById('featuredImgWrap');
  if(featWrap){
    featWrap.innerHTML = '';
    if(article.featuredImage){
      const img = document.createElement('img');
      img.src = esc(article.featuredImage);
      img.alt = esc(article.title || 'Featured image');
      img.loading = 'lazy';
      img.decoding = 'async';
      featWrap.appendChild(img);
      // og image
      const setMeta = (selector, attrName, val) => {
        if(!val) return;
        let m = document.querySelector(selector);
        if(!m){
          m = document.createElement('meta');
          if(attrName === 'name') m.setAttribute('name', selector.replace(/meta\[(name|property)=["']?(.+)["']?\]/,'$2'));
          else m.setAttribute('property', selector.replace(/meta\[(name|property)=["']?(.+)["']?\]/,'$2'));
          document.head.appendChild(m);
        }
        m.setAttribute(attrName || 'content', val);
      };
      // simple set
      (function setOG(){
        // og:title, og:description, og:image
        let og = document.querySelector('meta[property="og:image"]'); if(!og){ og = document.createElement('meta'); og.setAttribute('property','og:image'); document.head.appendChild(og); } og.setAttribute('content', article.featuredImage);
        let t = document.querySelector('meta[name="twitter:card"]'); if(!t){ t = document.createElement('meta'); t.setAttribute('name','twitter:card'); document.head.appendChild(t); } t.setAttribute('content','summary_large_image');
      })();
    }
  }

  // Title, category, author, date, meta desc, canonical
  const titleEl = document.getElementById('articleTitle'); if(titleEl) titleEl.textContent = article.title || '';
  const catEl = document.getElementById('articleCategory'); if(catEl) catEl.textContent = article.category || '';
  const authEl = document.getElementById('articleAuthor'); if(authEl) authEl.textContent = article.author?.name || 'India Daily';
  const dateEl = document.getElementById('articleDate'); if(dateEl){ dateEl.textContent = fmtDate(article.publishedAt); try{ dateEl.setAttribute('datetime', new Date(article.publishedAt).toISOString()); }catch{} }
  const pageTitleEl = document.getElementById('pageTitle'); if(pageTitleEl) pageTitleEl.textContent = `${article.title} — India Daily`;
  const metaDesc = document.getElementById('metaDescription'); if(metaDesc) metaDesc.setAttribute('content', article.excerpt || '');
  const canonicalLink = document.getElementById('canonicalLink'); if(canonicalLink) canonicalLink.href = window.location.href.split('#')[0];

  // body render
  const bodyEl = document.getElementById('articleBody');
  if(bodyEl){
    if(article.contentHtml){
      bodyEl.innerHTML = article.contentHtml;
    } else if(article.content && Array.isArray(article.content)){
      bodyEl.innerHTML = article.content.map(p => `<p>${esc(p)}</p>`).join('');
    } else {
      bodyEl.innerHTML = `<p>${esc(article.excerpt || '')}</p>`;
    }
    // add small accessibility tweaks: ensure images have alt, links open safely
    Array.from(bodyEl.querySelectorAll('img')).forEach(img=>{
      if(!img.alt) img.alt = article.title || 'image';
      if(!img.loading) img.loading = 'lazy';
      img.decoding = 'async';
    });
    // make external links open in new tab
    Array.from(bodyEl.querySelectorAll('a')).forEach(a=>{
      try {
        const href = a.getAttribute('href') || '';
        if(href.startsWith('http') && !href.includes(location.host)) { a.setAttribute('target','_blank'); a.setAttribute('rel','noopener noreferrer'); }
      } catch(e){}
    });
  }

  // read time
  const rt = readTimeFromHtml(bodyEl ? bodyEl.innerHTML : '');
  const rtEl = document.getElementById('readTime'); if(rtEl) rtEl.textContent = `${rt} min read`;

  // author box
  const authorBox = document.getElementById('authorBox');
  if(authorBox){
    const author = article.author || {};
    authorBox.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${esc(author.avatar || 'images/default-avatar.png')}" alt="${esc(author.name || 'Author')}" style="width:72px;height:72px;border-radius:50%;object-fit:cover">
        <div class="info">
          <strong>${esc(author.name || 'India Daily')}</strong>
          <div style="color:#666;margin-top:6px">${esc(author.bio || '')}</div>
        </div>
      </div>
    `;
  }

  // related posts
  (function renderRelated(){
    const relatedContainer = document.getElementById('relatedList'); if(!relatedContainer) return;
    let grid = relatedContainer.querySelector('.related-grid'); if(!grid){ relatedContainer.innerHTML = `<h3>संबंधित पोस्ट</h3><div class="related-grid"></div>`; grid = relatedContainer.querySelector('.related-grid'); }
    const sameCat = items.filter(it => it.id !== article.id && String(it.category || '').toLowerCase() === String(article.category || '').toLowerCase());
    const fallback = items.filter(it => it.id !== article.id);
    const list = (sameCat.length ? sameCat : fallback).slice(0, 4);
    grid.innerHTML = list.map(it => `
      <a class="related-card" href="article.html?id=${it.id}">
        <div class="r-thumb"><img src="${esc(it.featuredImage)}" loading="lazy" alt="${esc(it.title)}"></div>
        <div class="r-body"><strong>${esc(it.title)}</strong><div class="meta" style="font-size:13px;color:#666;margin-top:6px">${fmtDate(it.publishedAt)}</div></div>
      </a>
    `).join('');
  })();

  // JSON-LD (NewsArticle)
  (function addLD(){
    try {
      const ld = {
        "@context":"https://schema.org",
        "@type":"NewsArticle",
        "headline": article.title || "",
        "image": article.featuredImage ? [ article.featuredImage ] : [],
        "datePublished": article.publishedAt || new Date().toISOString(),
        "author": { "@type":"Person", "name": article.author?.name || "India Daily" },
        "publisher": { "@type": "Organization", "name": "India Daily", "logo": { "@type":"ImageObject", "url": "images/india-daily-logo.jpg" } },
        "description": article.excerpt || ''
      };
      const s = document.createElement('script'); s.type = 'application/ld+json'; s.text = JSON.stringify(ld); document.head.appendChild(s);
    } catch(e){}
  })();

  // OG / twitter minimal tags (title/desc)
  (function setOG(){
    try {
      const setMeta = (type, name, content) => {
        if(!content) return;
        let m = document.querySelector(type==='prop' ? `meta[property="${name}"]` : `meta[name="${name}"]`);
        if(!m){ m = document.createElement('meta'); if(type==='prop') m.setAttribute('property', name); else m.setAttribute('name', name); document.head.appendChild(m); }
        m.setAttribute('content', content);
      };
      setMeta('prop','og:title', article.title || '');
      setMeta('prop','og:description', article.excerpt || '');
      setMeta('prop','og:image', article.featuredImage || '');
      setMeta('name','twitter:title', article.title || '');
      setMeta('name','twitter:description', article.excerpt || '');
    } catch(e){}
  })();

  // share buttons
  (function wireShareButtons(){
    const pageUrl = window.location.href;
    const fbBtn = document.getElementById('shareFb');
    if(fbBtn) fbBtn.addEventListener('click', () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank'));
    const xBtn = document.getElementById('shareX');
    if(xBtn) xBtn.addEventListener('click', () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(article.title||'')}`, '_blank'));
    const waBtn = document.getElementById('shareWa');
    if(waBtn) waBtn.addEventListener('click', () => window.open(`https://wa.me/?text=${encodeURIComponent((article.title||'') + ' ' + pageUrl)}`, '_blank'));
    const copyBtn = document.getElementById('copyLink');
    if(copyBtn) copyBtn.addEventListener('click', ()=> navigator.clipboard?.writeText(pageUrl).then(()=>alert('Link copied'), ()=>alert('Copy failed')));
  })();

  // reading progress improvement: update top thin bar
  (function readingProgress(){
    const bar = document.getElementById('readingProgressBar'); if(!bar) return;
    function update(){
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if(max <= 0) { bar.style.width = '0%'; return; }
      const pct = Math.round((h.scrollTop / max) * 100);
      bar.style.width = pct + '%';
    }
    document.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', update);
    update();
  })();

})();

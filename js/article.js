/* js/article.js
   Loads an article by ?id=<id> or ?slug=<slug>, renders page.
   - Uses window.allArticles if available (shared list from main.js) to avoid duplicate fetch.
   - Falls back to fetching data/articles.json if needed.
   - If no ?id provided, falls back to the first article (most recent).
   - Renders feature image, meta, body, author box, related posts (with dates).
   - Minimal and safe: does not change other files.
*/

(async function(){

  /* -------------------------
     Helper utilities
     ------------------------- */
  function getQueryParam(name){
    try {
      const url = new URL(window.location.href);
      return url.searchParams.get(name);
    } catch (e) {
      return null;
    }
  }

  function esc(s=''){ return String(s == null ? '' : s); }

  function fmtDate(d){
    if(!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  }

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

  /* -------------------------
     Load articles list (prefer global)
     ------------------------- */
  let items = (window.allArticles && Array.isArray(window.allArticles) && window.allArticles.slice()) || null;

  if(!items){
    // if window.allArticles not present, fetch data/articles.json
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

  /* -------------------------
     Find article to render
     - prefer ?id= then ?slug=
     - fallback to first article if none provided
     ------------------------- */
  const idParam = getQueryParam('id') || getQueryParam('slug') || null;
  let article = null;

  if(idParam){
    article = items.find(it => String(it.id) === String(idParam) || String(it.slug) === String(idParam));
    if(!article){
      showMessage('Article not found for id/slug: ' + esc(idParam));
      return;
    }
  } else {
    // no id param: fallback to first article (assume items sorted by date desc if provided by main)
    article = items[0];
  }

  /* -------------------------
     RENDER: Featured image + OG tag
     ------------------------- */
  const featWrap = document.getElementById('featuredImgWrap');
  if(featWrap){
    featWrap.innerHTML = '';
    if(article.featuredImage){
      // use esc for src only for safety (do not double-escape the URL)
      const img = document.createElement('img');
      img.src = esc(article.featuredImage);
      img.alt = esc(article.title || 'Featured image');
      img.loading = 'lazy';
      featWrap.appendChild(img);

      // set og:image meta tag (replace or create)
      let og = document.querySelector('meta[property="og:image"]');
      if(!og){
        og = document.createElement('meta');
        og.setAttribute('property','og:image');
        document.head.appendChild(og);
      }
      og.setAttribute('content', article.featuredImage);
    }
  }

  /* -------------------------
     RENDER: Title, meta, breadcrumbs
     ------------------------- */
  const titleEl = document.getElementById('articleTitle');
  if(titleEl) titleEl.textContent = article.title || '';

  const catEl = document.getElementById('articleCategory');
  if(catEl) catEl.textContent = article.category || '';

  const authEl = document.getElementById('articleAuthor');
  if(authEl) authEl.textContent = article.author?.name || 'India Daily';

  const dateEl = document.getElementById('articleDate');
  if(dateEl) dateEl.textContent = fmtDate(article.publishedAt);

  // page title and meta
  const pageTitleEl = document.getElementById('pageTitle');
  if(pageTitleEl) pageTitleEl.textContent = `${article.title} — India Daily`;
  const metaDesc = document.getElementById('metaDescription');
  if(metaDesc) metaDesc.setAttribute('content', article.excerpt || '');

  // breadcrumbs (if elements exist in template)
  const bcCategory = document.getElementById('bcCategory');
  if(bcCategory){
    bcCategory.textContent = article.category || 'News';
    bcCategory.setAttribute('href', `category.html?cat=${encodeURIComponent(article.category||'')}`);
  }
  const bcTitle = document.getElementById('bcTitle');
  if(bcTitle) bcTitle.textContent = article.title || '';

  /* -------------------------
     RENDER: Article body
     - supports contentHtml, or content array, or excerpt fallback
     ------------------------- */
  const bodyEl = document.getElementById('articleBody');
  if(bodyEl){
    if(article.contentHtml){
      bodyEl.innerHTML = article.contentHtml;
    } else if(article.content && Array.isArray(article.content)){
      bodyEl.innerHTML = article.content.map(p => `<p>${esc(p)}</p>`).join('');
    } else {
      bodyEl.innerHTML = `<p>${esc(article.excerpt || '')}</p>`;
    }
  }

  // read time
  const rt = readTimeFromHtml(bodyEl ? bodyEl.innerHTML : '');
  const rtEl = document.getElementById('readTime');
  if(rtEl) rtEl.textContent = `${rt} min read`;

  /* -------------------------
     AUTHOR BOX
     ------------------------- */
  const authorBox = document.getElementById('authorBox');
  if(authorBox){
    const author = article.author || {};
    // create safe markup
    authorBox.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${esc(author.avatar || 'images/default-avatar.png')}" alt="${esc(author.name || 'Author')}" style="width:64px;height:64px;border-radius:50%;object-fit:cover">
        <div>
          <strong>${esc(author.name || 'India Daily')}</strong>
          <div style="color:#666;margin-top:6px">${esc(author.bio || '')}</div>
        </div>
      </div>
    `;
  }

  /* -------------------------
     RELATED POSTS (show date)
     - Uses items (window.allArticles or fetched list)
     - First try same category (exclude current), else fallback to latest excluding current
     - Renders up to 4 items
     ------------------------- */
  (function renderRelated(){
    const relatedContainer = document.getElementById('relatedList');
    if(!relatedContainer) return;

    // ensure inner related-grid exists (if template expects it)
    let grid = relatedContainer.querySelector('.related-grid');
    if(!grid){
      // create a default structure
      relatedContainer.innerHTML = `<h3>संबंधित पोस्ट</h3><div class="related-grid"></div>`;
      grid = relatedContainer.querySelector('.related-grid');
    }

    // pick related items
    const sameCat = items.filter(it => it.id !== article.id && String(it.category || '').toLowerCase() === String(article.category || '').toLowerCase());
    const fallback = items.filter(it => it.id !== article.id);
    const list = (sameCat.length ? sameCat : fallback).slice(0, 4);

    grid.innerHTML = list.map(it => `
      <a class="related-card" href="article.html?id=${it.id}" style="display:flex;gap:10px;align-items:flex-start;text-decoration:none;color:inherit;padding:8px;background:#fff;border-radius:8px">
        <div class="r-thumb" style="width:120px;height:80px;overflow:hidden;border-radius:6px"><img src="${esc(it.featuredImage)}" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>
        <div class="r-body">
          <strong style="display:block">${esc(it.title)}</strong>
          <div class="meta" style="font-size:13px;color:#666;margin-top:6px">${fmtDate(it.publishedAt)}</div>
        </div>
      </a>
    `).join('');
  })();

  /* -------------------------
     JSON-LD for SEO (NewsArticle)
     ------------------------- */
  (function addLD(){
    try {
      const ld = {
        "@context":"https://schema.org",
        "@type":"NewsArticle",
        "headline": article.title || "",
        "image": article.featuredImage ? [ article.featuredImage ] : [],
        "datePublished": article.publishedAt || new Date().toISOString(),
        "author": { "@type":"Person", "name": article.author?.name || "India Daily" },
        "publisher": { "@type": "Organization", "name": "India Daily", "logo": { "@type":"ImageObject", "url":"images/india-daily-logo.jpg" } },
        "description": article.excerpt || ''
      };
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.text = JSON.stringify(ld);
      document.head.appendChild(s);
    } catch(e){
      // ignore
    }
  })();

  /* -------------------------
     SHARE BUTTONS (FB, X, WA)
     - Buttons expected with IDs: shareFb, shareX, shareWa
     ------------------------- */
  (function wireShareButtons(){
    const pageUrl = window.location.href;
    const fbBtn = document.getElementById('shareFb');
    if(fbBtn) fbBtn.addEventListener('click', () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank');
    });
    const xBtn = document.getElementById('shareX');
    if(xBtn) xBtn.addEventListener('click', () => {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(article.title || '')}`, '_blank');
    });
    const waBtn = document.getElementById('shareWa');
    if(waBtn) waBtn.addEventListener('click', () => {
      window.open(`https://wa.me/?text=${encodeURIComponent((article.title||'') + ' ' + pageUrl)}`, '_blank');
    });
  })();

  /* -------------------------
     Done. Page rendered.
     ------------------------- */

})();

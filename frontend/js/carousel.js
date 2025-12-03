// carousel.js
export async function initHero() {
  const res = await fetch('./data/articles.json');
  const json = await res.json();
  const items = json.items || [];

  const slides = items.slice(0, 4);
  const slider = document.getElementById('hero-slider');
  const leftList = document.getElementById('left-list');
  const rightCard = document.getElementById('right-feature-card');
  if(!slider) return;

  slider.innerHTML = slides.map(s => `
    <div class="hero-slide" data-id="${s.id}">
      <img src="${escapeHtml(s.featuredImage)}" alt="${escapeHtml(s.title)}" loading="lazy"/>
      <div class="slide-content">
        <div class="kicker">${s.category || ''}</div>
        <h2>${escapeHtml(s.title)}</h2>
        <div class="meta">${formatDate(s.publishedAt)} • ${s.author?.name || ''}</div>
      </div>
    </div>
  `).join('');

  const leftItems = items.slice(4, 9);
  leftList.innerHTML = leftItems.map(it => `
    <a href="article.html?id=${it.id}" class="small-item" data-id="${it.id}">
      <img src="${escapeHtml(it.featuredImage)}" alt="${escapeHtml(it.title)}" loading="lazy" />
      <div class="small-text">
        <strong>${escapeHtml(it.title)}</strong>
        <div class="meta">${formatDate(it.publishedAt)}</div>
      </div>
    </a>
  `).join('');

  const right = slides[1] || slides[0];
  if(rightCard && right) {
    rightCard.innerHTML = `
      <div class="feature-card">
        <img src="${escapeHtml(right.featuredImage)}" alt="${escapeHtml(right.title)}" loading="lazy"/>
        <div class="title">${escapeHtml(right.title)}</div>
      </div>
    `;
  }

  let index = 0;
  const total = slides.length;
  const nextBtn = document.getElementById('heroNext');
  const prevBtn = document.getElementById('heroPrev');

  function show(i){
    const offset = -i * slider.clientWidth;
    slider.style.transform = `translateX(${offset}px)`;
  }
  function next(){ index = (index + 1) % total; show(index); }
  function prev(){ index = (index - 1 + total) % total; show(index); }

  let timer = setInterval(next, 5000);
  if(nextBtn) nextBtn.addEventListener('click', ()=>{ next(); resetTimer(); });
  if(prevBtn) prevBtn.addEventListener('click', ()=>{ prev(); resetTimer(); });
  slider.addEventListener('mouseenter', ()=> clearInterval(timer));
  slider.addEventListener('mouseleave', ()=> timer = setInterval(next, 5000));
  function resetTimer(){ clearInterval(timer); timer = setInterval(next, 5000); }

  function formatDate(d){
    if(!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  }
  function escapeHtml(text=''){ return String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
  window.addEventListener('resize', ()=> show(index));
}

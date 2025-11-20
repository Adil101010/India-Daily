document.addEventListener('DOMContentLoaded', async () => {
  // load data from your existing articles JSON (same as frontend)
  try {
    const res = await fetch('../data/articles.json');
    const j = await res.json();
    const items = j.items || [];
    document.getElementById('totalNews').textContent = items.length;
    document.getElementById('draftNews').textContent = items.filter(i => i.status === 'draft' || i.status === 'Draft').length || 0;
    const cats = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
    document.getElementById('totalCategories').textContent = cats.length;
    document.getElementById('totalViews').textContent = items.reduce((s,i) => s + (i.views||0), 0) || '—';

    const recent = items.slice(0,6);
    const recentList = document.getElementById('recentList');
    recentList.innerHTML = recent.map(it => `
      <a class="small-card" href="../article.html?id=${it.id}">
        <div class="thumb"><img src="${it.featuredImage}" alt="${it.title}"></div>
        <div class="small-text"><strong>${it.title}</strong><div class="meta">${new Date(it.publishedAt).toLocaleDateString('en-GB')}</div></div>
      </a>
    `).join('');
  } catch (e) {
    console.warn('admin dashboard load error', e);
  }

  // Logout stub
  document.getElementById('adminLogout').addEventListener('click', () => {
    alert('Logged out (stub). Integrate with backend auth.');
    window.location.href = 'login.html';
  });
});

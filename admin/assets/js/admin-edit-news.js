async function loadArticleForEdit() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) return;
  try {
    const res = await fetch('../data/articles.json');
    const j = await res.json();
    const item = (j.items || []).find(x => String(x.id) === String(id));
    if (!item) return;
    document.getElementById('newsId').value = item.id;
    document.getElementById('title').value = item.title || '';
    document.getElementById('category').value = item.category || '';
    document.getElementById('status').value = item.status || 'Draft';
    document.getElementById('content').value = item.content || item.excerpt || '';
    if (item.featuredImage) {
      const p = document.getElementById('preview');
      p.innerHTML = `<img src="${item.featuredImage}" style="max-width:220px;border-radius:6px"/>`;
    }
  } catch (e) { console.warn('load edit item', e); }
}

document.getElementById('editNewsForm').addEventListener('submit', function(e){
  e.preventDefault();
  document.getElementById('msg').textContent = 'Update simulated locally — call backend API to persist changes.';
  setTimeout(()=> window.location.href='all-news.html', 900);
});

document.addEventListener('DOMContentLoaded', loadArticleForEdit);

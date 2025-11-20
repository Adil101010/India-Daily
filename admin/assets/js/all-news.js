async function loadNews() {
  try {
    const res = await fetch('../data/articles.json');
    const j = await res.json();
    const items = j.items || [];
    const tbody = document.getElementById('newsTableBody');
    tbody.innerHTML = items.map(it => `
      <tr>
        <td>${it.id}</td>
        <td><strong style="color:#111">${it.title}</strong></td>
        <td>${it.category || '—'}</td>
        <td style="color:${it.status==='Published'?'green':'#d67a00'}">${it.status || 'Draft'}</td>
        <td>${new Date(it.publishedAt).toLocaleDateString('en-GB')}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editNews(${it.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteNews(${it.id})">Delete</button>
        </td>
      </tr>
    `).join('');

    // search
    document.getElementById('searchInput').addEventListener('input', function(){
      const term = this.value.toLowerCase();
      Array.from(tbody.querySelectorAll('tr')).forEach(row=>{
        const txt = row.textContent.toLowerCase();
        row.style.display = txt.includes(term) ? '' : 'none';
      });
    });
  } catch (e) {
    console.warn('loadNews error', e);
  }
}

function editNews(id){ window.location.href = `edit-news.html?id=${id}`; }
function deleteNews(id){ if(confirm('Are you sure to delete id '+id+'? (This is frontend stub — integrate backend)')){ alert('Call backend to delete.'); } }

document.addEventListener('DOMContentLoaded', loadNews);

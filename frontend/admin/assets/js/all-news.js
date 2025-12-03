const API_BASE = "http://localhost:8080/api/news";

const token = localStorage.getItem("admin_token");

if (!token || token.trim() === "") {
  window.location.href = "login.html";
}

// FETCH ALL NEWS
async function fetchAllNews() {
  try {
    const res = await fetch(`${API_BASE}/all`, {
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
      }
    });

    if (res.status === 401 || res.status === 403) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("admin_token");
      window.location.href = "login.html";
      return;
    }

    if (!res.ok) throw new Error("Failed to load news");

    const news = await res.json();
    console.log("✅ News loaded:", news);
    renderTable(news);

  } catch (err) {
    console.error("Failed to fetch news:", err);
    document.getElementById("newsTableBody").innerHTML =
      `<tr><td colspan="6" style="color:red; padding:20px; text-align:center;">Unable to load news. Check console.</td></tr>`;
  }
}

// RENDER TABLE
function renderTable(list) {
  const tbody = document.getElementById("newsTableBody");

  if (!Array.isArray(list) || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">No news found</td></tr>`;
    return;
  }

  let html = "";
  list.forEach(n => {
    const date = n.publishedAt 
      ? new Date(n.publishedAt).toLocaleDateString('en-IN')
      : "-";

    const title = escapeHtml(n.title || "Untitled");
    const category = escapeHtml(n.category || "-");

    html += `
      <tr>
        <td>${n.id}</td>
        <td style="max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" 
            title="${title}">
            ${title}
        </td>
        <td>${category}</td>
        <td>${n.status || "DRAFT"}</td>
        <td>${date}</td>
        <td>
          <a class="btn" href="edit-news.html?id=${n.id}">Edit</a>
          <button class="btn btn-danger" onclick="deleteNews(${n.id})">Delete</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ESCAPE HTML
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// DELETE NEWS
async function deleteNews(id) {
  if (!confirm(`Delete news ID ${id}? This cannot be undone.`)) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (res.status === 401 || res.status === 403) {
      alert("Session expired.");
      localStorage.removeItem("admin_token");
      window.location.href = "login.html";
      return;
    }

    if (res.ok) {
      alert("News deleted successfully!");
      fetchAllNews();
    } else {
      alert("Delete failed!");
    }

  } catch (err) {
    console.error("Delete error:", err);
    alert("Network error!");
  }
}

// SEARCH
document.getElementById("searchInput").addEventListener("input", function () {
  const q = this.value.trim().toLowerCase();
  const rows = document.querySelectorAll("#newsTableBody tr");

  rows.forEach(r => {
    const title = (r.children[1]?.textContent || "").toLowerCase();
    const cat   = (r.children[2]?.textContent || "").toLowerCase();
    
    if (title.includes(q) || cat.includes(q)) r.style.display = "";
    else r.style.display = "none";
  });
});

// LOGOUT
const logoutLink = document.getElementById("logoutLink");
if (logoutLink) {
  logoutLink.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
  });
}

// INITIAL LOAD
fetchAllNews();

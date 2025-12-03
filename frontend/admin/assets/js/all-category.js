const API = "http://localhost:8080/api";

// TOKEN CHECK
const token = localStorage.getItem("admin_token");
if (!token || token.trim() === "") {
  window.location.href = "login.html";
}

// LOGOUT
const logoutLink = document.getElementById("logoutLink");
if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
  });
}

// LOAD CATEGORIES
async function loadCategories() {
  const body = document.getElementById("categoryTableBody");
  
  try {
    const res = await fetch(`${API}/public/category/all`);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const list = await res.json();
    console.log("✅ Categories loaded:", list);

    if (!Array.isArray(list) || list.length === 0) {
      body.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">No categories found</td></tr>`;
      return;
    }

    body.innerHTML = "";

    list.forEach(cat => {
      body.innerHTML += `
        <tr>
          <td>${cat.id}</td>
          <td>${escapeHtml(cat.name || "Unnamed")}</td>
          <td>${escapeHtml(cat.slug || "-")}</td>
          <td>
            <a class="btn" href="edit-category.html?id=${cat.id}">Edit</a>
            <button class="btn-danger" onclick="deleteCategory(${cat.id})">Delete</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("❌ Load error:", err);
    body.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center; padding:20px;">Failed to load categories</td></tr>`;
  }
}

// ESCAPE HTML
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// DELETE CATEGORY
async function deleteCategory(id) {
  if (!confirm("Delete this category? This action cannot be undone.")) return;

  try {
    const res = await fetch(`${API}/admin/category/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (res.status === 401 || res.status === 403) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("admin_token");
      window.location.href = "login.html";
      return;
    }

    if (res.ok) {
      alert("✅ Category deleted successfully!");
      loadCategories();
    } else {
      const errorText = await res.text();
      alert("❌ Delete failed: " + errorText);
    }

  } catch (err) {
    console.error("❌ Delete error:", err);
    alert("❌ Network error!");
  }
}

// INITIAL LOAD
loadCategories();

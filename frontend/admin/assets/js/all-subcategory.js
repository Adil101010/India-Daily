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

// LOAD SUBCATEGORIES
async function loadSubCategories() {
  const body = document.getElementById("subTableBody");
  
  try {
    const res = await fetch(`${API}/public/subcategory/all`);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const list = await res.json();
    console.log("✅ Subcategories loaded:", list);

    if (!Array.isArray(list) || list.length === 0) {
      body.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">No subcategories found</td></tr>`;
      return;
    }

    body.innerHTML = "";

    list.forEach(s => {
      const categoryName = s.category?.name || "-";
      
      body.innerHTML += `
        <tr>
          <td>${s.id}</td>
          <td>${escapeHtml(s.name || "Unnamed")}</td>
          <td>${escapeHtml(s.slug || "-")}</td>
          <td>${escapeHtml(categoryName)}</td>
          <td>
            <a class="btn" href="edit-subcategory.html?id=${s.id}">Edit</a>
            <button class="btn-danger" onclick="deleteSub(${s.id})">Delete</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("❌ Load error:", err);
    body.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center; padding:20px;">Failed to load subcategories</td></tr>`;
  }
}

// ESCAPE HTML
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// DELETE SUBCATEGORY
async function deleteSub(id) {
  if (!confirm("Delete this subcategory? This action cannot be undone.")) return;

  try {
    const res = await fetch(`${API}/admin/subcategory/delete/${id}`, {
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
      alert("✅ Subcategory deleted successfully!");
      loadSubCategories();
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
loadSubCategories();

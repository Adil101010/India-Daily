const API_BASE = "http://localhost:8080/api/news";
const API = "http://localhost:8080/api";

// --------------------------------------------------
// 1. TOKEN CHECK
// --------------------------------------------------
const token = localStorage.getItem("admin_token");
if (!token) {
  window.location.href = "login.html";
}

// --------------------------------------------------
// 2. GET NEWS ID FROM URL
// --------------------------------------------------
const params = new URLSearchParams(window.location.search);
const newsId = params.get("id");

if (!newsId) {
  alert("Invalid news ID!");
  window.location.href = "all-news.html";
}

/* --------------------------------------------------
   3A. LOAD CATEGORIES (NEW)
-------------------------------------------------- */
async function loadCategories(selectedCategoryName = "") {
  try {
    const res = await fetch(`${API}/public/category/all`);
    const data = await res.json();

    const catSel = document.getElementById("category");
    catSel.innerHTML = `<option value="">Select Category</option>`;

    data.forEach(c => {
      const sel = (c.name === selectedCategoryName) ? "selected" : "";
      catSel.innerHTML += `<option value="${c.name}" ${sel}>${c.name}</option>`;
    });

  } catch (err) {
    console.error("Category load error:", err);
  }
}

/* --------------------------------------------------
   3B. LOAD SUBCATEGORIES (NEW)
-------------------------------------------------- */
async function loadSubcategories(categoryName, selectedSub = "") {
  const subSel = document.getElementById("subcategory");

  if (!categoryName) {
    subSel.innerHTML = `<option value="">Select Category First</option>`;
    return;
  }

  try {
    // Step 1: Get selected category ID by name
    const resCat = await fetch(`${API}/public/category/all`);
    const categories = await resCat.json();
    const found = categories.find(c => c.name === categoryName);
    if (!found) return;

    // Step 2: Load subcategories
    const res = await fetch(`${API}/public/subcategory/by-category/${found.id}`);
    const subs = await res.json();

    subSel.innerHTML = `<option value="">Select Subcategory</option>`;

    subs.forEach(s => {
      const sel = (s.name === selectedSub) ? "selected" : "";
      subSel.innerHTML += `<option value="${s.name}" ${sel}>${s.name}</option>`;
    });

  } catch (err) {
    console.error("Subcategory load error:", err);
  }
}

// Change event — load subcategories dynamically
document.getElementById("category").addEventListener("change", function () {
  loadSubcategories(this.value);
});

/* --------------------------------------------------
   4. LOAD EXISTING NEWS DETAILS
-------------------------------------------------- */
(async function loadNews() {
  try {
    const res = await fetch(`${API_BASE}/${newsId}`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    // Fill data (existing code preserved)
    document.getElementById("title").value = data.title;
    document.getElementById("author").value = data.author?.name || "";
    document.getElementById("status").value = data.status;
    document.getElementById("content").value = data.content;
    document.getElementById("featured").checked = data.featured || false;
    document.getElementById("breaking").checked = data.breaking || false;

    if (data.imageUrl) {
      document.getElementById("preview").innerHTML =
        `<img src="${data.imageUrl}" alt="Current Image">`;
    }

    // 🔥 NEW — Load categories + subcategories and preselect
    await loadCategories(data.category);
    await loadSubcategories(data.category, data.subcategory);

  } catch (err) {
    console.error("Load Error:", err);
    alert("Failed to load news.");
  }
})();

/* --------------------------------------------------
   5. IMAGE PREVIEW
-------------------------------------------------- */
document.getElementById("image").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById("preview").innerHTML =
      `<img src="${e.target.result}" alt="New Preview">`;
  };
  reader.readAsDataURL(file);
});

/* --------------------------------------------------
   6. UPDATE NEWS
-------------------------------------------------- */
document.getElementById("editNewsForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  let msg = document.getElementById("msg");
  msg.innerText = "Updating...";
  msg.style.color = "black";

  try {
    const fd = new FormData();

    // Main fields
    fd.append("title", document.getElementById("title").value);
    fd.append("author", document.getElementById("author").value);
    fd.append("status", document.getElementById("status").value);
    fd.append("content", document.getElementById("content").value);

    // NEW — Dynamic dropdown values
    fd.append("category", document.getElementById("category").value);
    fd.append("subcategory", document.getElementById("subcategory").value);

    fd.append("featured", document.getElementById("featured").checked);
    fd.append("breaking", document.getElementById("breaking").checked);

    const img = document.getElementById("image").files[0];
    if (img) fd.append("image", img);

    const res = await fetch(`${API_BASE}/${newsId}`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token
      },
      body: fd
    });

    if (res.ok) {
      msg.style.color = "green";
      msg.innerText = "News Updated Successfully!";
      setTimeout(() => window.location.href = "all-news.html", 1000);
    } else {
      msg.style.color = "red";
      msg.innerText = "Failed to update news!";
    }

  } catch (err) {
    console.error("Update Error:", err);
    msg.style.color = "red";
    msg.innerText = "Network Error!";
  }
});

/* --------------------------------------------------
   7. LOGOUT
-------------------------------------------------- */
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("admin_token");
  window.location.href = "login.html";
});

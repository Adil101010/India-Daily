const API_URL = "http://localhost:8080/api/news/add";
const API = "http://localhost:8080/api";

// TOKEN CHECK
const token = localStorage.getItem("admin_token");
if (!token || token.trim() === "") {
  window.location.href = "login.html";
}

// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
  });
}

// LOAD CATEGORIES
async function loadCategories() {
  const catSel = document.getElementById("categorySelect");
  if (!catSel) return;

  try {
    const res = await fetch(`${API}/public/category/all`);

    if (!res.ok) {
      console.error("Category API error, status =", res.status);
      catSel.innerHTML = `<option value="">Failed to load categories</option>`;
      return;
    }

    const data = await res.json();
    console.log("✅ Categories loaded:", data);

    catSel.innerHTML = `<option value="">Select Category</option>`;

    data.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name || "";
      opt.dataset.id = c.id || "";
      opt.textContent = c.name || `Category ${c.id}`;
      catSel.appendChild(opt);
    });

  } catch (err) {
    console.error("Category load error:", err);
    catSel.innerHTML = `<option value="">Failed to load</option>`;
  }
}

// LOAD SUBCATEGORIES AFTER CATEGORY SELECT
document.getElementById("categorySelect").addEventListener("change", async function () {
  const selectedOpt = this.options[this.selectedIndex];
  const categoryId = selectedOpt ? selectedOpt.dataset.id : null;

  const subSel = document.getElementById("subcategorySelect");
  if (!subSel) return;

  if (!categoryId) {
    subSel.innerHTML = `<option value="">Select Category First</option>`;
    return;
  }

  subSel.innerHTML = `<option value="">Loading...</option>`;

  try {
    const res = await fetch(`${API}/public/subcategory/by-category/${categoryId}`);

    if (!res.ok) {
      console.error("Subcategory API error, status =", res.status);
      subSel.innerHTML = `<option value="">Failed to load</option>`;
      return;
    }

    const subs = await res.json();
    console.log("✅ Subcategories loaded:", subs);

    subSel.innerHTML = `<option value="">Select Subcategory (Optional)</option>`;

    subs.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.name || "";
      opt.textContent = s.name || `Sub ${s.id}`;
      subSel.appendChild(opt);
    });

  } catch (err) {
    console.error("Subcategory load error:", err);
    subSel.innerHTML = `<option value="">Failed to load</option>`;
  }
});

// IMAGE PREVIEW
document.getElementById("image").addEventListener("change", function() {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById("preview").innerHTML =
      `<img src="${e.target.result}" alt="Preview" />`;
  };
  reader.readAsDataURL(file);
});

// FORM SUBMIT
const form = document.getElementById("addNewsForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  msg.className = "show";
  msg.textContent = "Processing...";
  msg.style.background = "#fff3cd";
  msg.style.color = "#856404";

  try {
    const fd = new FormData();

    fd.append("title", document.getElementById("title").value);
    fd.append("author", document.getElementById("author").value);
    fd.append("status", document.getElementById("status").value);
    fd.append("content", document.getElementById("content").value);

    const catName = document.getElementById("categorySelect").value || "";
    const subName = document.getElementById("subcategorySelect").value || "";

    fd.append("category", catName);
    fd.append("subcategory", subName);

    const img = document.getElementById("image").files[0];
    if (img) fd.append("image", img);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token
      },
      body: fd
    });

    if (res.status === 401 || res.status === 403) {
      msg.className = "show error";
      msg.textContent = "Session expired. Login again!";
      localStorage.removeItem("admin_token");
      setTimeout(() => window.location.href = "login.html", 1500);
      return;
    }

    if (res.ok) {
      msg.className = "show success";
      msg.textContent = "✅ News Added Successfully!";
      setTimeout(() => window.location.href = "all-news.html", 1000);
    } else {
      const txt = await res.text();
      msg.className = "show error";
      msg.textContent = "Error: " + txt;
    }

  } catch (err) {
    console.error(err);
    msg.className = "show error";
    msg.textContent = "Network error! Check console.";
  }
});

// INITIAL LOAD
loadCategories();

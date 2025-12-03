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

// GET ID FROM URL
const params = new URLSearchParams(location.search);
const id = params.get("id");

if (!id) {
  alert("Invalid subcategory ID!");
  window.location.href = "all-subcategory.html";
}

// LOAD CATEGORIES
async function loadCategories() {
  const sel = document.getElementById("parentCategory");
  
  try {
    const res = await fetch(`${API}/public/category/all`);
    
    if (!res.ok) {
      throw new Error("Failed to load categories");
    }
    
    const list = await res.json();
    console.log("✅ Categories loaded:", list);

    sel.innerHTML = "";

    list.forEach(cat => {
      sel.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });

  } catch (err) {
    console.error("❌ Category load error:", err);
    sel.innerHTML = `<option value="">Failed to load</option>`;
  }
}

// LOAD SUBCATEGORY DATA
async function loadSubcategory() {
  try {
    const res = await fetch(`${API}/public/subcategory/all`);
    
    if (!res.ok) {
      throw new Error("Failed to load subcategory");
    }
    
    const all = await res.json();
    const s = all.find(x => x.id == id);
    
    if (!s) {
      alert("Subcategory not found!");
      window.location.href = "all-subcategory.html";
      return;
    }

    console.log("✅ Subcategory loaded:", s);

    document.getElementById("subName").value = s.name;
    document.getElementById("parentCategory").value = s.category?.id;

  } catch (err) {
    console.error("❌ Load error:", err);
    alert("Failed to load subcategory data!");
  }
}

// INITIAL LOAD
loadCategories().then(loadSubcategory);

// UPDATE SUBCATEGORY
document.getElementById("saveBtn").addEventListener("click", async () => {
  const name = document.getElementById("subName").value.trim();
  const categoryId = document.getElementById("parentCategory").value;
  const msg = document.getElementById("msg");
  const btn = document.getElementById("saveBtn");

  // Validation
  if (!categoryId || categoryId === "") {
    msg.className = "show error";
    msg.textContent = "❌ Please select a parent category!";
    return;
  }

  if (!name || name === "") {
    msg.className = "show error";
    msg.textContent = "❌ Please enter subcategory name!";
    return;
  }

  // Disable button
  btn.disabled = true;
  btn.textContent = "Updating...";
  msg.className = "show";
  msg.style.background = "#fff3cd";
  msg.style.color = "#856404";
  msg.textContent = "⏳ Processing...";

  try {
    const url = `${API}/admin/subcategory/update/${id}?name=${encodeURIComponent(name)}&categoryId=${categoryId}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token  // ✅ FIXED: Added token
      }
    });

    if (res.status === 401 || res.status === 403) {
      msg.className = "show error";
      msg.textContent = "❌ Session expired. Please login again.";
      localStorage.removeItem("admin_token");
      setTimeout(() => window.location.href = "login.html", 1500);
      return;
    }

    if (res.ok) {
      msg.className = "show success";
      msg.textContent = "✅ Subcategory updated successfully!";

      setTimeout(() => {
        window.location.href = "all-subcategory.html";
      }, 1000);
    } else {
      const errorText = await res.text();
      msg.className = "show error";
      msg.textContent = "❌ Failed: " + errorText;
      btn.disabled = false;
      btn.textContent = "Update Subcategory";
    }

  } catch (err) {
    console.error("❌ Update error:", err);
    msg.className = "show error";
    msg.textContent = "❌ Network error! Check console.";
    btn.disabled = false;
    btn.textContent = "Update Subcategory";
  }
});

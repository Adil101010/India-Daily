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

// LOAD ALL PARENT CATEGORIES
async function loadCategories() {
  const sel = document.getElementById("parentCategory");
  
  try {
    const res = await fetch(`${API}/public/category/all`);
    
    if (!res.ok) {
      throw new Error("Failed to load categories");
    }
    
    const list = await res.json();
    console.log("✅ Categories loaded:", list);

    sel.innerHTML = `<option value="">Select Parent Category</option>`;

    list.forEach(cat => {
      sel.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });

  } catch (err) {
    console.error("❌ Category load error:", err);
    sel.innerHTML = `<option value="">Failed to load categories</option>`;
  }
}

loadCategories();

// SAVE SUBCATEGORY
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
  btn.textContent = "Saving...";
  msg.className = "show";
  msg.style.background = "#fff3cd";
  msg.style.color = "#856404";
  msg.textContent = "⏳ Processing...";

  try {
    const url = `${API}/admin/subcategory/add?name=${encodeURIComponent(name)}&categoryId=${categoryId}`;

    const res = await fetch(url, {
      method: "POST",
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
      msg.textContent = "✅ Subcategory added successfully!";

      setTimeout(() => {
        window.location.href = "all-subcategory.html";
      }, 1000);
    } else {
      const errorText = await res.text();
      msg.className = "show error";
      msg.textContent = "❌ Failed: " + errorText;
      btn.disabled = false;
      btn.textContent = "Save Subcategory";
    }

  } catch (err) {
    console.error("❌ Save error:", err);
    msg.className = "show error";
    msg.textContent = "❌ Network error! Check console.";
    btn.disabled = false;
    btn.textContent = "Save Subcategory";
  }
});

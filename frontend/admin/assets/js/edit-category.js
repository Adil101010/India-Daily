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
  alert("Invalid category ID!");
  window.location.href = "all-category.html";
}

// LOAD CATEGORY DATA (FIXED: Fetch all then find by ID)
async function loadCategory() {
  try {
    // ✅ FIXED: Get all categories first
    const res = await fetch(`${API}/public/category/all`);
    
    if (!res.ok) {
      throw new Error("Failed to load categories");
    }
    
    const allCategories = await res.json();
    console.log("✅ All categories loaded:", allCategories);

    // Find category by ID
    const category = allCategories.find(cat => cat.id == id);
    
    if (!category) {
      throw new Error("Category not found");
    }

    console.log("✅ Category found:", category);
    document.getElementById("catName").value = category.name;

  } catch (err) {
    console.error("❌ Load error:", err);
    alert("Failed to load category data: " + err.message);
    window.location.href = "all-category.html";
  }
}

loadCategory();

// UPDATE CATEGORY
document.getElementById("saveBtn").addEventListener("click", async () => {
  const name = document.getElementById("catName").value.trim();
  const msg = document.getElementById("msg");
  const btn = document.getElementById("saveBtn");

  // Validation
  if (!name || name === "") {
    msg.className = "show error";
    msg.textContent = "❌ Please enter category name!";
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
    const url = `${API}/admin/category/update/${id}?name=${encodeURIComponent(name)}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token
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
      msg.textContent = "✅ Category updated successfully!";

      setTimeout(() => {
        window.location.href = "all-category.html";
      }, 1000);
    } else {
      const errorText = await res.text();
      msg.className = "show error";
      msg.textContent = "❌ Failed: " + errorText;
      btn.disabled = false;
      btn.textContent = "Update Category";
    }

  } catch (err) {
    console.error("❌ Update error:", err);
    msg.className = "show error";
    msg.textContent = "❌ Network error! Check console.";
    btn.disabled = false;
    btn.textContent = "Update Category";
  }
});

// -------------------------------------
// 1. TOKEN CHECK
// -------------------------------------
const token = localStorage.getItem("admin_token");

if (!token || token.trim() === "") {
    window.location.href = "login.html";
}

// -------------------------------------
// 1.1 LOAD ADMIN NAME (from localStorage)
// -------------------------------------
function loadAdminName() {
    try {
        const adminInfo = localStorage.getItem("admin_info");
        if (adminInfo) {
            const admin = JSON.parse(adminInfo);
            document.getElementById("adminName").textContent = 
                `Welcome, ${admin.name}!`;
        }
    } catch (err) {
        console.error("Admin name load failed:", err);
    }
}

loadAdminName();

// -------------------------------------
// 2. LOAD ALL ADMINS FROM BACKEND
// -------------------------------------
async function loadAdmins() {
    console.log("🔵 Loading admins...");
    console.log("🔑 Token:", token);
    
    try {
        const res = await fetch("http://localhost:8080/api/admin/all", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        console.log("📡 Response status:", res.status);

        if (!res.ok) {
            console.error("❌ Failed to fetch admins, status:", res.status);
            return;
        }

        const admins = await res.json();
        console.log("✅ Admins loaded:", admins);
        console.log("📊 Total count:", admins.length);

        const table = document.getElementById("adminTable");
        
        if (!table) {
            console.error("❌ adminTable element not found!");
            return;
        }

        table.innerHTML = "";

        admins.forEach(a => {
            table.innerHTML += `
                <tr>
                    <td>${a.id}</td>
                    <td>${a.name}</td>
                    <td>${a.email}</td>
                    <td>${a.role || 'ADMIN'}</td>
                    <td>
                        <button class="edit-btn" onclick="editAdmin(${a.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteAdmin(${a.id})">Delete</button>
                    </td>
                </tr>
            `;
        });

        // Dashboard Stats
        const totalAdminsEl = document.getElementById("totalAdmins");
        if (totalAdminsEl) {
            totalAdminsEl.textContent = admins.length;
            console.log("✅ Total Admins updated to:", admins.length);
        } else {
            console.error("❌ totalAdmins element not found!");
        }

    } catch (err) {
        console.error("❌ Failed to load admins:", err);
    }
}

loadAdmins();

       

// -------------------------------------
// 3. DELETE ADMIN
// -------------------------------------
async function deleteAdmin(id) {
    if (!confirm("Are you sure?")) return;

    try {
        const res = await fetch(`http://localhost:8080/api/admin/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (res.ok) {
            alert("Admin Deleted!");
            loadAdmins();
        }

    } catch (err) {
        console.error("Delete failed:", err);
    }
}

// -------------------------------------
// 4. EDIT ADMIN
// -------------------------------------
function editAdmin(id) {
    localStorage.setItem("edit_admin_id", id);
    window.location.href = "edit-admin.html";
}

// -------------------------------------
// 5. TOTAL NEWS COUNT
// -------------------------------------
async function loadTotalNews() {
    try {
        // ✅ CORRECT: Fetch all news and count
        const res = await fetch("http://localhost:8080/api/public/news/latest?limit=1000", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (res.ok) {
            const news = await res.json();
            document.getElementById("totalNews").textContent = news.length;
        }
    } catch (err) {
        console.error("News count error:", err);
        document.getElementById("totalNews").textContent = "0";
    }
}

loadTotalNews();

// -------------------------------------
// 6. TOTAL CATEGORIES COUNT
// -------------------------------------
async function loadTotalCategories() {
    try {
        // ✅ CORRECT: Use existing public API
        const res = await fetch("http://localhost:8080/api/public/category/all");

        if (res.ok) {
            const categories = await res.json();
            document.getElementById("totalCategories").textContent = categories.length;
        }
    } catch (err) {
        console.error("Category count error:", err);
        document.getElementById("totalCategories").textContent = "0";
    }
}

loadTotalCategories();

// -------------------------------------
// 7. LOGOUT
// -------------------------------------
document.getElementById("adminLogout").addEventListener("click", () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_info");
    window.location.href = "login.html";
});

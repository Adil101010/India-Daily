// -------------------------------------
// TOAST NOTIFICATION FUNCTION
// -------------------------------------
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    // Remove previous classes
    toast.classList.remove('success', 'error', 'warning');

    // Add new class
    toast.classList.add(type, 'show');

    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// -------------------------------------
// LOADING OVERLAY
// -------------------------------------
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

// -------------------------------------
// 1. TOKEN CHECK
// -------------------------------------
const token = localStorage.getItem("admin_token");
if (!token || token.trim() === "") {
    window.location.href = "login.html";
}

// -------------------------------------
// 2. LOGOUT
// -------------------------------------
document.getElementById("adminLogout").addEventListener("click", () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_info");
    window.location.href = "login.html";
});

// -------------------------------------
// 3. GET ADMIN ID FROM localStorage
// -------------------------------------
const adminId = localStorage.getItem("edit_admin_id");

if (!adminId) {
    showToast('Error', 'No admin selected for editing!', 'error');
    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 2000);
}

// -------------------------------------
// 4. LOAD ADMIN DATA
// -------------------------------------
async function loadAdmin() {
    showLoading();

    try {
        const res = await fetch(`http://localhost:8080/api/admin/${adminId}`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        hideLoading();

        if (!res.ok) {
            showToast('Error', 'Failed to load admin data!', 'error');
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 2000);
            return;
        }

        const admin = await res.json();

        // Fill form
        document.getElementById("name").value = admin.name;
        document.getElementById("email").value = admin.email;
        document.getElementById("role").value = admin.role || "ADMIN";

        showToast('Success', 'Admin data loaded successfully!', 'success');

    } catch (err) {
        hideLoading();
        console.error("Error loading admin:", err);
        showToast('Error', 'Network error! Please try again.', 'error');
    }
}

loadAdmin();

// -------------------------------------
// 5. UPDATE ADMIN FORM SUBMIT
// -------------------------------------
document.getElementById("editAdminForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    if (name === "" || email === "") {
        showToast('Validation Error', 'Name and Email are required!', 'warning');
        return;
    }

    const updatedAdmin = {
        name: name,
        email: email,
        role: role
    };

    // Only include password if entered
    if (password !== "") {
        if (password.length < 6) {
            showToast('Validation Error', 'Password must be at least 6 characters!', 'warning');
            return;
        }
        updatedAdmin.password = password;
    }

    showLoading();

    try {
        const res = await fetch(`http://localhost:8080/api/admin/${adminId}`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedAdmin)
        });

        hideLoading();

        if (res.ok) {
            showToast('Success', 'Admin updated successfully!', 'success');
            localStorage.removeItem("edit_admin_id");

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);
        } else {
            const errorText = await res.text();
            showToast('Error', errorText || 'Failed to update admin!', 'error');
        }

    } catch (err) {
        hideLoading();
        console.error("Error updating admin:", err);
        showToast('Error', 'Network error! Please try again.', 'error');
    }
});

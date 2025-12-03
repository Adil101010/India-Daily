// -------------------------------------
// 1. TOKEN CHECK (Improved)
// -------------------------------------
const token = localStorage.getItem("admin_token");
if (!token || token.trim() === "") {
    window.location.href = "login.html";
}

// -------------------------------------
// 2. SIDEBAR --- TOGGLE
// -------------------------------------
document.querySelector(".menu-toggle").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("mobile-hide");
});

// -------------------------------------
// 3. LOGOUT FIX
// -------------------------------------
document.getElementById("adminLogout").addEventListener("click", () => {
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
});

// -------------------------------------
// 4. ADD ADMIN FORM SUBMIT
// -------------------------------------
document.getElementById("addAdminForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const nameVal = document.getElementById("name").value.trim();
    const emailVal = document.getElementById("email").value.trim();
    const passVal  = document.getElementById("password").value.trim();

    // ⭐ Basic Validation
    if (nameVal === "" || emailVal === "" || passVal === "") {
        alert("All fields are required!");
        return;
    }

    const admin = {
        name: nameVal,
        email: emailVal,
        password: passVal,
        role: "ADMIN"
    };

    try {
        const res = await fetch("http://localhost:8080/api/admin/add", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(admin)
        });

        if (res.status === 401 || res.status === 403) {
            alert("Session expired. Login again.");
            localStorage.removeItem("admin_token");
            window.location.href = "login.html";
            return;
        }

        if (res.ok) {
            alert("Admin Added Successfully!");
            window.location.href = "dashboard.html";
        } else {
            const errorText = await res.text();
            alert("Error: " + errorText);
        }

    } catch (err) {
        console.error("Error adding admin:", err);
        alert("Network Error. Try again.");
    }
});

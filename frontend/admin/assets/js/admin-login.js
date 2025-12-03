
// 👁 Show / Hide Password

document.getElementById("togglePassword").addEventListener("click", () => {
    const pass = document.getElementById("password");
    pass.type = pass.type === "password" ? "text" : "password";
});


// 🟢 LOGIN FORM SUBMIT
document.getElementById("loginForm").addEventListener("submit", async function(e){
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("http://localhost:8080/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        // ❌ OLD CODE (WRONG TOKEN)
        /*
        if (!response.ok) {
            document.getElementById("errorMsg").textContent = "Invalid login details!";
            return;
        }

        const token = await response.text();

        if (!token || token.trim() === "" || token === "INVALID") {
            document.getElementById("errorMsg").textContent = "Invalid login details!";
            return;
        }

        localStorage.setItem("admin_token", token);

        window.location.href = "dashboard.html";
        */


        // ✅ NEW CODE (ONLY JWT STRING SAVE)
        if (!response.ok) {
            document.getElementById("errorMsg").textContent = "Invalid login details!";
            return;
        }

        // backend JSON return करता है → { admin:{...}, token:"JWT_STRING" }
        const data = await response.json();
        const token = data.token;

        if (!token || token.trim() === "") {
            document.getElementById("errorMsg").textContent = "Invalid login details!";
            return;
        }

        // 🔐 सिर्फ JWT store करो (पहले पूरा JSON जा रहा था → गलत)
        localStorage.setItem("admin_token", token);

        // optional: admin details भी store कर सकते हो
        localStorage.setItem("admin_info", JSON.stringify(data.admin));

        // redirect
        window.location.href = "dashboard.html";

    } catch (err) {
        document.getElementById("errorMsg").textContent = "Server Error!";
    }
});

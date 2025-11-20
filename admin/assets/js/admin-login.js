document.getElementById("togglePassword").addEventListener("click", () => {
    const pass = document.getElementById("password");
    pass.type = pass.type === "password" ? "text" : "password";
});

document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    if(email === "admin@gmail.com" && pass === "1234"){
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("errorMsg").textContent = "Invalid login details!";
    }
});

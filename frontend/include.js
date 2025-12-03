document.querySelectorAll("[include-html]").forEach(el => {
    let file = el.getAttribute("include-html");

    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error("File not found: " + file);
            return response.text();
        })
        .then(data => {
            el.innerHTML = data;

            // Load header.js when header loads
            if (file.includes("header.html")) {
                const script = document.createElement("script");
                script.src = "/frontend/header/header.js";
                document.body.appendChild(script);
            }

            // Load footer.js when footer loads (future feature)
            if (file.includes("footer.html")) {
                const script = document.createElement("script");
                script.src = "/footer/footer.js";
                document.body.appendChild(script);
            }
        })
        .catch(err => {
            el.innerHTML = "<p style='color:red;'>Include Error: " + err.message + "</p>";
        });
});

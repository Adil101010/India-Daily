document.getElementById("current-date").innerText =
    new Date().toLocaleDateString("hi-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-menu').classList.toggle('active');
});

// Submenus toggle
document.querySelectorAll('.v-parent').forEach(item => {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('open');
    });
});

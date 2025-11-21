// DATE IN ENGLISH (same format but English)
document.getElementById("current-date").innerText =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });


// MOBILE MENU TOGGLE
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-menu').classList.toggle('active');
});


// SUBMENU (only for mobile)
document.querySelectorAll('.v-parent').forEach(item => {
    item.addEventListener('click', function(e) {
        // Mobile only action
        if (window.innerWidth <= 900) {
            e.stopPropagation();
            this.classList.toggle('open');
        }
    });
});

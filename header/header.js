(function () {

  // ---- DATE + MENU INIT ----
  function initHeader() {
    // DATE (English)
    const dateEl = document.getElementById("current-date");
    if (dateEl) {
      dateEl.innerText = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }

    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu   = document.querySelector(".nav-menu");

    if (!menuToggle || !navMenu) return;

    // Mobile toggle
    menuToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      navMenu.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (!navMenu.classList.contains("active")) return;
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove("active");
      }
    });

    // Mobile submenus
    const parents = document.querySelectorAll(".v-parent");
    const mq = window.matchMedia("(max-width: 900px)");

    function bindSubMenus() {
      parents.forEach((p) => {
        if (p._clickHandler) {
          p.removeEventListener("click", p._clickHandler);
          p._clickHandler = null;
        }
        if (mq.matches) {
          const h = function (ev) {
            ev.stopPropagation();
            this.classList.toggle("open");
          };
          p._clickHandler = h;
          p.addEventListener("click", h);
        }
      });
    }

    bindSubMenus();
    mq.addEventListener("change", bindSubMenus);
  }

  // ---- WAIT UNTIL HEADER LOADED ----
  function waitForHeader() {
    const ok = document.querySelector(".main-header .menu-toggle");
    if (ok) {
      initHeader();
    } else {
      setTimeout(waitForHeader, 120);
    }
  }

  document.addEventListener("DOMContentLoaded", waitForHeader);
})();

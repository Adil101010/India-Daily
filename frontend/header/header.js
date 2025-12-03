(function () {

  function initHeader() {
    // ============= DATE =============
    const dateEl = document.getElementById("current-date");
    if (dateEl) {
      const options = { day: "numeric", month: "long", year: "numeric" };
      dateEl.textContent = new Date().toLocaleDateString("en-IN", options);
    }

    const navMenu = document.getElementById("navMenu");
    const body = document.body;
    const menuToggle = document.getElementById("menuToggle");

    // ============= DYNAMIC MEGA MENU FROM BACKEND =============
    if (navMenu) {
      const homeItem = navMenu.querySelector(".nav-item:first-child");
      navMenu.innerHTML = "";
      if (homeItem) navMenu.appendChild(homeItem);

      fetch("http://localhost:8080/api/public/category/mega-menu")
        .then((res) => res.json())
        .then((categories) => {
          categories.forEach((cat) => {
            const li = document.createElement("li");
            li.className = "nav-item dropdown";

            const a = document.createElement("a");
            a.className = "dropdown-toggle";
            a.textContent = cat.name;
            a.href = `category.html?slug=${encodeURIComponent(cat.slug)}`;
            li.appendChild(a);

            if (cat.subCategories && cat.subCategories.length > 0) {
              const ul = document.createElement("ul");
              ul.className = "dropdown-menu";

              cat.subCategories.forEach((sub) => {
                const subLi = document.createElement("li");
                const subA = document.createElement("a");
                subA.textContent = sub.name;
                subA.href = `category.html?subSlug=${encodeURIComponent(
                  sub.slug
                )}`;
                subLi.appendChild(subA);
                ul.appendChild(subLi);
              });

              li.appendChild(ul);
            }

            navMenu.appendChild(li);
          });

          setupDropdowns(navMenu, body, menuToggle);
        })
        .catch((err) => console.error("Mega menu load error", err));
    }

    // ============= MOBILE MENU TOGGLE =============
    if (menuToggle && navMenu) {
      menuToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        navMenu.classList.toggle("active");
        menuToggle.classList.toggle("active");
        body.classList.toggle("menu-open");
      });

      document.addEventListener("click", function (e) {
        if (navMenu.classList.contains("active")) {
          if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove("active");
            menuToggle.classList.remove("active");
            body.classList.remove("menu-open");
          }
        }
      });

      navMenu.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    // ============= CLOSE DROPDOWNS ON RESIZE =============
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && navMenu && menuToggle) {
        navMenu.classList.remove("active");
        menuToggle.classList.remove("active");
        body.classList.remove("menu-open");
        document
          .querySelectorAll(".dropdown")
          .forEach((d) => d.classList.remove("active"));
      }
    });
  }

  function setupDropdowns(navMenu, body, menuToggle) {
    const dropdowns = document.querySelectorAll(".dropdown");

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".dropdown-toggle");

      if (toggle) {
        toggle.addEventListener("click", function (e) {
          if (window.innerWidth <= 900) {
            e.preventDefault();
            e.stopPropagation();

            dropdowns.forEach((other) => {
              if (other !== dropdown) {
                other.classList.remove("active");
              }
            });

            dropdown.classList.toggle("active");
          }
        });
      }
    });

    const subLinks = document.querySelectorAll(".dropdown-menu a");
    subLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.stopPropagation();
        if (window.innerWidth <= 900 && navMenu && menuToggle) {
          navMenu.classList.remove("active");
          menuToggle.classList.remove("active");
          body.classList.remove("menu-open");
        }
      });
    });
  }

  function waitForHeader() {
    if (document.getElementById("menuToggle")) {
      initHeader();
    } else {
      setTimeout(waitForHeader, 100);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForHeader);
  } else {
    waitForHeader();
  }
})();

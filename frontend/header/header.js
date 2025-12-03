(function() {

  function initHeader() {

    // ============= DATE =============
    const dateEl = document.getElementById("current-date");
    if (dateEl) {
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      dateEl.textContent = new Date().toLocaleDateString('en-IN', options);
    }

    // ============= MOBILE MENU TOGGLE =============
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");
    const body = document.body;

    if (menuToggle && navMenu) {
      menuToggle.addEventListener("click", function(e) {
        e.stopPropagation();
        navMenu.classList.toggle("active");
        menuToggle.classList.toggle("active");
        body.classList.toggle("menu-open");
      });

      // Close menu when clicking outside
      document.addEventListener("click", function(e) {
        if (navMenu.classList.contains("active")) {
          if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            navMenu.classList.remove("active");
            menuToggle.classList.remove("active");
            body.classList.remove("menu-open");
          }
        }
      });

      // Prevent menu close when clicking inside
      navMenu.addEventListener("click", function(e) {
        e.stopPropagation();
      });
    }

    // ============= DROPDOWN TOGGLE (MOBILE ONLY) =============
    const dropdowns = document.querySelectorAll(".dropdown");
    
    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector(".dropdown-toggle");
      
      if (toggle) {
        toggle.addEventListener("click", function(e) {
          // Only prevent default on mobile
          if (window.innerWidth <= 900) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other dropdowns
            dropdowns.forEach(other => {
              if (other !== dropdown) {
                other.classList.remove("active");
              }
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle("active");
          }
        });
      }
    });

    // ============= SUBMENU LINKS (SHOULD WORK NORMALLY) =============
    const subLinks = document.querySelectorAll(".dropdown-menu a");
    subLinks.forEach(link => {
      link.addEventListener("click", function(e) {
        e.stopPropagation();
        // Let link navigate normally
        // Close mobile menu after click
        if (window.innerWidth <= 900) {
          navMenu.classList.remove("active");
          menuToggle.classList.remove("active");
          body.classList.remove("menu-open");
        }
      });
    });

    // ============= CLOSE DROPDOWNS ON RESIZE =============
    window.addEventListener("resize", function() {
      if (window.innerWidth > 900) {
        navMenu.classList.remove("active");
        menuToggle.classList.remove("active");
        body.classList.remove("menu-open");
        dropdowns.forEach(d => d.classList.remove("active"));
      }
    });
  }

  // ============= WAIT FOR HEADER TO LOAD =============
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

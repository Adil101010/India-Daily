// header.js
// Minimal JS: date, ensure keyboard/focus toggles aria-expanded for hoverable items,
// hamburger -> mobileMenu handling, Escape to close.

document.addEventListener('DOMContentLoaded', () => {
  // 1) Top date (hi-IN)
  const dateEl = document.getElementById('topDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('hi-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  // 2) Live button click (keeps same behavior)
  const liveBtn = document.getElementById('liveBtn');
  if (liveBtn) {
    liveBtn.addEventListener('click', () => {
      window.open('https://www.youtube.com/', '_blank');
    });
  }

  // 3) Accessibility: toggle aria-expanded when parent link receives focus (keyboard users)
  document.querySelectorAll('.nav-links li.has-dropdown > a').forEach(link => {
    const parentLi = link.parentElement;
    link.addEventListener('focus', () => {
      link.setAttribute('aria-expanded', 'true');
      // add a class so CSS :focus-within works — but we set aria for clarity
      parentLi.classList.add('keyboard-open');
    });
    link.addEventListener('blur', () => {
      // small timeout to allow focus to move to submenu item
      setTimeout(() => {
        if (!parentLi.contains(document.activeElement)) {
          link.setAttribute('aria-expanded', 'false');
          parentLi.classList.remove('keyboard-open');
        }
      }, 10);
    });
  });

  // Remove keyboard-open class when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-links')) {
      document.querySelectorAll('.nav-links li.keyboard-open').forEach(li => li.classList.remove('keyboard-open'));
      document.querySelectorAll('.nav-links li.has-dropdown > a').forEach(a => a.setAttribute('aria-expanded','false'));
    }
  });

  // 4) Hamburger + mobile menu open/close
  const hamb = document.getElementById('siteHamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMobile = document.getElementById('closeMobileMenu');
  if (hamb && mobileMenu) {
    hamb.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
    });
  }
  if (closeMobile && mobileMenu) {
    closeMobile.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  }

  // 5) Close mobile menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden','true');
      }
      // also remove any keyboard-open states on nav
      document.querySelectorAll('.nav-links li.keyboard-open').forEach(li => li.classList.remove('keyboard-open'));
    }
  });
});

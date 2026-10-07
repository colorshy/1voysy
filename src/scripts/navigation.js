/**
 * 1VOYSY — Navigation Module
 * Minimal Editorial Header, Hamburger Drawer, and Smooth Anchor Routing
 */

export function initNavigation() {
  const menuToggle = document.querySelector('.menu-toggle, .mobile-toggle');
  const navDrawer = document.querySelector('.nav-drawer, .mobile-drawer');
  const drawerCloseBtn = document.querySelector('.drawer-close-btn');
  const navLinks = document.querySelectorAll('.drawer-link, .nav-link, .brand-title, .brand-link');

  // Toggle drawer open/close
  function toggleDrawer(open) {
    if (!navDrawer) return;
    const shouldOpen = open !== undefined ? open : !navDrawer.classList.contains('is-open');
    if (shouldOpen) {
      navDrawer.classList.add('is-open');
      if (menuToggle) {
        menuToggle.classList.add('is-open');
        menuToggle.setAttribute('aria-expanded', 'true');
      }
    } else {
      navDrawer.classList.remove('is-open');
      if (menuToggle) {
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDrawer();
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => {
      toggleDrawer(false);
    });
  }

  // Close drawer on click outside
  document.addEventListener('click', (e) => {
    if (navDrawer && navDrawer.classList.contains('is-open')) {
      if (!navDrawer.contains(e.target) && !menuToggle?.contains(e.target)) {
        toggleDrawer(false);
      }
    }
  });

  // Close drawer on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navDrawer?.classList.contains('is-open')) {
      toggleDrawer(false);
    }
  });

  // 1. Mobile Menu Toggle for Hero
  const heroToggle = document.querySelector('.hero-nav-toggle');
  const heroNavLinks = document.querySelector('.hero-nav-links');
  if (heroToggle && heroNavLinks) {
    heroToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = heroNavLinks.classList.toggle('is-open');
      heroToggle.classList.toggle('is-open', isOpen);
      heroToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    heroNavLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        heroNavLinks.classList.remove('is-open');
        heroToggle.classList.remove('is-open');
        heroToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!heroNavLinks.contains(e.target) && !heroToggle.contains(e.target)) {
        heroNavLinks.classList.remove('is-open');
        heroToggle.classList.remove('is-open');
        heroToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. Global Sticky Header Scroll State
  const heroHeader = document.querySelector('.hero-header');
  if (heroHeader) {
    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 20) {
        heroHeader.classList.add('is-scrolled');
      } else {
        heroHeader.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 3. Global Smooth Anchor Scroll for all internal hash links with header offset
  const allHashLinks = document.querySelectorAll('a[href^="#"]');
  allHashLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.length > 1) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          const header = document.querySelector('.hero-header');
          const headerHeight = header ? header.offsetHeight : 54;
          let targetPosition;
          if (targetId === 'hero') {
            targetPosition = 0;
          } else if (targetId === 'about' || targetId === 'work') {
            targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          } else {
            targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          }

          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
          });

          if (heroNavLinks) {
            heroNavLinks.classList.remove('is-open');
            if (heroToggle) {
              heroToggle.classList.remove('is-open');
              heroToggle.setAttribute('aria-expanded', 'false');
            }
          }
        }
      }
    });
  });

  // 3. Additional Work Gallery Carousel Controls
  const filmstripWrapper = document.querySelector('.additional-filmstrip-wrapper');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const counterSpan = document.querySelector('.carousel-counter');

  if (filmstripWrapper && prevBtn && nextBtn) {
    let currentIndex = 1;
    const totalItems = 12;

    const updateCounter = () => {
      if (counterSpan) {
        const formatted = String(currentIndex).padStart(2, '0');
        counterSpan.textContent = `[ ${formatted} ] / [ ${totalItems} ]`;
      }
    };

    nextBtn.addEventListener('click', () => {
      filmstripWrapper.scrollBy({ left: 220, behavior: 'smooth' });
      currentIndex = Math.min(totalItems, currentIndex + 1);
      updateCounter();
    });

    prevBtn.addEventListener('click', () => {
      filmstripWrapper.scrollBy({ left: -220, behavior: 'smooth' });
      currentIndex = Math.max(1, currentIndex - 1);
      updateCounter();
    });
  }
}

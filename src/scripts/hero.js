/**
 * 01 // HERO MOTION & ENVIRONMENTAL TRANSITION SYSTEM
 * Section 06 & 07: Controlled cinematic parallax and spatial pedestal transition
 */

export function initHeroMotion() {
  const hero = document.getElementById('hero');
  const landscapeImg = document.querySelector('.hero-landscape-img');
  const pedestal = document.querySelector('.hero-pedestal');
  if (!hero || !landscapeImg) return;

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  let ticking = false;

  function updateHeroParallax() {
    const scrollY = window.scrollY || window.pageYOffset;
    const heroHeight = hero.offsetHeight || window.innerHeight;

    // Only compute while hero is in or near viewport
    if (scrollY <= heroHeight * 1.5) {
      const progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);

      // Section 07 specifications:
      // landscape translateY: 0 -> approximately -8vh
      // landscape opacity: 1 -> approximately 0.85
      const translateY = (progress * -8).toFixed(2);
      const opacity = (1 - progress * 0.15).toFixed(3);

      landscapeImg.style.transform = `translate3d(0, ${translateY}vh, 0)`;
      landscapeImg.style.opacity = `${opacity}`;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeroParallax);
      ticking = true;
    }
  }, { passive: true });

  // Initial call
  updateHeroParallax();
}

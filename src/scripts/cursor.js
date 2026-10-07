/**
 * Global Inverted-V Cursor Controller
 * Provides an authentic, reactive inverted-V (^) cursor across the entire website
 */

// Global Image Protection: Prevent copying, saving, and dragging images
if (typeof window !== 'undefined' && !window.__imageProtectionActive) {
  window.__imageProtectionActive = true;
  document.addEventListener('contextmenu', (e) => {
    if (e.target && (e.target.tagName === 'IMG' || (e.target.closest && e.target.closest('img')))) {
      e.preventDefault();
    }
  }, { capture: true });

  document.addEventListener('dragstart', (e) => {
    if (e.target && (e.target.tagName === 'IMG' || (e.target.closest && e.target.closest('img')))) {
      e.preventDefault();
    }
  }, { capture: true });
}

export function initCursor() {
  // Only activate custom cursor visual on devices with fine pointer (mouse / trackpad)
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return;
  }

  let cursorEl = document.getElementById('site-cursor');
  if (!cursorEl) {
    cursorEl = document.createElement('div');
    cursorEl.id = 'site-cursor';
    cursorEl.className = 'site-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    cursorEl.innerHTML = `
      <svg class="site-cursor-svg" viewBox="0 0 24 24" width="26" height="26">
        <path class="site-cursor-path" d="M4 19L12 5L20 19" />
      </svg>
    `;
    document.body.appendChild(cursorEl);
  }

  document.documentElement.classList.add('custom-cursor-active');

  let mouseX = -100;
  let mouseY = -100;
  let currentX = -100;
  let currentY = -100;
  let isHovering = false;
  let isPressed = false;
  let isVisible = false;

  function render() {
    // Ultra-snappy response: follows pointer precisely without sluggish lag
    currentX += (mouseX - currentX) * 0.85;
    currentY += (mouseY - currentY) * 0.85;

    // The apex of the inverted-V is at horizontal 50% and vertical ~20%
    let scaleStr = '';
    if (isPressed) {
      scaleStr = ' scale(0.86)';
    } else if (isHovering) {
      scaleStr = ' scale(1.32)';
    }

    cursorEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -20%)${scaleStr}`;

    requestAnimationFrame(render);
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      currentX = mouseX;
      currentY = mouseY;
      cursorEl.classList.add('is-visible');
      cursorEl.classList.remove('is-hidden');
    }
  }

  function onMouseDown() {
    isPressed = true;
    cursorEl.classList.add('is-pressed');
  }

  function onMouseUp() {
    isPressed = false;
    cursorEl.classList.remove('is-pressed');
  }

  function onMouseLeave() {
    isVisible = false;
    cursorEl.classList.remove('is-visible');
    cursorEl.classList.add('is-hidden');
  }

  function onMouseEnter() {
    isVisible = true;
    cursorEl.classList.add('is-visible');
    cursorEl.classList.remove('is-hidden');
  }

  // Interactive element hover detection
  const interactiveSelector = 'a, button, input, textarea, select, [role="button"], .work-row, .manifesto-accordion-item, .editorial-badge, .work-section-label, .copy-email-btn, .footer-email-link';

  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (target && target.closest && target.closest(interactiveSelector)) {
      isHovering = true;
      cursorEl.classList.add('is-hovering');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const target = e.target;
    if (target && target.closest && target.closest(interactiveSelector)) {
      isHovering = false;
      cursorEl.classList.remove('is-hovering');
    }
  }, { passive: true });

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mousedown', onMouseDown, { passive: true });
  window.addEventListener('mouseup', onMouseUp, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('mouseenter', onMouseEnter);

  requestAnimationFrame(render);
}

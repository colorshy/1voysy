/**
 * ONE VOICE — Showcase Module
 * Minimal Editorial Project Archive with Spatial Depth & Inertial Mouse Movement
 */

export function initShowcase() {
  const section = document.getElementById('projects');
  const viewport = document.getElementById('showcaseViewport');
  const track = document.getElementById('showcaseTrack');
  const panels = Array.from(document.querySelectorAll('.showcase-panel'));

  if (!section || !viewport || !track || panels.length === 0) return;

  let currentX = 0;
  let targetX = 0;
  let maxScroll = 0;
  let isDragging = false;
  let startX = 0;
  let startTargetX = 0;
  let hasMoved = false;
  const ease = 0.08;

  // Compute layout geometry so first and last cards can be cleanly centered
  function updateMetrics() {
    const viewportWidth = viewport.clientWidth;
    const firstPanel = panels[0];
    const panelWidth = firstPanel ? firstPanel.offsetWidth : 380;
    
    // Generous center padding
    const paddingOffset = Math.max(24, (viewportWidth - panelWidth) / 2);
    track.style.paddingLeft = `${paddingOffset}px`;
    track.style.paddingRight = `${paddingOffset}px`;

    // Calculate max scroll bounded strictly to the track contents
    const totalTrackWidth = track.scrollWidth;
    maxScroll = Math.max(0, totalTrackWidth - viewportWidth);

    // Clamp current target within bounds
    targetX = Math.max(-maxScroll, Math.min(0, targetX));
  }

  updateMetrics();
  window.addEventListener('resize', updateMetrics, { passive: true });

  // 1. Desktop Mouse Movement across Section
  section.addEventListener('mousemove', (e) => {
    if (isDragging) return;
    const rect = section.getBoundingClientRect();
    if (rect.width <= 0) return;

    // Relative mouse X position normalized [0, 1]
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    targetX = -normX * maxScroll;
  });

  // 2. Drag & Touch Gesture Support
  function onPointerDown(clientX) {
    isDragging = true;
    hasMoved = false;
    startX = clientX;
    startTargetX = targetX;
    viewport.classList.add('is-dragging');
  }

  function onPointerMove(clientX) {
    if (!isDragging) return;
    const delta = clientX - startX;
    if (Math.abs(delta) > 4) {
      hasMoved = true;
    }
    targetX = Math.max(-maxScroll, Math.min(0, startTargetX + delta * 1.2));
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
  }

  // Pointer / Mouse Drag
  viewport.addEventListener('mousedown', (e) => {
    // Only left click
    if (e.button !== 0) return;
    onPointerDown(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    onPointerMove(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    onPointerUp();
  });

  // Touch Swipe for Mobile / Tablet
  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      onPointerDown(e.touches[0].clientX);
    }
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      onPointerMove(e.touches[0].clientX);
    }
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    onPointerUp();
  });

  viewport.addEventListener('touchcancel', () => {
    onPointerUp();
  });

  // 3. Click to Center Inactive Panels or Trigger Modal
  panels.forEach((panel) => {
    panel.addEventListener('click', (e) => {
      // If user was actively dragging, cancel click
      if (hasMoved) return;

      // If clicked the specific action button, allow standard event flow (modal opens)
      if (e.target.closest('.project-cta-btn')) return;

      const viewportWidth = viewport.clientWidth;
      const rect = panel.getBoundingClientRect();
      const panelCenter = rect.left + rect.width / 2;
      const screenCenter = window.innerWidth / 2;

      // If card is already near the center (< 50px offset), open modal directly!
      if (Math.abs(panelCenter - screenCenter) < 60) {
        const ctaBtn = panel.querySelector('.project-cta-btn');
        if (ctaBtn) {
          ctaBtn.click();
        }
      } else {
        // Center this panel smoothly
        const panelCenterInTrack = panel.offsetLeft + panel.offsetWidth / 2;
        targetX = -(panelCenterInTrack - viewportWidth / 2);
        targetX = Math.max(-maxScroll, Math.min(0, targetX));
      }
    });
  });

  // 4. Continuous RAF Animation & Spatial Depth Loop
  let rafId;

  function render() {
    // Smooth Lerp Inertia
    currentX += (targetX - currentX) * ease;
    track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;

    // Calculate Spatial Depth for Each Project Panel
    const viewportCenter = window.innerWidth / 2;
    const maxReferenceDist = window.innerWidth * 0.48;

    panels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const panelCenter = rect.left + rect.width / 2;
      const distFromCenter = panelCenter - viewportCenter;
      const normDist = distFromCenter / maxReferenceDist; // -1 to +1
      const absDist = Math.min(1.2, Math.abs(normDist));

      // Spatial depth parameters:
      // Active center: scale = 1.0, opacity = 1.0, rotateY = 0
      // Away from center: scale = 0.88, opacity = 0.55, rotateY = -normDist * 5deg
      const scale = Math.max(0.88, 1 - absDist * 0.12);
      const opacity = Math.max(0.55, 1 - absDist * 0.45);
      const rotateY = Math.max(-6, Math.min(6, -normDist * 5));
      const zIndex = Math.round((1.2 - absDist) * 10) + 1;

      const visualWrap = panel.querySelector('.panel-visual-wrap');
      if (visualWrap) {
        visualWrap.style.transform = `scale(${scale.toFixed(4)}) rotateY(${rotateY.toFixed(2)}deg)`;
        visualWrap.style.opacity = opacity.toFixed(3);
      }

      panel.style.zIndex = zIndex;

      // Caption prominence
      const caption = panel.querySelector('.panel-caption');
      if (caption) {
        caption.style.opacity = Math.max(0.65, 1 - absDist * 0.35).toFixed(3);
      }
    });

    rafId = requestAnimationFrame(render);
  }

  rafId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', updateMetrics);
  };
}

/**
 * 04 // MANIFESTO 3D SCULPTURE INTERACTION
 * Interactive pointer physics & subtle 3D tilt for the glossy black object
 */

export function initManifestoScene() {
  const stage = document.getElementById('manifesto-3d-stage');
  const asset = document.querySelector('.manifesto-3d-img');
  if (!stage || !asset) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  let bounds = stage.getBoundingClientRect();
  let mouseX = 0;
  let mouseY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let isHovering = false;
  let rafId = null;

  function onResize() {
    bounds = stage.getBoundingClientRect();
  }

  function onPointerMove(e) {
    const x = (e.clientX - bounds.left) / bounds.width - 0.5;
    const y = (e.clientY - bounds.top) / bounds.height - 0.5;
    mouseX = Math.max(-0.5, Math.min(0.5, x));
    mouseY = Math.max(-0.5, Math.min(0.5, y));
  }

  function update() {
    if (isHovering) {
      const targetTiltY = mouseX * 14;
      const targetTiltX = -mouseY * 14;

      currentTiltX += (targetTiltX - currentTiltX) * 0.1;
      currentTiltY += (targetTiltY - currentTiltY) * 0.1;

      asset.style.transform = `perspective(800px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translateY(-8px) scale(1.04)`;
    } else {
      currentTiltX += (0 - currentTiltX) * 0.08;
      currentTiltY += (0 - currentTiltY) * 0.08;

      if (Math.abs(currentTiltX) > 0.01 || Math.abs(currentTiltY) > 0.01) {
        asset.style.transform = `perspective(800px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translateY(0px) scale(1)`;
      } else {
        asset.style.transform = '';
      }
    }

    rafId = requestAnimationFrame(update);
  }

  stage.addEventListener('pointerenter', () => {
    isHovering = true;
    bounds = stage.getBoundingClientRect();
  });

  stage.addEventListener('pointerleave', () => {
    isHovering = false;
  });

  stage.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  rafId = requestAnimationFrame(update);
}

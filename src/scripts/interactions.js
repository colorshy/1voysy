/**
 * 1VOYSY — Unified Textile Interaction System
 * Physical click response, directional material deformation, and tactile feedback.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initInteractions() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Core Directional Textile Deformation Engine
  function applyTextileDeform(el, clientX, clientY) {
    if (isReducedMotion || !el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Relative offset from element center (-1 to 1)
    const relX = clientX !== undefined && rect.width > 0
      ? Math.max(-1, Math.min(1, (clientX - centerX) / (rect.width / 2)))
      : 0;
    const relY = clientY !== undefined && rect.height > 0
      ? Math.max(-1, Math.min(1, (clientY - centerY) / (rect.height / 2)))
      : 0;

    // Directional displacement: elements subtly pull toward the contact point
    const pullX = relX * 2.8;
    const pullY = relY * 2.0;
    const skewX = -relX * 1.1;
    const scaleX = 1 + Math.abs(relX) * 0.016;
    const scaleY = 1 - Math.abs(relY) * 0.016;

    // Kill any active animation on this element to keep rapid clicks stable
    gsap.killTweensOf(el);

    // Damped elastic textile pull: ~340ms total duration
    gsap.timeline()
      .to(el, {
        x: pullX,
        y: pullY,
        scaleX: scaleX,
        scaleY: scaleY,
        skewX: skewX,
        duration: 0.09,
        ease: 'power2.out',
      })
      .to(el, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        duration: 0.28,
        ease: 'elastic.out(1.18, 0.44)',
        clearProps: 'all',
      });
  }

  // 2. .1VOYSY Wordmark Signature Interaction (TEXT → UNRAVEL → REASSEMBLE)
  const brandTitle = document.querySelector('.brand-title');
  if (brandTitle) {
    const rawText = '.1VOYSY';
    if (!brandTitle.querySelector('.brand-letters')) {
      brandTitle.innerHTML = `
        <span class="brand-letters" aria-hidden="true">
          ${rawText.split('').map((char, i) => `<span class="brand-char" data-index="${i}">${char}</span>`).join('')}
        </span>
        <canvas class="brand-fiber-canvas" aria-hidden="true"></canvas>
      `;
    }

    const chars = Array.from(brandTitle.querySelectorAll('.brand-char'));
    const canvas = brandTitle.querySelector('.brand-fiber-canvas');
    const ctx = canvas.getContext('2d');

    const pad = 24; // Padding around wordmark for fiber displacement room
    let canvasWidth = 0;
    let canvasHeight = 0;
    let dpr = 1;
    let fibers = [];
    let charBounds = [];
    let baseline = 30;

    // Sample letter shapes into fine textile fiber particles
    function sampleFibers() {
      if (isReducedMotion) return;
      const brandRect = brandTitle.getBoundingClientRect();
      if (brandRect.width === 0 || brandRect.height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasWidth = Math.ceil(brandRect.width) + pad * 2;
      canvasHeight = Math.ceil(brandRect.height) + pad * 2;

      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      canvas.style.left = `-${pad}px`;
      canvas.style.top = `-${pad}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const comp = window.getComputedStyle(brandTitle);
      const offCanvas = document.createElement('canvas');
      offCanvas.width = Math.ceil(brandRect.width);
      offCanvas.height = Math.ceil(brandRect.height);
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      offCtx.font = `${comp.fontWeight} ${comp.fontSize} ${comp.fontFamily}`;
      offCtx.textBaseline = 'alphabetic';

      const metrics = offCtx.measureText(rawText);
      baseline = metrics.actualBoundingBoxAscent || 30;

      fibers = [];
      charBounds = [];

      chars.forEach((c, i) => {
        const cRect = c.getBoundingClientRect();
        const relX = cRect.left - brandRect.left;
        const width = cRect.width;

        charBounds[i] = {
          relX,
          centerX: relX + width / 2,
          width,
          height: cRect.height
        };

        offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
        offCtx.fillStyle = '#FFFFFF';
        offCtx.fillText(c.textContent, relX, baseline);

        const img = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const step = 2.4; // fine stitch grid density

        for (let y = 1; y < offCanvas.height - 1; y += step) {
          for (let x = 1; x < offCanvas.width - 1; x += step) {
            const px = Math.floor(x);
            const py = Math.floor(y);
            const idx = (py * offCanvas.width + px) * 4;
            if (img.data[idx + 3] > 130) {
              const bx = pad + px;
              const by = pad + py;
              const baseAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.22;
              const baseLen = 3.2 + Math.random() * 2.2;
              const color = Math.random() > 0.35
                ? 'rgba(245, 242, 235, 0.96)'
                : (Math.random() > 0.5 ? 'rgba(237, 232, 221, 0.94)' : 'rgba(255, 255, 255, 0.98)');

              fibers.push({
                charIndex: i,
                baseX: bx,
                baseY: by,
                x: bx,
                y: by,
                vx: 0,
                vy: 0,
                baseAngle,
                angle: baseAngle,
                baseLen,
                len: baseLen,
                width: 1.15 + Math.random() * 0.35,
                color,
                noiseX: (Math.random() - 0.5) * 6,
                noiseY: (Math.random() - 0.5) * 5,
                randomFactor: 0.8 + Math.random() * 0.4
              });
            }
          }
        }
      });
    }

    sampleFibers();
    window.addEventListener('resize', sampleFibers, { passive: true });

    // Interaction State Tracking
    const charUnravel = [0, 0, 0, 0, 0, 0];
    const targetUnravel = [0, 0, 0, 0, 0, 0];
    let cursorX = -9999;
    let cursorY = -9999;
    let prevCursorX = -9999;
    let prevCursorY = -9999;
    let cursorVx = 0;
    let cursorVy = 0;
    let isCursorNear = false;
    let isRunning = false;
    let animFrameId = null;

    function startLoop() {
      if (!isRunning) {
        isRunning = true;
        animFrameId = requestAnimationFrame(tick);
      }
    }

    function updateCursorPosition(clientX, clientY) {
      if (isReducedMotion) return;
      const brandRect = brandTitle.getBoundingClientRect();

      isCursorNear = (
        clientX >= brandRect.left - 45 &&
        clientX <= brandRect.right + 45 &&
        clientY >= brandRect.top - 45 &&
        clientY <= brandRect.bottom + 45
      );

      if (prevCursorX !== -9999) {
        cursorVx = Math.max(-14, Math.min(14, (clientX - prevCursorX) * 0.6));
        cursorVy = Math.max(-14, Math.min(14, (clientY - prevCursorY) * 0.6));
      }
      prevCursorX = clientX;
      prevCursorY = clientY;

      cursorX = clientX - (brandRect.left - pad);
      cursorY = clientY - (brandRect.top - pad);

      startLoop();
    }

    window.addEventListener('mousemove', (e) => {
      updateCursorPosition(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      isCursorNear = false;
      for (let i = 0; i < 6; i++) targetUnravel[i] = 0;
      startLoop();
    });

    // Continuous Physics & Unraveling Render Loop
    function tick() {
      if (isReducedMotion) {
        isRunning = false;
        return;
      }

      const brandRect = brandTitle.getBoundingClientRect();
      const centerY = (brandRect.height / 2) + pad;

      // 1. Calculate per-letter unravel intensity (travels across letters)
      for (let i = 0; i < 6; i++) {
        if (!charBounds[i]) continue;
        const charCanvasCenterX = charBounds[i].centerX + pad;
        const hDist = Math.abs(cursorX - charCanvasCenterX);
        const vDist = Math.abs(cursorY - centerY);

        if (isCursorNear && hDist < 28 && vDist < 30) {
          const infH = 1 - hDist / 28;
          const infV = 1 - vDist / 30;
          targetUnravel[i] = infH * infV;
        } else {
          targetUnravel[i] = 0;
        }

        // Breakup: 100–160ms snappy response | Reconstruction: 250–380ms smooth settling
        if (targetUnravel[i] > charUnravel[i]) {
          charUnravel[i] += (targetUnravel[i] - charUnravel[i]) * 0.24;
        } else {
          charUnravel[i] += (targetUnravel[i] - charUnravel[i]) * 0.14;
        }
        if (charUnravel[i] < 0.008) charUnravel[i] = 0;

        // Soften DOM letter span as fibers emerge
        chars[i].style.opacity = charUnravel[i] > 0.01
          ? `${Math.max(0, 1 - charUnravel[i] * 1.5)}`
          : '1';
      }

      // 2. Check if animation should sleep
      let anyActive = false;
      for (let i = 0; i < 6; i++) {
        if (charUnravel[i] > 0.008) {
          anyActive = true;
          break;
        }
      }

      if (!anyActive && !isCursorNear) {
        // Verify all fibers returned to origin
        let fibersAtRest = true;
        for (let k = 0; k < fibers.length; k++) {
          const f = fibers[k];
          if (Math.abs(f.x - f.baseX) > 0.3 || Math.abs(f.y - f.baseY) > 0.3) {
            fibersAtRest = false;
            break;
          }
        }

        if (fibersAtRest) {
          // Perfectly clean resting state
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          chars.forEach(c => { c.style.opacity = '1'; });
          fibers.forEach(f => {
            f.x = f.baseX;
            f.y = f.baseY;
            f.vx = 0;
            f.vy = 0;
            f.angle = f.baseAngle;
            f.len = f.baseLen;
          });
          isRunning = false;
          return;
        }
      }

      // 3. Clear canvas & Render unraveled fiber particles
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      for (let k = 0; k < fibers.length; k++) {
        const f = fibers[k];
        const u = charUnravel[f.charIndex];

        const fdx = f.baseX - cursorX;
        const fdy = f.baseY - cursorY;
        const fdist = Math.sqrt(fdx * fdx + fdy * fdy);

        if (u > 0.02 && fdist < 32 && isCursorNear) {
          // Needle is displacing this fiber: pulls outward along needle vector
          const force = (1 - fdist / 32) * u;
          const pushDist = force * (8.5 + f.randomFactor * 4.5);
          const nx = fdist > 0 ? fdx / fdist : 0;
          const ny = fdist > 0 ? fdy / fdist : -1;

          const targetX = f.baseX + nx * pushDist + cursorVx * 0.28 * force + f.noiseX * force;
          const targetY = f.baseY + ny * pushDist + cursorVy * 0.28 * force + f.noiseY * force;
          const targetAngle = f.baseAngle + nx * 0.65 * force;
          const targetLen = f.baseLen * (1 + 0.3 * force);

          // Fast displacement spring
          f.vx += (targetX - f.x) * 0.26;
          f.vy += (targetY - f.y) * 0.26;
          f.vx *= 0.65;
          f.vy *= 0.65;
          f.x += f.vx;
          f.y += f.vy;
          f.angle += (targetAngle - f.angle) * 0.16;
          f.len += (targetLen - f.len) * 0.18;
        } else {
          // Smooth elastic reconstruction toward exact resting base
          const targetX = f.baseX;
          const targetY = f.baseY;
          const targetAngle = f.baseAngle;
          const targetLen = f.baseLen;

          f.vx += (targetX - f.x) * 0.13;
          f.vy += (targetY - f.y) * 0.13;
          f.vx *= 0.72;
          f.vy *= 0.72;
          f.x += f.vx;
          f.y += f.vy;
          f.angle += (targetAngle - f.angle) * 0.15;
          f.len += (targetLen - f.len) * 0.16;

          // Snap to base when very close to eliminate micro-jitter
          if (Math.abs(f.x - f.baseX) < 0.25 && Math.abs(f.y - f.baseY) < 0.25 && Math.abs(f.vx) < 0.08 && Math.abs(f.vy) < 0.08) {
            f.x = f.baseX;
            f.y = f.baseY;
            f.vx = 0;
            f.vy = 0;
            f.angle = f.baseAngle;
            f.len = f.baseLen;
          }
        }

        // Draw fiber on canvas if active or displaced
        if (u > 0.01 || Math.abs(f.x - f.baseX) > 0.15 || Math.abs(f.y - f.baseY) > 0.15) {
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(f.angle);
          ctx.beginPath();
          ctx.moveTo(0, -f.len / 2);
          ctx.lineTo(0, f.len / 2);
          ctx.strokeStyle = f.color;
          ctx.lineWidth = f.width;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.restore();
        }
      }

      animFrameId = requestAnimationFrame(tick);
    }

    // Touch / Tap support: sweeps a localized fiber unravel wave on touch
    function triggerTouchUnravel(clientX, clientY) {
      if (isReducedMotion) return;
      const brandRect = brandTitle.getBoundingClientRect();
      cursorX = clientX - (brandRect.left - pad);
      cursorY = clientY - (brandRect.top - pad);
      isCursorNear = true;
      startLoop();

      setTimeout(() => {
        isCursorNear = false;
        startLoop();
      }, 160);
    }

    brandTitle.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        triggerTouchUnravel(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Tactile stretch/deformation on click: knitted material pull underneath letters
    brandTitle.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') {
        triggerTouchUnravel(e.clientX, e.clientY);
      }
      if (isReducedMotion) return;
      const clickX = e.clientX;

      chars.forEach((charEl) => {
        const charRect = charEl.getBoundingClientRect();
        const charCenterX = charRect.left + charRect.width / 2;
        const dx = clickX - charCenterX;
        const charDist = Math.abs(dx);

        const pullFactor = Math.max(0, 1 - charDist / (brandTitle.offsetWidth * 0.75));
        const dir = dx < 0 ? -1 : 1;
        const letterPullX = dir * pullFactor * 2.6;
        const letterScaleX = 1 + pullFactor * 0.07;
        const letterScaleY = 1 - pullFactor * 0.04;

        gsap.killTweensOf(charEl);
        gsap.timeline()
          .to(charEl, {
            x: letterPullX,
            scaleX: letterScaleX,
            scaleY: letterScaleY,
            duration: 0.09,
            ease: 'power2.out',
          })
          .to(charEl, {
            x: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.28,
            ease: 'elastic.out(1.18, 0.42)',
            clearProps: 'all',
          });
      });
    });
  }

  // ========================================================
  // 2b. .1VOYSY Scroll-Driven Brand Typography Scaling
  // Ties .1VOYSY scale directly to scroll progress with smooth interpolation
  // Scale visibly grows as user scrolls; smoothly returns on scroll back
  // ========================================================
  const heroSection = document.getElementById('hero');
  if (brandTitle && heroSection && !isReducedMotion) {
    function getBrandMaxScale() {
      const w = window.innerWidth;
      if (w > 1200) return 2.25;
      if (w > 900) return 1.85;
      if (w > 640) return 1.5;
      return 1.3;
    }

    brandTitle.style.transformOrigin = '0 0';
    brandTitle.style.willChange = 'transform';

    let currentScale = 1.0;
    let targetScale = 1.0;

    function onScroll() {
      const heroHeight = heroSection.offsetHeight || window.innerHeight;
      const heroTransitionEnd = heroHeight * 0.9;
      const scrollY = window.scrollY;
      const maxScale = getBrandMaxScale();

      if (scrollY <= 0) {
        targetScale = 1.0;
      } else if (scrollY < heroTransitionEnd) {
        // Bell-curve expansion during hero scroll: grows dynamically, then smoothly docks
        const norm = scrollY / heroTransitionEnd;
        const bell = Math.sin(norm * Math.PI);
        targetScale = 1.0 + (maxScale - 1.0) * bell;
      } else {
        targetScale = 1.0;
      }
    }

    function tick() {
      // Smooth interpolation (lerp factor 0.14 for intentional editorial feel)
      currentScale += (targetScale - currentScale) * 0.14;

      if (Math.abs(targetScale - currentScale) < 0.001) {
        currentScale = targetScale;
      }

      brandTitle.style.transform = `scale(${currentScale.toFixed(4)})`;

      requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    tick();
  }

  // 3. Menu Button Micro-Interactions
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    const bars = menuToggle.querySelectorAll('.menu-icon-bar');

    menuToggle.addEventListener('pointerdown', () => {
      // Micro-tension between the two hamburger bars
      if (!isReducedMotion && bars.length >= 2) {
        gsap.killTweensOf(bars);
        gsap.timeline()
          .to(bars[0], { x: -2.5, scaleX: 0.94, duration: 0.08, ease: 'power2.out' })
          .to(bars[1], { x: 2.5, scaleX: 0.94, duration: 0.08, ease: 'power2.out' }, '<')
          .to(bars, { x: 0, scaleX: 1, duration: 0.28, ease: 'elastic.out(1.2, 0.42)' });
      }
    });
  }

  // 4. Global Delegated Click & Pointer Response
  // Attaches physical response to all links, buttons, and interactive components
  const interactiveSelector = `
    a:not(.brand-title),
    button,
    .menu-toggle,
    .drawer-link,
    .drawer-close-btn,
    .btn-press,
    [role="button"]
  `;

  document.addEventListener('pointerdown', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (!target) return;

    // Apply tactile deformation
    applyTextileDeform(target, e.clientX, e.clientY);
  });

  // 5. Keyboard Accessibility Focus & Press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.matches(interactiveSelector)) {
        applyTextileDeform(activeEl);
      }
    }
  });

  // 6. Needle Hover State Notifications
  // Notify needle when hovering interactive elements to adjust precision angle
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.add('is-hovering-interactive');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.remove('is-hovering-interactive');
    }
  });
}

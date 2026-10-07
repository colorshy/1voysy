/**
 * .1VOYSY — 03 // FEATURED WORK INTERACTION SYSTEM
 * - Independent in-row preview image display
 * - Fast, polished letter-scramble / text-reveal effect on hover
 * - High-tech pixelation resolve / de-pixelate reveal animation on image hover
 * - Zero global dimming, zero sibling fade
 */

const SCRAMBLE_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SCRAMBLE_LOWER = 'abcdefghijklmnopqrstuvwxyz';

function getRandomChar(char, wordLetters) {
  // If we have letters from the word, give high probability to shuffle from those letters
  // so the text looks like the letters were "standing in different order" and assembling
  if (wordLetters && wordLetters.length > 0 && Math.random() < 0.65) {
    const picked = wordLetters[Math.floor(Math.random() * wordLetters.length)];
    if (char >= 'A' && char <= 'Z') return picked.toUpperCase();
    if (char >= 'a' && char <= 'z') return picked.toLowerCase();
    return picked;
  }
  if (char >= 'A' && char <= 'Z') {
    return SCRAMBLE_UPPER[Math.floor(Math.random() * SCRAMBLE_UPPER.length)];
  }
  if (char >= 'a' && char <= 'z') {
    return SCRAMBLE_LOWER[Math.floor(Math.random() * SCRAMBLE_LOWER.length)];
  }
  return char;
}

function scrambleElement(element) {
  const originalText = element.dataset.original || element.textContent.trim();
  if (!element.dataset.original) {
    element.dataset.original = originalText;
  }

  // Cancel any running animation on this element
  if (element._scrambleTimer) {
    clearInterval(element._scrambleTimer);
    element._scrambleTimer = null;
  }

  const charChildren = element.querySelectorAll('.all-char:not(.all-char-space)');
  const hasCharChildren = charChildren.length > 0;
  if (hasCharChildren) {
    charChildren.forEach(child => {
      if (!child.dataset.originalChar) {
        child.dataset.originalChar = child.textContent.trim();
      }
    });
  }

  // Letters of the word to mix up
  const wordLetters = originalText.replace(/[^a-zA-Z]/g, '').split('');
  const length = originalText.length;
  const duration = 900; // ~0.9 seconds (shortened by ~0.5s as requested, fast & crisp)
  const startTime = performance.now();
  const updateInterval = 40; // ms between randomized character updates

  function tick() {
    const now = performance.now();
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);

    // Initial disarray phase (first ~18% / ~160ms) where letters stand jumbled,
    // then progressive resolve from left to right until all letters snap into place
    const resolveProgress = Math.max(0, (progress - 0.18) / 0.82);
    const resolvedIndex = Math.floor(resolveProgress * length);

    if (hasCharChildren) {
      charChildren.forEach((child, i) => {
        const orig = child.dataset.originalChar || '';
        if (progress >= 1 || (i / charChildren.length) < resolveProgress) {
          child.textContent = orig;
        } else {
          child.textContent = getRandomChar(orig, wordLetters);
        }
      });
    } else {
      let output = '';
      for (let i = 0; i < length; i++) {
        const char = originalText[i];
        if (char === ' ' || char === '-' || char === ':' || char === '✱') {
          output += char;
        } else if (i < resolvedIndex || progress >= 1) {
          output += char;
        } else {
          output += getRandomChar(char, wordLetters);
        }
      }
      element.textContent = output;
    }

    if (progress >= 1) {
      if (element._scrambleTimer) {
        clearInterval(element._scrambleTimer);
        element._scrambleTimer = null;
      }
      restoreElement(element);
    }
  }

  // Run first tick immediately to instantly feel responsive
  tick();
  element._scrambleTimer = setInterval(tick, updateInterval);
}

function restoreElement(element) {
  if (element._scrambleTimer) {
    clearInterval(element._scrambleTimer);
    element._scrambleTimer = null;
  }
  const charChildren = element.querySelectorAll('.all-char:not(.all-char-space)');
  if (charChildren.length > 0) {
    charChildren.forEach(child => {
      if (child.dataset.originalChar) {
        child.textContent = child.dataset.originalChar;
      }
    });
  } else {
    const original = element.dataset.original || element.getAttribute('data-original');
    if (original) {
      element.textContent = original;
    }
  }
}

/**
 * Setup pixelation canvas effect on each preview box
 * When hovered, image resolves smoothly from low-resolution blocky pixels to crisp full quality
 */
function setupPixelate(row) {
  const box = row.querySelector('.work-preview-box');
  const img = box ? box.querySelector('.work-preview-img') : null;
  if (!box || !img) {
    return { start: () => {}, stop: () => {} };
  }

  const isContain = row.dataset.project === 'auezov-campus' || row.dataset.project === 'reform' || row.dataset.project === 'finguard';
  const containBg = row.dataset.project === 'auezov-campus' ? '#FFFFFF' : '#0B0B0C';

  const canvas = document.createElement('canvas');
  canvas.className = 'work-pixel-canvas';
  box.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d');

  let animId = null;
  let isImageReady = false;

  const sourceImg = new Image();
  sourceImg.src = img.currentSrc || img.src;
  sourceImg.onload = () => {
    isImageReady = true;
  };
  if (img.complete && img.naturalWidth) {
    isImageReady = true;
    sourceImg.src = img.currentSrc || img.src;
  }

  function getBounds(sourceW, sourceH, targetW, targetH) {
    if (!isContain) {
      // Cover crop
      const sRatio = sourceW / sourceH;
      const tRatio = targetW / targetH;
      let sx = 0, sy = 0, sw = sourceW, sh = sourceH;
      if (sRatio > tRatio) {
        sw = sourceH * tRatio;
        sx = (sourceW - sw) / 2;
      } else {
        sh = sourceW / tRatio;
        sy = (sourceH - sh) / 2;
      }
      return { sx, sy, sw, sh, dx: 0, dy: 0, dw: targetW, dh: targetH };
    } else {
      // Contain with white backdrop
      const sRatio = sourceW / sourceH;
      const tRatio = targetW / targetH;
      let dw = targetW, dh = targetH;
      if (sRatio > tRatio) {
        dh = targetW / sRatio;
      } else {
        dw = targetH * sRatio;
      }
      const dx = (targetW - dw) / 2;
      const dy = (targetH - dh) / 2;
      return { sx: 0, sy: 0, sw: sourceW, sh: sourceH, dx, dy, dw, dh };
    }
  }

  function renderPixelFrame(pixelSize) {
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h || w <= 0 || h <= 0 || !sourceImg.naturalWidth || !sourceImg.naturalHeight) return;

    const b = getBounds(sourceImg.naturalWidth, sourceImg.naturalHeight, w, h);
    if (!b || b.sw <= 0 || b.sh <= 0 || b.dw <= 0 || b.dh <= 0) return;

    if (isContain) {
      ctx.fillStyle = containBg;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }

    if (pixelSize <= 1) {
      ctx.imageSmoothingEnabled = true;
      try {
        ctx.drawImage(sourceImg, b.sx, b.sy, b.sw, b.sh, b.dx, b.dy, b.dw, b.dh);
      } catch (err) {
        // Safe fallback
      }
      return;
    }

    // Downscale to tiny offscreen canvas
    const safePixel = Math.max(1, pixelSize);
    const downW = Math.max(1, Math.round(w / safePixel));
    const downH = Math.max(1, Math.round(h / safePixel));
    if (downW <= 0 || downH <= 0) return;

    offscreen.width = downW;
    offscreen.height = downH;

    if (isContain) {
      offCtx.fillStyle = containBg;
      offCtx.fillRect(0, 0, downW, downH);
    } else {
      offCtx.clearRect(0, 0, downW, downH);
    }

    const offBounds = getBounds(sourceImg.naturalWidth, sourceImg.naturalHeight, downW, downH);
    if (offBounds && offBounds.sw > 0 && offBounds.sh > 0 && offBounds.dw > 0 && offBounds.dh > 0) {
      offCtx.imageSmoothingEnabled = false;
      try {
        offCtx.drawImage(sourceImg, offBounds.sx, offBounds.sy, offBounds.sw, offBounds.sh, offBounds.dx, offBounds.dy, offBounds.dw, offBounds.dh);
      } catch (err) {
        // Safe fallback
      }
    }

    // Upscale without interpolation to produce crisp digital pixels
    if (offscreen.width > 0 && offscreen.height > 0) {
      ctx.imageSmoothingEnabled = false;
      try {
        ctx.drawImage(offscreen, 0, 0, downW, downH, 0, 0, w, h);
      } catch (err) {
        // Safe fallback
      }
    }
  }

  function start() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }

    // Update source in case it changed
    if (!sourceImg.src || sourceImg.src !== (img.currentSrc || img.src)) {
      sourceImg.src = img.currentSrc || img.src;
    }

    const rect = box.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.max(240, Math.round((rect.width > 0 ? rect.width : 240) * dpr));
    const ch = Math.max(150, Math.round((rect.height > 0 ? rect.height : 150) * dpr));
    canvas.width = cw;
    canvas.height = ch;

    canvas.style.opacity = '1';
    img.style.opacity = '0';

    if (!isImageReady || !sourceImg.naturalWidth) {
      sourceImg.onload = () => {
        isImageReady = true;
        start();
      };
      return;
    }

    const duration = 750; // ms - deliberate, gradual progressive resolution
    const steps = [56, 42, 32, 24, 18, 14, 10, 7, 5, 3, 2, 1];
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Progressive resolution levels
      const stepIdx = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      const currentPixels = steps[stepIdx];

      renderPixelFrame(currentPixels);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        renderPixelFrame(1);
        img.style.opacity = '1';
        canvas.style.opacity = '0';
        animId = null;
      }
    }

    renderPixelFrame(steps[0]);
    animId = requestAnimationFrame(step);
  }

  function stop() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    img.style.opacity = '1';
    canvas.style.opacity = '0';
  }

  return { start, stop };
}

export function initWork() {
  const section = document.getElementById('work');
  if (!section) return;

  const rows = section.querySelectorAll('.work-row');
  if (!rows.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header label: Featured work scramble on hover
  const headerLabel = section.querySelector('.work-section-label');
  if (headerLabel) {
    headerLabel.style.cursor = 'pointer';
    let isHeaderHovered = false;
    headerLabel.addEventListener('mouseenter', () => {
      if (isHeaderHovered || prefersReducedMotion) return;
      isHeaderHovered = true;
      scrambleElement(headerLabel);
    });
    headerLabel.addEventListener('mouseleave', () => {
      if (!isHeaderHovered) return;
      isHeaderHovered = false;
      restoreElement(headerLabel);
    });
  }

  rows.forEach(row => {
    const textParts = row.querySelectorAll('.work-part');
    const pixelate = setupPixelate(row);

    function triggerScramble() {
      if (prefersReducedMotion) return;
      textParts.forEach(part => scrambleElement(part));
    }

    function cancelScramble() {
      textParts.forEach(part => restoreElement(part));
    }

    // Special click behavior for 06: All Work (2-second 3D letter scatter & flip)
    if (row.dataset.project === 'all-work') {
      let isTumbling = false;
      const triggerTumble = (e) => {
        if (e) e.preventDefault();
        if (isTumbling) return;
        isTumbling = true;
        row.classList.add('is-scattered');

        // Scatter / flip persists for exactly 2 seconds then returns
        setTimeout(() => {
          row.classList.remove('is-scattered');
          setTimeout(() => {
            isTumbling = false;
          }, 700);
        }, 2000);
      };

      row.addEventListener('click', triggerTumble);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          triggerTumble(e);
        }
      });
    }

    let isHovered = false;

    function onEnter() {
      if (isHovered) return;
      isHovered = true;
      row.classList.add('is-active');
      triggerScramble();
      if (!prefersReducedMotion) {
        pixelate.start();
      }
    }

    function onLeave() {
      if (!isHovered) return;
      isHovered = false;
      row.classList.remove('is-active');
      cancelScramble();
      pixelate.stop();
    }

    row.addEventListener('mouseenter', onEnter);
    row.addEventListener('pointerenter', onEnter);
    row.addEventListener('mouseleave', onLeave);
    row.addEventListener('pointerleave', onLeave);

    // Keyboard Focus handling
    row.addEventListener('focus', () => {
      rows.forEach(r => {
        if (r !== row) r.classList.remove('is-active');
      });
      row.classList.add('is-active');
      triggerScramble();
      if (!prefersReducedMotion) {
        pixelate.start();
      }
    });

    row.addEventListener('blur', () => {
      row.classList.remove('is-active');
      cancelScramble();
      pixelate.stop();
    });

    // Touch device tap handling
    row.addEventListener('touchstart', () => {
      const isAlreadyActive = row.classList.contains('is-active');
      rows.forEach(r => r.classList.remove('is-active'));
      if (!isAlreadyActive) {
        row.classList.add('is-active');
        triggerScramble();
        if (!prefersReducedMotion) {
          pixelate.start();
        }
      }
    }, { passive: true });
  });

  // Clear active state when tapping outside
  document.addEventListener('pointerdown', (e) => {
    if (!section.contains(e.target)) {
      rows.forEach(r => r.classList.remove('is-active'));
    }
  }, { passive: true });
}

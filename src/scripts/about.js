/**
 * 02 // ABOUT ME — PORTRAIT INTERACTION
 * Subtle tilt & elevation physics for knitted creator portrait
 */

export function initAboutAssetMotion() {
  const stage = document.getElementById('about-portrait-stage');
  if (!stage) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const stampContainer = stage.querySelector('#about-stamp-container');
  const cursorEl = stage.querySelector('#about-custom-cursor');

  let bounds = stage.getBoundingClientRect();
  let mouseX = 0;
  let mouseY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let isHovering = false;
  let rafId = null;

  let lastStampX = -999;
  let lastStampY = -999;
  let stampIndex = 0;

  // Pool of requested symbols: letters 1, N, P, K, A, inverted V, and celestial planets (Moon, Earth, Mars, Saturn)
  const stampPool = [
    { type: 'glyph', content: '1' },
    { type: 'planet', name: 'moon' },
    { type: 'glyph', content: 'N' },
    { type: 'planet', name: 'earth' },
    { type: 'glyph', content: 'P' },
    { type: 'inverted-v' },
    { type: 'glyph', content: 'K' },
    { type: 'planet', name: 'saturn' },
    { type: 'glyph', content: 'A' },
    { type: 'planet', name: 'mars' },
    { type: 'inverted-v' },
    { type: 'glyph', content: '1' },
    { type: 'planet', name: 'moon' },
    { type: 'glyph', content: 'N' },
    { type: 'planet', name: 'earth' }
  ];

  function spawnStamp(x, y) {
    if (!stampContainer) return;

    const item = stampPool[stampIndex % stampPool.length];
    stampIndex++;

    const stamp = document.createElement('div');
    stamp.className = 'about-stamp';
    stamp.style.left = `${x}px`;
    stamp.style.top = `${y}px`;

    const rot = (Math.random() - 0.5) * 32;
    stamp.style.setProperty('--rot', `${rot.toFixed(1)}deg`);

    if (item.type === 'glyph') {
      stamp.innerHTML = `<span class="stamp-glyph">${item.content}</span>`;
    } else if (item.type === 'inverted-v') {
      stamp.innerHTML = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19L12 5L20 19"/></svg>`;
    } else if (item.type === 'planet') {
      if (item.name === 'moon') {
        stamp.innerHTML = `<svg width="42" height="42" viewBox="0 0 44 44" fill="none" stroke="#FFFFFF" stroke-width="1.8"><circle cx="22" cy="22" r="18" /><circle cx="16" cy="17" r="3.5" fill="#FFFFFF" fill-opacity="0.4" /><circle cx="28" cy="15" r="2.2" fill="#FFFFFF" fill-opacity="0.4" /><circle cx="25" cy="28" r="4" fill="#FFFFFF" fill-opacity="0.4" /><circle cx="14" cy="27" r="2" fill="#FFFFFF" fill-opacity="0.4" /></svg>`;
      } else if (item.name === 'earth') {
        stamp.innerHTML = `<svg width="42" height="42" viewBox="0 0 44 44" fill="none" stroke="#FFFFFF" stroke-width="1.8"><circle cx="22" cy="22" r="18" /><ellipse cx="22" cy="22" rx="8" ry="18" /><line x1="4" y1="22" x2="40" y2="22" /><line x1="6.5" y1="13" x2="37.5" y2="13" /><line x1="6.5" y1="31" x2="37.5" y2="31" /></svg>`;
      } else if (item.name === 'saturn') {
        stamp.innerHTML = `<svg width="46" height="42" viewBox="0 0 48 44" fill="none" stroke="#FFFFFF" stroke-width="1.8"><circle cx="24" cy="22" r="11" /><ellipse cx="24" cy="22" rx="21" ry="6.5" transform="rotate(-24 24 22)" /></svg>`;
      } else if (item.name === 'mars') {
        stamp.innerHTML = `<svg width="42" height="42" viewBox="0 0 44 44" fill="none" stroke="#FFFFFF" stroke-width="1.8"><circle cx="22" cy="22" r="15" /><path d="M12 18 C16 16, 26 16, 32 20" /><path d="M9 25 C15 22, 28 24, 34 26" /><ellipse cx="22" cy="22" rx="20" ry="6" stroke-dasharray="3 3" /></svg>`;
      }
    }

    stampContainer.appendChild(stamp);
    setTimeout(() => {
      stamp.remove();
    }, 2000);
  }

  function onResize() {
    bounds = stage.getBoundingClientRect();
  }

  function onPointerMove(e) {
    const b = stage.getBoundingClientRect();
    const localX = e.clientX - b.left;
    const localY = e.clientY - b.top;

    if (localX < 0 || localX > b.width || localY < 0 || localY > b.height) {
      return;
    }

    const x = localX / b.width - 0.5;
    const y = localY / b.height - 0.5;
    mouseX = Math.max(-0.5, Math.min(0.5, x));
    mouseY = Math.max(-0.5, Math.min(0.5, y));

    // Update inverted-V cursor follower
    if (cursorEl) {
      cursorEl.style.transform = `translate3d(${localX}px, ${localY}px, 0) translate(-50%, -50%)`;
      cursorEl.style.opacity = '1';
    }

    // Spawn stamp pattern along movement path
    const dist = Math.hypot(localX - lastStampX, localY - lastStampY);
    if (dist >= 26) {
      lastStampX = localX;
      lastStampY = localY;
      spawnStamp(localX, localY);
    }
  }

  function update() {
    if (isHovering) {
      const targetTiltY = mouseX * 8;
      const targetTiltX = -mouseY * 8;

      currentTiltX += (targetTiltX - currentTiltX) * 0.1;
      currentTiltY += (targetTiltY - currentTiltY) * 0.1;

      stage.style.transform = `perspective(800px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translateY(-4px)`;
    } else {
      currentTiltX += (0 - currentTiltX) * 0.08;
      currentTiltY += (0 - currentTiltY) * 0.08;

      if (Math.abs(currentTiltX) > 0.01 || Math.abs(currentTiltY) > 0.01) {
        stage.style.transform = `perspective(800px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translateY(0px)`;
      } else {
        stage.style.transform = '';
      }
    }

    rafId = requestAnimationFrame(update);
  }

  function onEnter(e) {
    isHovering = true;
    const b = stage.getBoundingClientRect();
    lastStampX = e.clientX - b.left;
    lastStampY = e.clientY - b.top;
    if (cursorEl) {
      cursorEl.style.transform = `translate3d(${lastStampX}px, ${lastStampY}px, 0) translate(-50%, -50%)`;
      cursorEl.style.opacity = '1';
    }
    if (lastStampX >= 0 && lastStampX <= b.width && lastStampY >= 0 && lastStampY <= b.height) {
      spawnStamp(lastStampX, lastStampY);
    }
  }

  function onLeave() {
    isHovering = false;
    if (cursorEl) {
      cursorEl.style.opacity = '0';
    }
  }

  stage.addEventListener('mouseenter', onEnter);
  stage.addEventListener('pointerenter', onEnter);
  stage.addEventListener('mouseleave', onLeave);
  stage.addEventListener('pointerleave', onLeave);
  stage.addEventListener('mousemove', onPointerMove, { passive: true });
  stage.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  rafId = requestAnimationFrame(update);
}

/**
 * 02 // ABOUT ME — SCROLL-DRIVEN READING REVEAL
 * Progressive word-by-word reveal from subtle gray to solid black
 * as user scrolls through the sticky About Me section.
 */
export function initAboutScrollReading() {
  const section = document.getElementById('about');
  const headline = document.getElementById('about-headline');
  if (!section || !headline) return;

  const words = headline.querySelectorAll('.about-word');
  if (!words.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    words.forEach(w => {
      w.classList.add('is-read');
      w.style.setProperty('--wp', '1');
    });
    return;
  }

  let ticking = false;

  function update() {
    const rect = section.getBoundingClientRect();
    const totalScrollable = section.offsetHeight - window.innerHeight;

    if (totalScrollable <= 0) {
      words.forEach(w => {
        w.classList.add('is-read');
        w.style.setProperty('--wp', '1');
      });
      ticking = false;
      return;
    }

    // Scroll offset while pinned
    const currentScroll = -rect.top;
    const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));

    const totalWords = words.length;
    // Reading pacing: begins slightly after stick (0.04), finishes at 0.88
    const startRange = 0.04;
    const endRange = 0.88;
    const activeRange = endRange - startRange;

    words.forEach((word, index) => {
      const wordStart = startRange + (index / totalWords) * activeRange;
      const wordEnd = startRange + ((index + 1) / totalWords) * activeRange;

      let wordProgress = 0;
      if (progress >= wordEnd) {
        wordProgress = 1;
      } else if (progress <= wordStart) {
        wordProgress = 0;
      } else {
        wordProgress = (progress - wordStart) / (wordEnd - wordStart);
      }

      word.style.setProperty('--wp', wordProgress.toFixed(3));
      if (wordProgress >= 0.7) {
        word.classList.add('is-read');
      } else {
        word.classList.remove('is-read');
      }

      // Final word "DIRECTION." activates interactive state at the end of the scroll sequence
      if (index === totalWords - 1) {
        if (wordProgress >= 0.82 || progress >= 0.8) {
          word.classList.add('is-active-direction');
        } else {
          word.classList.remove('is-active-direction');
        }
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

/**
 * .1VOYSY — Site Preloader Controller
 * - Displays an authentic hollow rotating letter "V" monogram
 * - Progressively fills the letter V with deep black (#111111) as assets load
 * - When progress hits 100%, the letter locks solid black, counter hits 100%
 * - Smooth cinematic transition reveals the site cleanly
 */

export function initPreloader() {
  const preloaderEl = document.getElementById('site-preloader');
  if (!preloaderEl) return;

  const counterEl = preloaderEl.querySelector('.preloader-counter');
  const fillEl = preloaderEl.querySelector('.preloader-v-fill');
  const trackBarEl = preloaderEl.querySelector('.preloader-track-bar');

  // Lock scroll during preloading
  document.body.classList.add('is-preloading');

  let currentProgress = 0;
  let targetProgress = 12; // Start with small initial bump
  let isDone = false;
  let animationFrameId = null;

  // Track important assets
  const criticalImages = Array.from(document.querySelectorAll('img[src], picture source[srcset]'));
  const totalAssets = Math.max(1, criticalImages.length + 1); // +1 for fonts
  let loadedAssets = 0;

  function updateTargetFromAssets() {
    const assetRatio = Math.min(1, loadedAssets / totalAssets);
    // Assets account for up to 90% of progress, last 10% comes on window load or complete
    targetProgress = Math.max(targetProgress, Math.round(15 + assetRatio * 75));
  }

  // 1. Monitor fonts
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      loadedAssets++;
      updateTargetFromAssets();
    }).catch(() => {
      loadedAssets++;
      updateTargetFromAssets();
    });
  } else {
    loadedAssets++;
  }

  // 2. Monitor images
  const checkImg = (img) => {
    if (img.complete && img.naturalWidth !== 0) {
      loadedAssets++;
      updateTargetFromAssets();
    } else {
      const onDone = () => {
        img.removeEventListener('load', onDone);
        img.removeEventListener('error', onDone);
        loadedAssets++;
        updateTargetFromAssets();
      };
      img.addEventListener('load', onDone, { once: true });
      img.addEventListener('error', onDone, { once: true });
    }
  };

  document.querySelectorAll('img').forEach(checkImg);

  // 3. Monitor window load
  if (document.readyState === 'complete') {
    targetProgress = 100;
  } else {
    window.addEventListener('load', () => {
      targetProgress = 100;
    }, { once: true });
  }

  // 4. Fallback maximum timer: ensure site always opens even on slow networks
  const failsafeTimer = setTimeout(() => {
    targetProgress = 100;
  }, 4200);

  // 5. Render loop with smooth ease interpolation
  const startTime = performance.now();
  const minDisplayDuration = 1100; // minimum time in ms to enjoy the artful animation

  function render(now) {
    const elapsed = now - startTime;

    // Smooth lerp towards target
    const speed = currentProgress > 80 ? 0.08 : 0.06;
    currentProgress += (targetProgress - currentProgress) * speed;

    // Linear floor: smoothly advance even before heavy images arrive
    const naturalP = Math.min(95, (elapsed / minDisplayDuration) * 85);
    if (naturalP > currentProgress && targetProgress < 100) {
      currentProgress = naturalP;
    }

    if (targetProgress >= 100 && elapsed >= minDisplayDuration) {
      // Accelerate rapidly to 100% once ready and min duration elapsed
      currentProgress += (100 - currentProgress) * 0.16;
      if (100 - currentProgress < 0.4) {
        currentProgress = 100;
      }
    }

    const roundedProgress = Math.min(100, Math.floor(currentProgress));
    preloaderEl.style.setProperty('--load-progress', `${roundedProgress}%`);

    if (counterEl) {
      counterEl.textContent = `${String(roundedProgress).padStart(2, '0')}%`;
    }

    if (trackBarEl) {
      trackBarEl.style.width = `${roundedProgress}%`;
    }

    if (roundedProgress >= 100 && !isDone) {
      isDone = true;
      clearTimeout(failsafeTimer);
      completePreloader();
      return;
    }

    animationFrameId = requestAnimationFrame(render);
  }

  animationFrameId = requestAnimationFrame(render);

  function completePreloader() {
    preloaderEl.classList.add('is-complete');

    // Hold at 100% solid black V for a brief moment for visual impact
    setTimeout(() => {
      preloaderEl.classList.add('is-loaded');
      document.body.classList.remove('is-preloading');
      document.body.classList.add('site-ready');

      window.dispatchEvent(new CustomEvent('site:preloader-done'));

      setTimeout(() => {
        if (preloaderEl.parentNode) {
          preloaderEl.style.display = 'none';
        }
      }, 750);
    }, 280);
  }
}

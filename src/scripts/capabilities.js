/**
 * 05 // CAPABILITIES & PROCESS & ADDITIONAL WORK
 * Interactive 3D Brutalist Sculpture + Filmstrip Carousel
 */

export function initCapabilities() {
  const section = document.getElementById('capabilities');
  if (!section) return;

  // 1. Filmstrip Carousel Controls
  const wrapper = document.getElementById('filmstrip-wrapper');
  const track = document.getElementById('filmstrip-track');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');
  const counter = document.getElementById('carousel-counter');
  const cards = track ? Array.from(track.querySelectorAll('.gallery-card')) : [];

  if (wrapper && cards.length > 0) {
    const totalCards = cards.length;

    const updateCounter = () => {
      if (!counter) return;
      const scrollLeft = wrapper.scrollLeft;
      const cardWidth = cards[0].offsetWidth;
      const gap = parseInt(window.getComputedStyle(track).gap) || 20;
      const step = cardWidth + gap;
      
      const activeIdx = Math.min(
        totalCards,
        Math.max(1, Math.round(scrollLeft / step) + 1)
      );

      counter.textContent = `[ ${String(activeIdx).padStart(2, '0')} ] / [ ${String(totalCards).padStart(2, '0')} ]`;
      
      // Update button states
      if (btnPrev) {
        btnPrev.style.opacity = scrollLeft <= 10 ? '0.45' : '1';
      }
      if (btnNext) {
        const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
        btnNext.style.opacity = scrollLeft >= maxScroll - 10 ? '0.45' : '1';
      }
    };

    const getScrollStep = () => {
      const cardWidth = cards[0].offsetWidth;
      const gap = parseInt(window.getComputedStyle(track).gap) || 20;
      return cardWidth + gap;
    };

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const step = getScrollStep();
        wrapper.scrollBy({ left: step, behavior: 'smooth' });
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        const step = getScrollStep();
        wrapper.scrollBy({ left: -step, behavior: 'smooth' });
      });
    }

    // Passive scroll listener for counter updates
    let scrollTicking = false;
    wrapper.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          updateCounter();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    // Keyboard navigation when focused
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        wrapper.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        wrapper.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      }
    });

    // Mouse drag-to-scroll support
    let isDown = false;
    let startX = 0;
    let initialScrollLeft = 0;
    let hasMoved = false;

    wrapper.addEventListener('mousedown', (e) => {
      isDown = true;
      hasMoved = false;
      wrapper.classList.add('is-dragging');
      startX = e.pageX - wrapper.offsetLeft;
      initialScrollLeft = wrapper.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      wrapper.classList.remove('is-dragging');
    });

    wrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - wrapper.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 5) hasMoved = true;
      wrapper.scrollLeft = initialScrollLeft - walk;
    });

    // Prevent link/card clicks if drag occurred
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (hasMoved) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    });

    // Initial counter render
    updateCounter();
  }

  // 2. 3D Architectural Sculpture Tilt & Interactivity
  const sculptureCol = document.getElementById('sculpture-col');
  const sculptureImg = document.getElementById('sculpture-img');

  if (sculptureCol && sculptureImg) {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let isHovering = false;
    let rafId = null;

    const renderTilt = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (isHovering) {
        sculptureImg.style.transform = `
          rotateY(${currentX * 22}deg)
          rotateX(${-currentY * 16}deg)
          scale3d(1.05, 1.05, 1.05)
          translateY(${-currentY * 10}px)
        `;
      }

      rafId = requestAnimationFrame(renderTilt);
    };

    rafId = requestAnimationFrame(renderTilt);

    sculptureCol.addEventListener('mousemove', (e) => {
      const rect = sculptureCol.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x;
      targetY = y;
      if (!isHovering) {
        isHovering = true;
        sculptureImg.classList.add('is-interacting');
      }
    });

    sculptureCol.addEventListener('mouseleave', () => {
      isHovering = false;
      targetX = 0;
      targetY = 0;
      sculptureImg.classList.remove('is-interacting');
      sculptureImg.style.transform = '';
    });
  }
}

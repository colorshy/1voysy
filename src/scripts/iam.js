/**
 * 1VOYSY — I AM Module
 * Interactive relationship between editorial discipline tags and collage fragments.
 */

export function initIAm() {
  const disciplineTags = document.querySelectorAll('.iam-discipline-tag');
  const fragments = {
    web: document.querySelector('.fragment-web'),
    ai: document.querySelector('.fragment-ai'),
    design: document.querySelector('.fragment-design'),
    build: document.querySelector('.fragment-build'),
    music: document.querySelector('.fragment-music'),
  };

  disciplineTags.forEach(tag => {
    const discipline = tag.dataset.discipline;
    const targetFragment = fragments[discipline];
    if (!targetFragment) return;

    tag.addEventListener('mouseenter', () => {
      targetFragment.style.transform = 'scale(1.05) translateZ(10px)';
      targetFragment.style.zIndex = '15';
      targetFragment.style.boxShadow = '0 16px 32px rgba(0,0,0,0.18)';
    });

    tag.addEventListener('mouseleave', () => {
      targetFragment.style.transform = '';
      targetFragment.style.zIndex = '';
      targetFragment.style.boxShadow = '';
    });
  });
}

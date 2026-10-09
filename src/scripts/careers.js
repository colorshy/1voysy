/**
 * .1VOYSY — Career / Archive Page Controller
 * Curated proof of work: selected digital projects & authentic certificates.
 */

import '../styles/variables.css';
import '../styles/base.css';
import '../styles/cursor.css';
import '../styles/careers.css';
import { initCursor } from './cursor.js';

// ========================================================
// ARCHIVE DATA (The 4 authentic projects + 3 authentic certificates)
// ========================================================
const ARCHIVE_RECORDS = [
  // --- WORKS (04) ---
  {
    id: 'work-auezov',
    category: 'WORKS',
    title: 'Auezov Digital Campus',
    image: '/assets/projects/auezov-university-logo.png',
    fit: 'contain',
    link: 'https://auezov-digital-campus.wuaze.com/?utm_source=chatgpt.com',
  },
  {
    id: 'work-noir',
    category: 'WORKS',
    title: 'Noir Coffee',
    image: '/assets/projects/noir-coffee.png',
    fit: 'cover',
    link: 'https://colorshy.github.io/noir-coffee/?utm_source=chatgpt.com',
  },
  {
    id: 'work-reform',
    category: 'WORKS',
    title: 'Re-form',
    image: '/assets/projects/reform.png',
    fit: 'contain',
    link: 'https://colorshy.github.io/basket-sait/?utm_source=chatgpt.com',
  },
  {
    id: 'work-finguard',
    category: 'WORKS',
    title: 'FinGuard AI',
    image: '/assets/projects/finguard.png',
    fit: 'contain',
    link: 'https://finguardai.org/?utm_source=chatgpt.com',
  },

  // --- CERTIFICATES (03) ---
  {
    id: 'cert-claude-code',
    category: 'CERTIFICATES',
    title: 'Claude Code',
    image: '/assets/certificates/claude-code.jpg',
    fit: 'cover',
    link: '/assets/certificates/claude-code.jpg',
  },
  {
    id: 'cert-macroeconomics',
    category: 'CERTIFICATES',
    title: 'Principles of Macroeconomics',
    image: '/assets/certificates/macroeconomics.png',
    fit: 'contain',
    link: 'https://coursera.org/verify/specialization/D566PN4ZPVV5',
  },
  {
    id: 'cert-chatgpt-api',
    category: 'CERTIFICATES',
    title: 'ChatGPT API for Web Developers',
    image: '/assets/certificates/chatgpt-api.png',
    fit: 'cover',
    link: '/assets/certificates/chatgpt-api.png',
  }
];

let activeFilter = 'ALL';

function getFilteredRecords() {
  if (activeFilter === 'ALL') return ARCHIVE_RECORDS;
  return ARCHIVE_RECORDS.filter(item => item.category === activeFilter);
}

function renderGrid() {
  const gridEl = document.getElementById('archive-grid');
  if (!gridEl) return;

  const records = getFilteredRecords();

  gridEl.innerHTML = records.map(item => `
    <a 
      href="${item.link}" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="archive-card" 
      data-id="${item.id}"
      data-category="${item.category}"
      aria-label="Open ${item.title}"
    >
      <div class="archive-card-visual">
        <img 
          src="${item.image}" 
          alt="${item.title} — ${item.category === 'CERTIFICATES' ? 'Official Certificate' : 'Project Showcase'}" 
          class="archive-card-img ${item.fit === 'contain' ? 'fit-contain' : ''}" 
          loading="lazy"
        >
      </div>
      <div class="archive-card-info">
        <h2 class="archive-card-title">${item.title}</h2>
        <span class="archive-card-arrow" aria-hidden="true">&nearr;</span>
      </div>
    </a>
  `).join('');
}

function initFilters() {
  const filterBtns = document.querySelectorAll('.archive-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      if (filter === activeFilter) return;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = filter;
      renderGrid();
    });
  });
}

function initPage() {
  initCursor();
  initFilters();
  renderGrid();

  console.info('⚡ .1VOYSY — Career / Archive Page loaded with works & certificates.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

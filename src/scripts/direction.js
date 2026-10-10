/**
 * .1VOYSY — DIRECTIONS (07) Page Controller
 * Interactive editorial direction list, active/muted focus system & cursor
 */

import '../styles/variables.css';
import '../styles/base.css';
import '../styles/cursor.css';
import '../styles/direction.css';
import '../styles/cookies.css';
import { initCursor } from './cursor.js';
import { initCookieConsent } from './cookies.js';

function initDirectionList() {
  const list = document.getElementById('directions-list');
  if (!list) return;

  const rows = list.querySelectorAll('.direction-row');

  rows.forEach((row, index) => {
    // Hover interactions for mouse pointer
    row.addEventListener('mouseenter', () => {
      list.classList.add('has-hover');
      rows.forEach(r => r.classList.remove('is-active'));
      row.classList.add('is-active');
    });

    row.addEventListener('mouseleave', () => {
      list.classList.remove('has-hover');
      row.classList.remove('is-active');
    });

    // Tap / Click toggle for touch & keyboard accessibility
    row.addEventListener('click', () => {
      const isActive = row.classList.contains('is-active');
      rows.forEach(r => r.classList.remove('is-active'));

      if (!isActive) {
        row.classList.add('is-active');
        list.classList.add('has-hover');
      } else {
        list.classList.remove('has-hover');
      }
    });

    // Keyboard support
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        row.click();
      }
    });
  });
}

function initPage() {
  initCursor();
  initDirectionList();
  initCookieConsent();

  console.info('⚡ .1VOYSY — Direction Page initialized.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

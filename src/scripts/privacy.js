/**
 * .1VOYSY — Privacy Page Controller
 */

import '../styles/variables.css';
import '../styles/base.css';
import '../styles/cursor.css';
import '../styles/cookies.css';
import '../styles/privacy.css';

import { initCursor } from './cursor.js';
import { initCookieConsent, openCookieSettings } from './cookies.js';

function boot() {
  initCursor();
  initCookieConsent();

  // Handle in-page trigger for cookie settings
  const directBtn = document.getElementById('open-cookie-preferences-btn');
  if (directBtn) {
    directBtn.addEventListener('click', () => {
      openCookieSettings();
    });
  }

  console.info('⚡ .1VOYSY — Privacy & Legal Policy page initialized.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

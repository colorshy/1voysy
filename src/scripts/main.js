/**
 * .1VOYSY — Portfolio Application Entry Point
 * Final 6-Section Architecture:
 * 01 — HERO
 * 02 — ABOUT ME
 * 03 — FEATURED WORK
 * 04 — MANIFESTO
 * 05 — CONTACT
 * 06 — FOOTER
 */

import '../styles/variables.css';
import '../styles/grid.css';
import '../styles/base.css';
import '../styles/navigation.css';
import '../styles/hero.css';
import '../styles/about.css';
import '../styles/work.css';
import '../styles/unit.css';
import '../styles/contact.css';
import '../styles/footer.css';
import '../styles/cursor.css';

import { initNavigation } from './navigation.js';
import { initContact } from './contact.js';
import { initHeroMotion } from './hero.js';
import { initAboutAssetMotion, initAboutScrollReading } from './about.js';
import { initWork } from './work.js';
import { initManifestoScene } from './manifesto.js';
import { initCursor } from './cursor.js';

function boot() {
  initCursor();
  initNavigation();
  initHeroMotion();
  initAboutAssetMotion();
  initAboutScrollReading();
  initWork();
  initManifestoScene();
  initContact();

  console.info('⚡ .1VOYSY — Six-Section Portfolio initialized.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

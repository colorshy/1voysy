import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./', import.meta.url));
const asset = (name) => `../public/assets/${name}`;
const C = {
  green: '#12241A', forest: '#1E3A2B', cream: '#F5F2EB', ink: '#111111',
  lime: '#CEF023', orange: '#FF5500', blue: '#1D5BFF', pink: '#FF699E',
  card: '#ECE6DA', white: '#FFFFFF', muted: '#9AA89E'
};
const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const words = (value) => String(value).split(/\n/).flatMap((part) => part.trim() ? part.trim().split(/\s+/) : ['']);
const wrap = (value, max) => {
  const lines = [];
  for (const paragraph of String(value).split('\n')) {
    let line = '';
    for (const word of paragraph.trim().split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && next.length > max) { lines.push(line); line = word; } else line = next;
    }
    if (line) lines.push(line);
  }
  return lines;
};
const T = (id, value, x, y, o = {}) => {
  const lines = Array.isArray(value) ? value : wrap(value, o.max ?? 42);
  const lh = o.lh ?? (o.size ?? 16) * 1.25;
  return `<g id="${id}" fill="${o.fill ?? C.cream}" font-family="${o.family ?? 'Plus Jakarta Sans'}" font-size="${o.size ?? 16}" font-weight="${o.weight ?? 400}" letter-spacing="${o.spacing ?? 0}"${o.italic ? ' font-style="italic"' : ''}>${lines.map((line, i) => `<text x="${x}" y="${y + i * lh}">${esc(line)}</text>`).join('')}</g>`;
};
const R = (id, x, y, w, h, fill = 'none', extra = '') => `<rect id="${id}" x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const L = (id, x1, y1, x2, y2, stroke = C.muted, extra = '') => `<line id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" ${extra}/>`;
const I = (id, name, x, y, w, h) => `<image id="${id}" href="${asset(name)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`;
const bg = (w, h) => `<defs><pattern id="textile-pattern" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="${C.forest}"/><rect width="20" height="20" fill="${C.cream}" opacity=".1"/><rect x="20" y="20" width="20" height="20" fill="${C.cream}" opacity=".1"/><path d="M0 10H40M0 30H40M10 0V40M30 0V40" stroke="${C.cream}" opacity=".08"/></pattern></defs><rect id="textile-background" width="${w}" height="${h}" fill="${C.green}"/><rect id="textile-checkerboard" width="${w}" height="${h}" fill="url(#textile-pattern)"/>`;
const shell = (w, h, id, content) => `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="document-${id}-title"><title id="document-${id}-title">.1VOYSY ${id} design export</title>${bg(w, h)}${content}</svg>`;
const header = (n, label, title, w, mobile = false) => `<g id="${n}-header">${T(`${n}-meta`, label, 20, 72, { family: 'Space Mono', size: 12, fill: C.lime, spacing: 1.6, max: 48 })}${T(`${n}-title`, title, 20, 145, { family: 'Anton', size: mobile ? 54 : 92, max: 28 })}</g>`;
const rule = (id, y, w) => L(id, 20, y, w - 20, y, 'rgba(245,242,235,.22)', 'stroke-width="1"');
const badge = (id, label, x, y, fill = C.orange) => `${R(id, x, y, Math.max(112, label.length * 7.2), 26, fill, 'stroke="#111" stroke-width="1"')}${T(`${id}-label`, label, x + 10, y + 18, { family: 'Space Mono', size: 10, weight: 700, fill: C.cream, max: 40 })}`;

const projectData = [
  ['01', 'NOIR COFFEE', 'BRAND IDENTITY & DIGITAL PLATFORM // 2026', 'Tactile digital storefront and identity merging minimalist Swiss typography with bespoke interactive retail experience and single-step checkout.', 'project-noir.webp', 'VITE · TYPESCRIPT · TAILWIND · CANVAS'],
  ['02', 'AOE / AUEZOV PROJECT', 'ACADEMIC DIGITAL ECOSYSTEM REDESIGN // 2026', 'Comprehensive institutional portal and digital campus architecture rethinking navigation hierarchy, educational portals, research archives, and high-contrast typography for higher education. [IN PROGRESS / UNFINISHED — DO NOT PRESENT AS COMPLETED].', 'project-auezov.png', 'WORDPRESS · CUSTOM THEME · GUTENBERG · ACCESSIBILITY'],
  ['03', 'RE:FORM', 'MODULAR 3D BASKETBALL EXPERIENCE // 2026', 'Decoupling pneumatic pressure vessel from replaceable Horween leather shells using magnetic channel retention. Real-time Three.js exploded deconstruction and physical surface shaders.', 'project-reform-hero.png', 'THREE.JS · GLSL SHADERS · GSAP · WEBGL'],
  ['04', 'ALL WORK', 'EXPERIMENTS & PROTOTYPES // 2024 — 2026', 'Complete chronological index of production websites, private tools, interactive shaders, and experimental prototypes.', null, 'SHADERS · TYPOGRAPHY · AI TOOLS · PROTOTYPES']
];

function hero(w, h, m) {
  const x = m ? 20 : 84;
  return `<g id="hero-navigation">${T('hero-brand', '.1VOYSY', m ? 20 : 76, 44, { family: 'Anton', size: m ? 22 : 38, spacing: 1 })}<g id="hero-menu"><rect x="${w - (m ? 52 : 90)}" y="28" width="28" height="2" fill="${C.cream}"/><rect x="${w - (m ? 52 : 90)}" y="37" width="19" height="2" fill="${C.cream}"/></g></g><g id="hero-editorial-stage">${T('hero-creative', 'CREATIVE', x, m ? 420 : 620, { family: 'Playfair Display', size: m ? 50 : 150, spacing: m ? -1 : -3.5, max: 20 })}${T('hero-developer', 'DEVELOPER', x + (m ? 14 : 110), m ? 475 : 760, { family: 'Playfair Display', size: m ? 50 : 150, spacing: m ? -1 : -3.5, max: 20 })}<g id="hero-subtitle">${R('hero-subtitle-dot', x + (m ? 14 : 110), m ? 520 : 820, 6, 6, C.lime)}${T('hero-subtitle-text', 'AI / WEB / DIGITAL EXPERIENCES', x + (m ? 28 : 126), m ? 526 : 828, { family: 'Space Mono', size: m ? 9 : 13, spacing: m ? 1.4 : 2.4, max: 48 })}</g></g>`;
}

function about(w, h, m) {
  const left = 48, right = m ? 20 : w * .56, width = m ? w - 40 : w * .39;
  const collage = `${T('about-sticker-multidisciplinary', 'multidisciplinary', right, m ? 1010 : 130, { family: 'Playfair Display', size: 25, fill: C.orange, italic: true, max: 30 })}${T('about-sticker-creative', 'creative', right + 42, m ? 1050 : 174, { family: 'Playfair Display', size: 25, fill: C.pink, italic: true, max: 20 })}${R('about-web-fragment', right, m ? 1120 : 230, width, 150, '#E2EFFF', 'stroke="#111"')}${T('about-web-title', 'WEB', right + 14, m ? 1154 : 260, { family: 'Anton', size: 30, fill: C.blue, max: 10 })}${T('about-web-detail', '01 // CODE\nCANVAS / WEBGL / INTERACTIVE', right + 14, m ? 1200 : 294, { family: 'Space Mono', size: 11, fill: C.blue, lh: 20, max: 34 })}${R('about-ai-fragment', right, m ? 1300 : 405, width, 150, '#FFF275', 'stroke="#111"')}${T('about-ai-title', 'AI', right + 14, m ? 1334 : 435, { family: 'Anton', size: 30, fill: C.ink, max: 10 })}${T('about-ai-detail', '[01001] [TENSOR] [GEN-AI] [NEURAL] [LATENT]\nGENERATIVE SYSTEMS', right + 14, m ? 1380 : 468, { family: 'Space Mono', size: 11, fill: C.ink, lh: 22, max: 30 })}${I('about-portrait', 'creator-portrait.jpg', right, m ? 1480 : 580, m ? width * .6 : width * .72, m ? 240 : 250)}${T('about-portrait-caption', 'PORTRAIT // 2026\n.1VOYSY', right, m ? 1750 : 852, { family: 'Space Mono', size: 10, lh: 16, max: 24 })}`;
  return `<g id="about-copy">${T('about-meta', '02 // WHO I AM', left, 72, { family: 'Space Mono', size: 12, fill: C.lime, spacing: 1.8, max: 30 })}${T('about-heading', 'WHO I AM', left, 145, { family: 'Anton', size: m ? 58 : 106, max: 20 })}${T('about-manifesto', 'A multidisciplinary creative developer bridging engineering precision with bold editorial art direction.', left, m ? 250 : 275, { family: 'Plus Jakarta Sans', size: m ? 24 : 31, weight: 700, lh: m ? 32 : 40, max: m ? 25 : 34 })}${T('about-manifesto-sub', 'Never choosing between aesthetic emotion and technical depth. I build future-focused digital narratives, interactive 3D platforms, and automated intelligence pipelines with obsessive attention to craft.', left, m ? 450 : 440, { family: 'Playfair Display', size: m ? 15 : 18, italic: true, lh: 25, max: m ? 34 : 44 })}${T('about-tags', ['WEB DEVELOPMENT', 'WEB DESIGN / UI', 'AI & AUTOMATION', 'CREATIVE DEV', 'SYSTEMS'], left, m ? 700 : 650, { family: 'Space Mono', size: 11, lh: 26, max: 32 })}${badge('about-badge', 'EDITORIAL ART DIRECTION × CODE', left, m ? 850 : 790)} </g><g id="about-collage">${collage}</g>`;
}

function work(w, h, m) {
  let y = m ? 250 : 225;
  const row = m ? 660 : 465;
  let out = `${header('work', '03 // SELECTED WORK', 'FEATURED WORK', w, m)}${T('work-projects-meta', 'SELECTED PROJECTS // CASE STUDIES', m ? 20 : w - 350, 88, { family: 'Space Mono', size: 10, max: 42 })}<g id="featured-project-list">`;
  for (const [num, title, focus, desc, imageName, tags] of projectData) {
    out += `<g id="project-${num}" data-project="${esc(title)}">${rule(`project-${num}-rule`, y - 28, w)}${T(`project-${num}-number`, num, 20, y, { family: 'Space Mono', size: 13, fill: C.lime, max: 8 })}${T(`project-${num}-focus`, focus, m ? 20 : 105, y, { family: 'Space Mono', size: 11, max: 42 })}${T(`project-${num}-title`, title, m ? 20 : 105, y + 48, { family: 'Anton', size: m ? 33 : 48, max: m ? 24 : 34 })}${T(`project-${num}-description`, desc, m ? 20 : 105, y + (m ? 105 : 112), { family: 'Plus Jakarta Sans', size: 13, lh: 21, max: m ? 42 : 48 })}${T(`project-${num}-tags`, tags, m ? 20 : 105, y + (m ? 285 : 210), { family: 'Space Mono', size: 10, fill: C.muted, max: 42 })}${imageName ? I(`project-${num}-image`, imageName, m ? 20 : w * .64, y + (m ? 330 : -10), m ? w - 40 : w * .31, m ? 250 : 250) : `${R(`project-${num}-archive`, m ? 20 : w * .64, y + (m ? 330 : -10), m ? w - 40 : w * .31, m ? 250 : 250, 'rgba(14,28,20,.85)', 'stroke="#9AA89E" stroke-dasharray="5 5"')}${T(`project-${num}-archive-label`, 'CATALOG // 08\nARCHIVE\nEXPLORE EXPERIMENTAL WORK ↓', m ? 46 : w * .69, y + (m ? 410 : 95), { family: 'Space Mono', size: 12, fill: C.lime, lh: 28, max: 28 })}`}</g>`;
    y += row;
  }
  return `${out}</g>`;
}

const capabilities = [
  ['01', 'WEB DEVELOPMENT', 'Front-End & Engineering', 'High-performance front-end architecture, modern JavaScript & TypeScript, responsive systems, clean semantic code, zero-bloat web engineering.'],
  ['02', 'WEB DESIGN / UI', 'Editorial Art Direction & Grid Systems', 'Editorial publication aesthetics, Swiss grid systems, bespoke typographic scale, comprehensive design tokens, Figma-to-code precision.'],
  ['03', 'AI', 'Generative & Agentic Pipelines', 'LLM pipeline integration, multimodal AI workflows, intelligent prompt orchestration, automated assistants, generative UI components.'],
  ['04', 'INTERACTIVE DEV', 'WebGL, Three.js & Micro-Interactions', 'Custom WebGL/Three.js shaders, interactive canvas environments, GSAP physics micro-animations, tactile pointer interactions.'],
  ['05', 'AUTOMATION', 'Headless Workflows & Tooling', 'Headless workflows, API integrations, build optimization, automated content pipelines, custom operational scripts.']
];
const services = [
  ['01', 'WEBSITES / PORTFOLIOS', 'Digital Homes & Founder Presences', 'Bespoke digital homes, founder portfolios, and studio presences built to command authority and communicate distinct identity.', 'DESIGN · DEVELOPMENT · RESPONSIVE · DEPLOYMENT'],
  ['02', 'WEB DESIGN / UI SYSTEMS', 'Design Systems & Tokens', 'Cohesive digital design languages, reusable design systems, components, typography scales, and tokenized style architectures.', 'DESIGN SYSTEM · UI KIT · TOKEN SPECS'],
  ['03', 'INTERACTIVE EXPERIENCES', '3D & Creative Engineering', '3D product configurators, animated campaign websites, interactive narratives, and immersive WebGL showcases that captivate audiences.', '3D CONFIGURATOR · WEBGL SHADERS · CANVAS LOGIC'],
  ['04', 'AI × WEB INTEGRATION', 'Generative Intelligence & APIs', 'Embedding generative intelligence, natural language interfaces, custom AI assistants, and automated intelligence directly into web apps.', 'LLM PIPELINES · API ENDPOINTS · CUSTOM WIDGETS'],
  ['05', 'WORDPRESS DEVELOPMENT', 'Bespoke Themes & Headless Architecture', 'Custom theme engineering, bespoke Gutenberg blocks, headless decoupled architectures, and tailored editorial CMS setups.', 'CUSTOM THEME · TAILORED ADMIN · PERFORMANCE']
];
const processSteps = [
  ['01', 'DISCOVER', 'Uncovering core objectives, technical constraints, visual references, and brand posture before writing a single line of code.'],
  ['02', 'DESIGN', 'Establishing typography systems, grid foundations, spatial cadence, and high-fidelity art direction in unison with code feasibility.'],
  ['03', 'BUILD', 'Implementing clean, modular architecture with semantic HTML, fluid CSS, performant logic, and responsive breakpoints.'],
  ['04', 'REFINE', 'Tuning micro-interactions, optical contrast, framerate budgets, tactile feedback, and accessibility compliance.'],
  ['05', 'LAUNCH', 'Production build optimization, asset compression, cross-browser validation, deployment pipeline verification, and handoff.']
];
function listSection(id, label, title, items, w, m, kind) {
  let y = m ? 245 : 220;
  const rowH = kind === 'process' ? (m ? 245 : 105) : (m ? 265 : 145);
  let out = `${header(id, label, title, w, m)}<g id="${id}-list">`;
  for (const item of items) {
    const [num, name, focus, desc, extra] = item;
    out += `<g id="${id}-row-${num}">${rule(`${id}-${num}-rule`, y - 22, w)}${T(`${id}-${num}-number`, num, 20, y + 12, { family: 'Space Mono', size: 12, fill: C.lime, max: 8 })}${T(`${id}-${num}-name`, name, m ? 20 : 105, y + 12, { family: 'Anton', size: m ? 28 : 34, max: m ? 28 : 30 })}${focus ? T(`${id}-${num}-focus`, focus, m ? 20 : 105, y + 45, { family: kind === 'process' ? 'Plus Jakarta Sans' : 'Playfair Display', size: 13, italic: kind !== 'process', max: m ? 40 : 42 }) : ''}${T(`${id}-${num}-description`, desc, m ? 20 : (kind === 'process' ? 20 : w * .55), y + (focus ? (m ? 82 : 78) : 44), { family: 'Plus Jakarta Sans', size: 13, lh: 21, max: m ? 45 : 58 })}${extra ? T(`${id}-${num}-deliverables`, extra, m ? 20 : w * .79, y + 44, { family: 'Space Mono', size: 10, fill: C.muted, max: 24 }) : ''}</g>`;
    y += rowH;
  }
  return `${out}</g>`;
}

function statement(w, h, m) {
  return `<g id="statement-content">${T('statement-meta', '04 // CORE STATEMENT', 20, 72, { family: 'Space Mono', size: 12, spacing: 1.8, max: 30 })}${rule('statement-top-rule', 94, w)}${T('statement-quote', '"WE REFUSE TO CHOOSE BETWEEN COLD TECHNICAL RIGOR AND', 20, m ? 190 : 220, { family: 'Playfair Display', size: m ? 32 : 64, lh: m ? 39 : 70, max: m ? 22 : 34 })}${T('statement-quote-emphasis', 'RAW ART DIRECTION".', 20, m ? 350 : 360, { family: 'Playfair Display', size: m ? 32 : 64, italic: true, fill: C.lime, lh: m ? 39 : 70, max: 30 })}${T('statement-detail', 'EVERY SYSTEM MUST BE INTENTIONAL, TACTILE, AND VISUALLY ARRESTING.', 20, m ? 485 : 510, { family: 'Space Mono', size: m ? 11 : 14, spacing: 1, max: m ? 35 : 60 })}${rule('statement-bottom-rule', h - 80, w)}${T('statement-colophon', 'PHILOSOPHY // .1VOYSY', 20, h - 42, { family: 'Space Mono', size: 11, max: 30 })}</g>`;
}

function archive(w, h, m) {
  const items = [['ARCH-01', 'VARIABLE GROTESK', 'Kinetic Typography & Audio API Study', '2025', 'LAB PROTOTYPE'], ['ARCH-02', 'ARCHI-TEXTILES', 'Parametric GLSL Surface Simulation', '2025', 'EXPERIMENT'], ['ARCH-03', '[AI WORKFLOW / TBD]', 'Multimodal Agent Interface Prototype', '2026', '[IN LAB // TBD]'], ['ARCH-04', '[VISUAL STUDY / TBD]', 'Tactile Micro-Interactions & Elasticity', '2026', '[EXPERIMENT // TBD]']];
  let y = m ? 270 : 235;
  let out = `${header('archive', '08 // ARCHIVE & LAB', 'ADDITIONAL WORK', w, m)}${T('archive-subtitle', 'EXPERIMENTS, PROTOTYPES & LAB STUDIES', m ? 20 : w - 390, 88, { family: 'Space Mono', size: 10, max: 40 })}<g id="archive-table">${T('archive-table-head', 'INDEX                 SPECIMEN / EXPERIMENT                 DISCIPLINE                 YEAR                 STATUS', 20, y - 28, { family: 'Space Mono', size: 10, fill: C.muted, max: 120 })}`;
  for (const [code, name, discipline, year, status] of items) {
    out += `<g id="archive-${code.toLowerCase()}">${rule(`archive-${code}-rule`, y - 14, w)}${T(`archive-${code}-code`, code, 20, y + 18, { family: 'Space Mono', size: 11, fill: C.muted, max: 12 })}${T(`archive-${code}-name`, name, m ? 20 : 150, y + 18, { family: 'Anton', size: m ? 23 : 26, max: 30 })}${T(`archive-${code}-discipline`, discipline, m ? 20 : 430, y + 18, { family: 'Plus Jakarta Sans', size: 12, max: 38 })}${T(`archive-${code}-year`, year, m ? 20 : w - 210, y + 18, { family: 'Space Mono', size: 11, fill: C.muted, max: 8 })}${T(`archive-${code}-status`, status, m ? 20 : w - 130, y + 48, { family: 'Space Mono', size: 10, fill: status.includes('TBD') ? C.muted : C.lime, max: 25 })}</g>`;
    y += m ? 145 : 92;
  }
  return `${out}</g>`;
}

function contact(w, h, m) {
  const x = m ? 20 : 48;
  return `<g id="contact-content">${header('contact', '09 // INITIATE DIALOGUE', "LET'S WORK TOGETHER", w, m)}${T('contact-statement', 'Open for selected freelance commissions, full-stack digital product builds, and creative art direction worldwide.', x, m ? 255 : 250, { family: 'Plus Jakarta Sans', size: m ? 18 : 23, weight: 700, lh: 31, max: m ? 32 : 42 })}${T('contact-email-label', 'DIRECT EMAIL ACTION', x, m ? 430 : 360, { family: 'Space Mono', size: 11, max: 25 })}${T('contact-email', 'hello@1voysy.studio', x, m ? 470 : 405, { family: 'Plus Jakarta Sans', size: m ? 22 : 28, weight: 800, max: 30 })}${L('contact-email-rule', x, m ? 480 : 414, x + (m ? 250 : 290), m ? 480 : 414, C.orange, 'stroke-width="2"')}${T('contact-channels', 'EXTERNAL CHANNELS\nGITHUB [TBD] ↗\nLINKEDIN [TBD] ↗\nX / TWITTER [TBD] ↗\nTELEGRAM [TBD] ↗', x, m ? 580 : 500, { family: 'Space Mono', size: 11, lh: 27, max: 30 })}${T('contact-status', 'STATUS & AVAILABILITY\nCURRENT CAPACITY: ACCEPTING COMMISSIONS FOR Q4/2026\nRESPONSE WINDOW: WITHIN 24 HOURS // GLOBAL REMOTE', x, m ? 780 : 665, { family: 'Space Mono', size: 10, lh: 22, max: 44 })}<g id="contact-form" transform="${m ? 'translate(20 980)' : `translate(${w * .56} 230)`}">${R('contact-form-panel', 0, 0, m ? w - 40 : w * .39, m ? 340 : 550, C.card, 'stroke="#111"')}${T('contact-form-title', 'COMMISSION INQUIRY FORM', 24, 38, { family: 'Space Mono', size: 11, fill: C.ink, max: 30 })}${T('contact-form-name', 'YOUR NAME OR STUDIO *\\n________________________________', 24, 88, { family: 'Space Mono', size: 11, fill: C.ink, lh: 26, max: 38 })}${T('contact-form-email', 'EMAIL ADDRESS *\\n________________________________', 24, 160, { family: 'Space Mono', size: 11, fill: C.ink, lh: 26, max: 38 })}${T('contact-form-message', 'PROJECT DETAILS & TIMELINE *\\n________________________________\\n________________________________\\n________________________________', 24, 232, { family: 'Space Mono', size: 11, fill: C.ink, lh: 25, max: 42 })}${R('contact-submit', 24, m ? 290 : 475, 190, 38, C.ink)}${T('contact-submit-label', 'SUBMIT INQUIRY  →', 38, m ? 315 : 500, { family: 'Space Mono', size: 11, weight: 700, fill: C.white, max: 25 })}</g></g>`;
}

function footer(w, h, m) {
  return `<g id="footer-content">${T('footer-brand', '.1VOYSY', 20, 120, { family: 'Anton', size: m ? 62 : 110, max: 20 })}${T('footer-edition', 'EDITION 01 // 2026\nTACTILE WEB × ENGINEERING RIGOR', m ? 20 : w - 340, 120, { family: 'Space Mono', size: 11, lh: 24, max: 32 })}${rule('footer-top-rule', 160, w)}${T('footer-nav', 'HERO   ABOUT   WORK   STATEMENT   CAPABILITIES   WHAT I DO   PROCESS   ARCHIVE   CONTACT', 20, 220, { family: 'Space Mono', size: m ? 9 : 11, spacing: .5, max: m ? 34 : 120 })}${R('footer-back', w - (m ? 150 : 180), 260, 150, 36, C.cream, 'stroke="#111"')}${T('footer-back-label', 'BACK TO TOP  ↑', w - (m ? 138 : 168), 283, { family: 'Space Mono', size: 10, weight: 700, fill: C.green, max: 24 })}${L('footer-bottom-rule', 330, w)}${T('footer-copyright', '© 2026 .1VOYSY. ALL RIGHTS RESERVED.', 20, 370, { family: 'Space Mono', size: 10, max: 36 })}${T('footer-colophon', '[PRIVACY POLICY] • [TERMS OF SERVICE] • Minimal Structure + Strong Art Direction.', 20, 405, { family: 'Playfair Display', size: 13, italic: true, fill: C.muted, max: m ? 40 : 90 })}</g>`;
}

const specs = [
  ['01-HERO', 'hero', 1367, 917, 375, 844, hero],
  ['02-ABOUT', 'about', 1367, 1064, 375, 1900, about],
  ['03-FEATURED-WORK', 'work', 1367, 2189, 375, 3063, work],
  ['04-STATEMENT', 'statement', 1367, 740, 375, 647, statement],
  ['05-CAPABILITIES', 'capabilities', 1367, 1173, 375, 1330, (w, h, m) => listSection('capabilities', '05 // DISCIPLINE MATRIX', 'CAPABILITIES', capabilities, w, m, 'capability')],
  ['06-WHAT-I-DO', 'what-i-do', 1367, 1331, 375, 1660, (w, h, m) => listSection('what-i-do', '06 // COMMERCIAL ENGAGEMENT', 'WHAT I DO', services, w, m, 'service')],
  ['07-PROCESS', 'process', 1367, 661, 375, 1400, (w, h, m) => listSection('process', '07 // ENGINEERING METHODOLOGY', 'PROCESS', processSteps, w, m, 'process')],
  ['08-ADDITIONAL-WORK', 'archive', 1367, 731, 375, 966, archive],
  ['09-CONTACT', 'contact', 1367, 985, 375, 1365, contact],
  ['10-FOOTER', 'footer', 1367, 429, 375, 559, footer]
];

await mkdir(join(root, 'mobile'), { recursive: true });
for (const [file, id, dw, dh, mw, mh, render] of specs) {
  await writeFile(join(root, `${file}.svg`), shell(dw, dh, id, render(dw, dh, false)), 'utf8');
  await writeFile(join(root, 'mobile', `${file}.svg`), shell(mw, mh, id, render(mw, mh, true)), 'utf8');
}
console.log(`Generated ${specs.length * 2} SVG exports.`);

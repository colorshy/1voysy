# Security Changelog

All security audits, findings updates, and approved remediations for `.1VOYSY` are tracked in this file.

---

## [Unreleased / Awaiting User Approval to Implement Fixes]

### Proposed Action Items
1. **Vite Development Server Hardening (`vite.config.js`)**:
   - Remove `allowedHosts: true`.
   - Set `fs: { strict: true }`.
   - Set `host: false` (bind to localhost only).
   - Set `build.sourcemap: false` for production builds.
2. **Security Headers & CSP (`index.html`)**:
   - Inject Content Security Policy `<meta>` tag with whitelisted directives (`default-src 'self'`, `style-src` / `font-src` Google Fonts, `img-src 'self' data:`, `frame-ancestors 'none'`).
   - Add `X-Content-Type-Options: nosniff`.
   - Add `Referrer-Policy: strict-origin-when-cross-origin`.
3. **Contact Module Privacy & Refactoring (`src/scripts/contact.js`)**:
   - Remove `console.log` statements outputting client name, email, and message.
   - Refactor `feedbackBox.innerHTML` to use DOM construction (`createElement` / `textContent`).
4. **Git Hygiene**:
   - Create root `.gitignore` protecting `node_modules/`, `dist/`, `.env*`, `.playwright-mcp/`.

---

## [2026-10-03] - Gemini Second Opinion & Deep-Source Verification

### Added
- Created `SECURITY/GEMINI_SECURITY_REVIEW.md` consolidating the external audit layer with Antigravity deep-codebase verification.
- Verified all 5 Antigravity verification prompts against `src/**` and configuration files:
  - Verified 0 secrets, tokens, or `VITE_` variables in source files.
  - Confirmed absence of security headers / CSP across all deployment configs.
  - Verified that DOM manipulation in `src/scripts/` has no exploitable XSS, but identified `innerHTML` anti-pattern.
  - Verified client form validation and discovered PII leakage in `contact.js` console output.
  - Confirmed generation of production sourcemaps in `dist/`.
- Updated `SECURITY/SECURITY_AUDIT.md` and `SECURITY/SECURITY_FINDINGS.md` with unified IDs and cross-referenced matrix.

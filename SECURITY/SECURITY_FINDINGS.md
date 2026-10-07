# 1VOYSY Security Findings Registry

This document records all security observations, vulnerabilities, and hardening recommendations identified in the `.1VOYSY` codebase during the local security audit, cross-referenced with the Gemini Second-Opinion Review.

---

## Unified Findings Matrix

| Local ID | Gemini ID | Title | Severity | Status | Verification Layer |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **SEC-VITE-001** | `VITE-01` | Permissive Dev Server (`allowedHosts`, `fs.strict: false`) | **HIGH** | Confirmed | Antigravity Verified |
| **SEC-HEAD-001** | `HDR-01` | Missing Content Security Policy & Security Headers | **HIGH** | Confirmed | Gemini & Antigravity Verified |
| **SEC-PRIV-001** | — | Contact Form Logs Cleartext PII to Browser Console | **LOW** | Confirmed | Antigravity Verified (`src/`) |
| **SEC-CONF-001** | `ENV-01` | Missing `.gitignore` & Risk of Unintended Git Tracking | **LOW** | Confirmed | Gemini & Antigravity Verified |
| **SEC-PROD-001** | `PROD-01` | Production Sourcemap Emission Enabled (`sourcemap: true`) | **LOW** | Confirmed | Gemini & Antigravity Verified |
| **SEC-EXT-001** | `EXT-01` | Google Fonts Loaded without SRI / CSP Enforcement | **LOW** | Confirmed | Gemini Verified |
| **SEC-DOM-001** | `CFG-01` | Unvalidated Global Endpoint Property (`window.ONE_VOICE...`) | **LOW** | Potential | Antigravity Verified |
| **SEC-CODE-001** | `XSS-01` | `innerHTML` Template Literal Anti-Pattern in UI Scripts | **INFO** | Potential | Antigravity Verified |
| **SEC-EXP-001** | `EXP-01` | Risk of Client Exposure of Secrets via `VITE_` Prefix | **INFO** | Potential | Gemini Hygiene Warning |

---

### SEC-VITE-001 / VITE-01: Vite Dev Server Permissive Host & Strict FS Disabled

- **Severity**: **HIGH**
- **Affected File**: [`vite.config.js`](file:///c:/Users/User/Desktop/%D0%BF%D0%BE%D1%80%D1%84%D0%BE%D0%BB%D0%B8%D0%BE1/WORK%20%5BSITES%5D%20practice/my%20site%20my%20$/vite.config.js#L7-L13)
- **Affected Code / Location**:
  ```javascript
  7:     host: true,
  8:     allowedHosts: true,
  9:     cors: true,
  10:    fs: {
  11:      strict: false,
  12:    },
  ```
- **Technical Explanation**:
  `allowedHosts: true` disables host header verification on the Vite dev server, allowing any incoming request regardless of the HTTP `Host` header. Combined with `fs: { strict: false }`, Vite allows requests to read files outside the workspace directory root. If a developer visits a malicious website while running the dev server on their local machine, a DNS rebinding attack can allow that external site to issue requests to `127.0.0.1:5173` and read arbitrary files from the filesystem.
- **Realistic Impact**:
  High risk during development sessions on shared networks or while web browsing, potentially leading to local file disclosure.
- **Recommended Remediation**:
  Configure `vite.config.js` with secure development defaults:
  ```javascript
  server: {
    port: 5173,
    open: false,
    host: false, // binds to localhost only
    fs: {
      strict: true, // restrict file serving to workspace root
    },
  }
  ```
- **Status**: **CONFIRMED**

---

### SEC-HEAD-001 / HDR-01: Missing Content Security Policy and HTTP Security Headers

- **Severity**: **HIGH**
- **Affected File**: [`index.html`](file:///c:/Users/User/Desktop/%D0%BF%D0%BE%D1%80%D1%84%D0%BE%D0%BB%D0%B8%D0%BE1/WORK%20%5BSITES%5D%20practice/my%20site%20my%20$/index.html#L3-L15)
- **Affected Code / Location**:
  The `<head>` block lacks security-related `<meta>` tags or server-configured headers.
- **Technical Explanation**:
  The application does not declare a **Content Security Policy (CSP)**, **X-Content-Type-Options**, **X-Frame-Options**, or **Referrer-Policy**.
  - Without CSP, the browser has no instruction regarding which domains are trusted for script execution, style loading, font fetching, or external API communication.
  - Without `frame-ancestors 'none'` (CSP) or `X-Frame-Options: DENY`, the site can be embedded within an `<iframe>` on third-party domains, exposing users to clickjacking attacks.
- **Realistic Impact**:
  Absence of CSP removes defense-in-depth against script injection, data exfiltration, or unauthorized framing.
- **Recommended Remediation**:
  Add a strict Content Security Policy meta tag to `index.html`:
  ```html
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data:;
    connect-src 'self';
    frame-ancestors 'none';
  ">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  ```
- **Status**: **CONFIRMED**

---

### SEC-PRIV-001: Contact Form Logs Cleartext PII to Browser Console

- **Severity**: **LOW**
- **Affected File**: [`src/scripts/contact.js`](file:///c:/Users/User/Desktop/%D0%BF%D0%BE%D1%80%D1%84%D0%BE%D0%BB%D0%B8%D0%BE1/WORK%20%5BSITES%5D%20practice/my%20site%20my%20$/src/scripts/contact.js#L12-L18)
- **Affected Code / Location**:
  ```javascript
  12:   console.group('📩 [1VOYSY] Contact Inquiry Payload');
  13:   console.log('Timestamp:', new Date().toISOString());
  14:   console.log('Client Name:', payload.name);
  15:   console.log('Client Email:', payload.email);
  16:   console.log('Selected Disciplines:', payload.disciplines.join(', ') || 'None selected');
  17:   console.log('Message:', payload.message);
  18:   console.groupEnd();
  ```
- **Technical Explanation**:
  Submitting the contact inquiry logs the client's submitted name, email address, selected services, and project message directly to the browser's developer console in plaintext.
- **Realistic Impact**:
  In shared devices, screen sharing sessions, or environments with browser extensions monitoring console outputs, user contact information is exposed in cleartext.
- **Recommended Remediation**:
  Remove the debug console logging of user inputs in production code, or wrap it in a development flag (`if (import.meta.env.DEV) ...`).
- **Status**: **CONFIRMED**

---

### SEC-CONF-001 / ENV-01: Missing .gitignore Configuration

- **Severity**: **LOW**
- **Affected File**: Project Root
- **Affected Code / Location**: Missing `.gitignore`
- **Technical Explanation**:
  The project directory lacks a `.gitignore` file and is not currently initialized as a git repository.
- **Realistic Impact**:
  When git is initialized, developers risk committing build outputs (`dist/`), dependencies (`node_modules/`), test traces (`.playwright-mcp/`), and future `.env` files containing credentials.
- **Recommended Remediation**:
  Create `.gitignore` containing:
  ```gitignore
  node_modules/
  dist/
  .env*
  !.env.example
  .playwright-mcp/
  .DS_Store
  Thumbs.db
  ```
- **Status**: **CONFIRMED**

---

### SEC-PROD-001 / PROD-01: Production Sourcemap Emission Enabled

- **Severity**: **LOW**
- **Affected File**: [`vite.config.js`](file:///c:/Users/User/Desktop/%D0%BF%D0%BE%D1%80%D1%84%D0%BE%D0%BB%D0%B8%D0%BE1/WORK%20%5BSITES%5D%20practice/my%20site%20my%20$/vite.config.js#L14-L17)
- **Affected Code / Location**:
  ```javascript
  14:   build: {
  15:     outDir: 'dist',
  16:     sourcemap: true,
  17:   }
  ```
- **Technical Explanation**:
  `build.sourcemap: true` causes Vite to generate full source map files (`.map`) alongside output bundles in `dist/`.
- **Realistic Impact**:
  When deployed, source maps make original, unminified source code, file structures, internal comments, and development utilities visible to any visitor via browser developer tools.
- **Recommended Remediation**:
  Set `sourcemap: false` for production releases, or use `sourcemap: 'hidden'` if error tracking telemetry (e.g. Sentry) is integrated.
- **Status**: **CONFIRMED**

---

### SEC-EXT-001 / EXT-01: External Resource Loading without SRI

- **Severity**: **LOW** (Downgraded from Gemini Medium)
- **Affected File**: [`index.html`](file:///c:/Users/User/Desktop/%D0%BF%D0%BE%D1%80%D1%84%D0%BE%D0%BB%D0%B8%D0%BE1/WORK%20%5BSITES%5D%20practice/my%20site%20my%20$/index.html#L11-L15)
- **Affected Code / Location**:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?..." rel="stylesheet">
  ```
- **Technical Explanation**:
  External fonts are loaded from Google Fonts without Subresource Integrity (SRI) attributes. Because Google Fonts dynamically generates CSS stylesheets based on User-Agent detection, standard SRI hashes cannot be used on Google Fonts URLs.
- **Realistic Impact**:
  Very low risk given Google's infrastructure; mitigated effectively by CSP restriction or font self-hosting.
- **Recommended Remediation**:
  Include `https://fonts.googleapis.com` in CSP `style-src` and `https://fonts.gstatic.com` in CSP `font-src`, or self-host fonts locally.
- **Status**: **CONFIRMED**

---

### SEC-DOM-001: Unvalidated Global Window Property in API Dispatch

- **Severity**: **LOW / POTENTIAL**
- **Affected File**: [`src/scripts/contact.js`](file:///c:/Users/User/Desktop/%D0%BF%D0%BE%D1%80%D1%84%D0%BE%D0%BB%D0%B8%D0%BE1/WORK%20%5BSITES%5D%20practice/my%20site%20my%20$/src/scripts/contact.js#L21-L28)
- **Affected Code / Location**:
  ```javascript
  21:   if (typeof window.ONE_VOICE_API_ENDPOINT === 'string' && window.ONE_VOICE_API_ENDPOINT) {
  22:     const res = await fetch(window.ONE_VOICE_API_ENDPOINT, {
  23:       method: 'POST',
  24:       headers: { 'Content-Type': 'application/json' },
  25:       body: JSON.stringify(payload)
  26:     });
  27:     return res.json();
  28:   }
  ```
- **Technical Explanation**:
  The application reads `window.ONE_VOICE_API_ENDPOINT` without URL origin validation before dispatching sensitive user inquiry payloads (`name`, `email`, `message`) via HTTP POST.
- **Realistic Impact**:
  If a DOM clobbering vulnerability or third-party script overrides `ONE_VOICE_API_ENDPOINT`, inquiry data could be sent to an arbitrary external URL.
- **Recommended Remediation**:
  Use Vite environment variables (e.g. `import.meta.env.VITE_CONTACT_API_ENDPOINT`) or validate that the endpoint matches an approved HTTPS origin before executing the request.
- **Status**: **POTENTIAL**

---

### SEC-CODE-001 / XSS-01: innerHTML Template Literal Usage Anti-Pattern

- **Severity**: **INFORMATIONAL / POTENTIAL**
- **Affected File**: [`src/scripts/interactions.js`](file:///c:/Users/User/Desktop/%D0%BF%D0%BE%D1%80%D1%84%D0%BE%D0%BB%D0%B8%D0%BE1/WORK%20%5BSITES%5D%20practice/my%20site%20my%20$/src/scripts/interactions.js#L68-L74), [`src/scripts/contact.js`](file:///c:/Users/User/Desktop/%D0%BF%D0%BE%D1%80%D1%84%D0%BE%D0%BB%D0%B8%D0%BE1/WORK%20%5BSITES%5D%20practice/my%20site%20my%20$/src/scripts/contact.js#L134-L140)
- **Technical Explanation**:
  `brandTitle.innerHTML` parses a hardcoded string (`.1VOYSY`), and `feedbackBox.innerHTML` runs `escapeHtml()` on `payload.name`. Although immediate exploitation is prevented, string interpolation inside `innerHTML` is an anti-pattern that creates regression risks.
- **Realistic Impact**:
  Currently mitigated; poses maintainability and regression risks.
- **Recommended Remediation**:
  Replace `innerHTML` with DOM creation APIs (`document.createElement`, `textContent`) or sanitize HTML blocks with DOMPurify.
- **Status**: **POTENTIAL**

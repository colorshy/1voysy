# Commercial & Compliance Website Plan: .1VOYSY

## 1. Project Snapshot
- **Business / Product**: Creative engineering studio and personal brand of **Askar Kaimekin** (`.1VOYSY`). Multidisciplinary focus: Creative Development, Modern Web Design, Interactive 3D (WebGL / Three.js), and AI-driven web systems.
- **Website Type**: High-craft commercial portfolio & lead-generation platform (Type A + B under RK compliance framework).
- **Target Geography & Languages**: Primary hub in Shymkent, Kazakhstan (with global client reach: US, Europe, Central Asia). Interface: English (international clientele), with Kazakhstan legal localization requirements (Russian / Kazakh legal disclosure baseline).
- **Main Business Goal**: Generate qualified commercial leads for high-value client projects (bespoke web development, creative direction, 3D interaction) and selective advisory/full-time partnerships.
- **Primary Visitor Action**: Submit inquiry form with project details or direct business contact via email (`askar270819@gmail.com`) / Telegram.
- **Scope & Constraints**: Vanilla JS, Vite 6, Supabase, GSAP, Three.js, Vercel hosting. High-craft monolithic dark aesthetic. No unnecessary heavy external tracking or unsolicited marketing cookies.

---

## 2. Missing Inputs & Decisions (NEEDS_INPUT)

| Item | Why It Matters | Owner | Status |
| :--- | :--- | :--- | :--- |
| **Legal Entity & IIN/BIN** | Required for full identification under RK Consumer Protection & Law on Personal Data | Human / Client | `NEEDS_INPUT` (Indicate whether IP/ИП "Каймекин" or LLP/ТОО, provide official registration ID) |
| **Official Postal / Business Address** | Mandatory company disclosure on commercial sites operating in RK | Human / Client | `NEEDS_INPUT` (Specify registered address in Shymkent) |
| **Server & Database Physical Localization** | Art. 12 of RK Law on Personal Data mandates that databases containing personal data must physically reside in the Republic of Kazakhstan | Human / Joint | `NEEDS_INPUT` (Supabase is currently cloud-hosted outside RK; evaluate local proxy or RK database hosting for full statutory compliance) |
| **Commercial Pricing / Service Packages** | Clarifies minimum engagement budget ($1,500+, ₸750,000+) to reduce unqualified leads | Human / Client | `NEEDS_INPUT` (Confirm whether to display starting price ranges or keep custom quote model) |
| **Target Turnaround SLA** | Reduces client friction and increases inquiry conversion | Joint | Hypothesized: 24h response time. Need client confirmation |

---

## 3. Audience Hypotheses (HYPOTHESIS)

| Segment | Need / Job-to-be-Done | Objections / Questions | Awareness Stage | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1. Tech Startups & Founders (Global & KZ)** | Need an exceptional, award-level landing page or AI application UI that wows investors and users | "Can they handle complex full-stack logic or only visual fluff? Can they deliver on deadline?" | Solution-Aware to Product-Aware | `HYPOTHESIS` (Verified by FinGuard AI & Noir Coffee deliverables) |
| **2. Creative Agencies & Design Studios** | Need an elite freelance creative engineer to execute ambitious WebGL / 3D web concepts that internal teams cannot code | "Is the code maintainable? Is performance tested on mobile? Does the developer respect design systems?" | Most-Aware | `HYPOTHESIS` (Demonstrated by Three.js scenes, GSAP animations, 60fps optimization) |
| **3. Enterprise & Educational Clients (Kazakhstan)** | Modernization of digital infrastructure, internal platforms, or bespoke campus applications | "Is communication smooth? Is the developer legally compliant and reliable?" | Problem-Aware | `HYPOTHESIS` (Supported by Auezov Digital Campus project) |

---

## 4. Market & Reference Review

| Reference / Model | Relevant Patterns | Offer / Proof / CTA | Opportunity for .1VOYSY | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Awwwards Creative Developer Studios** | Monolithic dark canvas, bespoke micro-interactions, bold typography, smooth physics | High-touch custom inquiries, case study breakdowns | Differentiate by proving both creative aesthetics AND robust engineering (Supabase backend, AI integration) | Analyzed |
| **Kazakhstan Modern Digital Studios** | Local trust signals, direct contact channels (Telegram, WhatsApp), bilingual support | Fixed price packages vs tailored agency quotes | Add clear response SLA and transparent legal terms to build institutional trust | Implemented |

---

## 5. Positioning, Value Proposition & Offers

- **Core Value Proposition**: *"Never choosing between emotion and technical depth. Architecting interactive narratives and intelligent digital pipelines with obsessive craft."*
- **Main Differentiators**:
  1. High-fidelity creative direction combined with robust engineering (not just web design, but WebGL, Three.js, Supabase, AI workflows).
  2. Proven portfolio (FinGuard AI, Auezov Digital Campus, Noir Coffee, Re-form) with certified credentials (Claude Code, etc.).
  3. Clean, zero-spam, privacy-first communication.
- **Key Offer**:
  - Full-cycle creative web production: from architectural concept and UI/UX design to interactive front-end and secure backend integration.
- **Primary CTA**: `Send Details` / `Let’s Connect →` (Triggers inquiry submission with RLS protection).
- **Secondary CTA**: `askar270819@gmail.com` [COPY] / Direct email inquiry.

---

## 6. Information Architecture & Section Logic

| Section / Page | Purpose in Visitor Journey | Visitor Question / Objection | Message & Proof Required | CTA |
| :--- | :--- | :--- | :--- | :--- |
| **01 — Hero (`index.html`)** | Immediate aesthetic and disciplinary positioning | "Who is this and what caliber of work do they produce?" | Monogram preloader, textile 3D background, high-craft typography, 2026 badge | Quick scroll or `#contact` |
| **02 — About (`index.html`)** | Architectural manifesto & capability narrative | "What is their philosophy and versatility?" | Statement typography, knitted portrait, link to 7 core directions | `Explore Directions →` |
| **03 — Work (`index.html`)** | Concrete evidence of craftsmanship and execution | "What have they actually built?" | Interactive project showcases with live metrics and authentic imagery | `View Project / Live` |
| **04 — Manifesto (`index.html`)** | Emotional and philosophical alignment | "Do their principles match our standards?" | Core studio principles and work philosophy | Continue to Contact |
| **05 — Contact (`index.html`)** | Commercial lead capture with full legal consent | "How quickly will they reply? Are my data secure?" | Unchecked RK privacy consent checkbox, email copy button, honeypot protection, 24h reply notice | `Send Details →` |
| **06 — Careers Archive (`careers.html`)** | Deep-dive credentials, client proof & certifications | "Is their experience verified?" | Filterable archive (Works & Certificates: Claude Code, etc.) | `Let’s Connect →` |
| **07 — Directions (`direction.html`)** | Complete breakdown of 7 service capabilities | "Can they handle my specific technical stack?" | 7 interactive disciplines (Creative Dev, Front-end, Back-end, AI, 3D, Motion, Art Direction) | `Contact / Let's Connect` |
| **08 — Privacy & Cookies (`privacy.html`)** | Statutory RK data compliance & transparency | "How is my personal data handled? Are cookies tracked?" | Complete Privacy Policy & Cookie Terms under RK Law № 94-V | Cookie Preferences / Consent management |

---

## 7. Cookie Consent & Data Protection Architecture

### 7.1 Cookie Consent Banner & Preferences Modal
- **Initial View**: Compact non-blocking editorial banner at bottom-right/viewport bottom on first visit.
- **Required Text**:
  - Title: *«Мы используем cookies»*
  - Body: *«Мы используем cookies и аналогичные технологии для обеспечения работы сайта и сохранения настроек. Если на сайте используются дополнительные аналитические или маркетинговые технологии, они применяются в соответствии с вашим выбором и действующими правилами обработки данных. Вы можете принять все cookies, отклонить необязательные или настроить свой выбор».*
  - Direct link to Privacy Policy (`/privacy`).
- **Interactive Controls**:
  - `[ Принять все ]` — Enables all categories.
  - `[ Отклонить необязательные ]` — Strictly retains Necessary only (`functional: false, analytics: false, marketing: false`).
  - `[ Настроить ]` — Opens detailed Preferences Modal.
- **Preferences Modal Categories**:
  1. **Необходимые** (Essential / Security, UI state, session routing) — Always active, locked.
  2. **Функциональные** (Preferences, custom UI states) — Off by default until user opts in.
  3. **Аналитические** (Traffic measurement) — Off by default until user opts in.
  4. **Маркетинговые** (Advertising / Pixels) — Off by default until user opts in.
- **Persistence & Re-engagement**:
  - Consent stored in `localStorage` under `voysy_cookie_consent`.
  - Accessible via **«Cookies»** link in the global footer across all pages to reconfigure or revoke anytime.
  - No premature firing of tracking/analytics scripts before consent confirmation.

### 7.2 Personal Data & Kazakhstan Legal Requirements (Law № 94-V)
- **Consent Checkbox**: Contact form includes an explicit, **UNCHECKED by default** checkbox linking directly to `/privacy`.
- **Form Validation**: Form will not dispatch unless consent is affirmatively checked.
- **Data Minimization**: Only collects Name, Email, Telegram/Phone (optional), Reason, Message.
- **Server Localization Notice**: Supabase cloud storage requires legal notice regarding Article 12 RK Law on Personal Data (database localization in RK), documented with `NEEDS_INPUT` for client infrastructure roadmap.

---

## 8. Human Action List (HUMAN TASK)
- [ ] Provide official registered business name (e.g. ИП "Каймекин" / ТОО) and IIN/BIN (`NEEDS_INPUT`).
- [ ] Confirm official physical/postal contact address in Shymkent, Kazakhstan (`NEEDS_INPUT`).
- [ ] Review cloud hosting vs local Kazakhstan database storage strategy (Art. 12 Law № 94-V) (`NEEDS_INPUT`).
- [ ] Review commercial pricing strategy (e.g., whether to publish project starting rates or keep custom proposals) (`NEEDS_INPUT`).

---

## 9. Agent Action List (AGENT TASK)
- [x] Conduct deep codebase audit (structure, scripts, styles, forms, headers).
- [x] Create comprehensive `COMMERCIAL_PLAN.md` with compliance mapping.
- [ ] Build cookie consent banner & preferences modal (`src/scripts/cookies.js`, `src/styles/cookies.css`).
- [ ] Implement legal privacy policy page (`privacy.html`, `src/scripts/privacy.js`, `src/styles/privacy.css`).
- [ ] Update contact form in `index.html` with explicit RK data processing consent checkbox.
- [ ] Update `src/scripts/contact.js` to strictly enforce and record consent validation.
- [ ] Add Cookie preferences modal trigger & Privacy links to footers in `index.html`, `careers.html`, `direction.html`.
- [ ] Update `vite.config.js` and `vercel.json` for `/privacy` routing.
- [ ] Test build, interactions, responsive behavior, keyboard navigation, and verify zero console errors.

---

## 10. Approval Gates & Status
- [x] Brief & Commercial Analysis: COMPLETED
- [x] Kazakhstan Legal Audit: COMPLETED
- [ ] Implementation of Cookies & Privacy: IN PROGRESS
- [ ] QA & Verification: PENDING

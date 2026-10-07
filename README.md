# 1VOYSY

High-craft portfolio and personal studio website for **Askar Kaimekin** (`1voysy`).

Built with Vanilla JavaScript, Vite, Three.js, GSAP, and Supabase.

---

## ✦ Overview

The website showcases creative engineering, interactive direction, and design discipline across three multi-page entry points:

- **`index.html` (Home)**: Architectural dark monolith aesthetic, interactive 3D hero canvas, kinetic typography, manifesto, capabilities, and dynamic contact inquiry system.
- **`careers.html` (Career Archive)**: Filterable archive (`ALL`, `WORKS`, `CERTIFICATES`) with minimalist card previews, external verified links, and responsive modals.
- **`direction.html` (Direction & Services)**: Interactive disciplines and service breakdown featuring in-row floating photo previews on hover.

---

## ✦ Tech Stack

- **Framework / Bundler**: [Vite 6](https://vitejs.dev/)
- **Core Technologies**: HTML5, Vanilla CSS, Vanilla JavaScript (ES Modules)
- **3D & Animation**: [Three.js](https://threejs.org/), [GSAP](https://gsap.com/)
- **Database & Backend**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security for inquiries)
- **Deployment Target**: [Vercel](https://vercel.com/)

---

## ✦ Project Structure

```
├── public/                 # Static assets (fonts, images, icons, 3D textures)
│   ├── assets/             # Project graphics, certificates, photography
│   ├── fonts/              # Typography (Mona Sans, JetBrains Mono, Syne)
│   └── favicon.svg         # Studio favicon
├── src/
│   ├── data/               # Structured data (projects, timeline, credentials)
│   ├── scripts/            # ES modules (Three.js scene, GSAP animations, Supabase client)
│   └── styles/             # Modular CSS stylesheets (theme tokens, components, responsive)
├── supabase/
│   └── schema.sql          # Contact submission table & RLS policies
├── index.html              # Main portfolio page
├── careers.html            # Career archive page
├── direction.html          # Direction & services page
├── vite.config.js          # Multi-page build configuration
├── package.json            # Project dependencies and npm scripts
└── .env.example            # Environment variables template
```

---

## ✦ Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup (Optional)

If using the Supabase contact inquiry form, copy `.env.example` to `.env` and fill in your Supabase project credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Note**: The website runs completely without environment variables; the contact form gracefully indicates configuration status if Supabase variables are omitted.

### 3. Local Development

```bash
npm run dev
```

Runs the local development server at `http://localhost:5173`.

### 4. Production Build

```bash
npm run build
```

Generates optimized production assets in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

Previews the production build locally at `http://localhost:4173`.

---

## ✦ Deployment to Vercel

1. Import the repository into your [Vercel Dashboard](https://vercel.com/new).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build` (or `vite build`).
4. Output Directory: `dist`.
5. Environment Variables:
   - `VITE_SUPABASE_URL` (optional)
   - `VITE_SUPABASE_ANON_KEY` (optional)
6. Click **Deploy**.

---

## ✦ License

Private portfolio and creative property of Askar Kaimekin. All rights reserved.

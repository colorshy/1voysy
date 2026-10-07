# .1VOYSY — Figma Design Export (7 Sections)

This directory contains visual and structural SVG exports of the **current .1VOYSY website implementation** defined in `index.html`.
These SVGs are formatted specifically for easy drag-and-drop import and editing in **Figma**.

## Site Structure & Exported Sections

The export strictly matches the actual 7-section DOM architecture of the website:

| Section | Desktop (px) | Mobile (px) | Primary Assets |
|---|---:|---:|---|
| **01 HERO** | 1920 × 1080 | 390 × 844 | `/assets/hero-textile-landscape-2k.jpg` |
| **02 ABOUT ME** | 1920 × 733 | 390 × 847 | `/assets/reference/about-me-img-1.png` |
| **03 FEATURED WORK** | 1920 × 1827 | 390 × 715 | `/assets/projects/` (wolverine, project-noir, lightship, drake-hotel, dulcedo, all-archive) |
| **04 MANIFESTO** | 1920 × 1193 | 390 × 1380 | `/assets/reference/unit-img-0.png` |
| **05 CAPABILITIES & PROCESS** | 1920 × 1213 | 390 × 1385 | `/assets/reference/capabalities-skills-work-img-0.png` through `img-7.png` |
| **06 CONTACT** | 1920 × 994 | 390 × 918 | Daylight sky atmosphere gradient & form UI |
| **07 FOOTER** | 1920 × 887 | 390 × 921 | Locomotive agency editorial lockup & glyphs |

*Note: Additional Work / Archive is fully retained inside **Section 05**, exactly as implemented.*

## Directory Structure

```
design-export/
├── 01-HERO.svg
├── 02-ABOUT-ME.svg
├── 03-FEATURED-WORK.svg
├── 04-MANIFESTO.svg
├── 05-CAPABILITIES-PROCESS.svg
├── 06-CONTACT.svg
├── 07-FOOTER.svg
├── generate-export.mjs
├── README.md
└── mobile/
    ├── 01-HERO.svg
    ├── 02-ABOUT-ME.svg
    ├── 03-FEATURED-WORK.svg
    ├── 04-MANIFESTO.svg
    ├── 05-CAPABILITIES-PROCESS.svg
    ├── 06-CONTACT.svg
    └── 07-FOOTER.svg
```

## Figma Editability & Group Organization

- **Text Nodes**: All headlines, subheadings, paragraphs, tags, buttons, badges, coordinates, and navigation links remain live, editable `<text>` elements.
- **Logical Groups**: Every section is organized into semantic `<g id="...">` layers corresponding directly to UI components (`hero-visual-frame`, `hero-pedestal`, `about-headline`, `project-01-auezov-campus`, `additional-filmstrip-cards`, `contact-form-fields`, `footer-editorial-lockup`, etc.).
- **Vector Shapes**: Pedestals, frames, divider lines, buttons, inputs, and custom glyphs (Diamond L, Clover, Square Q, Circle C, Bridge Arrow, Pill Arrow) are preserved as vector paths, lines, and rects.
- **Raster Visuals**: Raster assets remain linked `<image>` elements pointing to the authentic project assets under `public/assets/`.

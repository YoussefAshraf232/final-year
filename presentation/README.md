# Inventory MS — Graduation Defense Deck

A self-contained, browser-native 16:9 presentation for the **Inventory MS** (Supply-Chain & Inventory Management System) graduation defense.

- **Team:** Yossef Ashraf · John Samhan · Maryam Hamdy · Momen Abdelmonam
- **Supervisor:** Prof. Mohamed Abdelbaky
- **Faculty of Science · 2026**

## Launch

Open the file directly:

```text
presentation/index.html
```

Double-click it, or serve the folder (recommended, so local image assets always resolve):

```bash
node presentation/qa/static-server.mjs    # http://127.0.0.1:4321/
```

Designed at **1920×1080**; the whole stage scales uniformly to any viewport and stays centered. No network access required — fonts fall back to the system sans stack and all assets are local.

## Controls

| Action | Keys / gesture |
|--------|----------------|
| Next | `→` · `Space` · `PageDown` · swipe left · `›` button |
| Previous | `←` · `PageUp` · swipe right · `‹` button |
| First / last slide | `Home` / `End` |
| Fullscreen | `F` · ⛶ button |
| Jump to slide N | URL hash `#N` (e.g. `…/index.html#14`) — also restored on reload |

A progress bar (top) and slide counter (bottom-right) track position. Reduced-motion preference is respected.

## Print / PDF

Browser **Print** → *Save as PDF*, landscape, **Background graphics ON**. Each slide is one page; no clipping.

## Structure (22 slides)

**Main deck (1–19):** Cover · Problem · Objectives · Solution · Users & Scope · Inventory Flow · Lifecycles · System Architecture · Code Architecture (front-to-back) · Data Domains · Security · Application UI · Auditability · Demo Plan · Testing · Challenges · Limitations & Future · Conclusion · Q&A.

**Appendix (20–22):** ERD · Permission matrix + API groups · Migrations + Deployment + Stock-movement ledger.

## Motion

Tasteful, projector-safe animation (all disabled under `prefers-reduced-motion`):

- Staggered entrance reveals (`riseIn`) replay each time a slide is shown.
- Slow Ken-Burns drift on the two UI screenshots.
- Floating brand mark + ambient blur orbs and a shimmering title on the cover/Q&A.
- Pulsing flow arrows and a soft glow on accent (stock-changing) nodes.
- Hover lift on cards and slide-in on layer/callout rows.

## Assets

- `assets/ims-mark.svg` — IMS brand mark.
- `assets/ui-sales-invoices.png`, `assets/ui-audit-logs.png` — real application screenshots used as evidence.

## QA

Visual QA was run at **1920×1080** and **1366×768** (Playwright). Result: **PASS** — 0 console errors, 0 page errors, 0 failed requests, 0 overflow findings across all 31 slides. See `qa/report.json`, `qa/summary.md`, and `qa/screens/`.

Re-run:

```bash
node .claude/skills/inventory-ms-html-deck/scripts/qa-slides.mjs presentation/index.html presentation/qa
```

(Requires `playwright` + chromium installed locally.)

## Content provenance

Every technical claim traces to the repository: Flyway migrations `V1–V14`, `SecurityConfig.java`, `roles.ts`, backend controllers/entities, and the two UI screenshots. Items labeled *future work* are proposals, not implemented features.

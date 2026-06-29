A self-contained, browser-native 16:9 presentation for the **Inventory MS** graduation defense.

- **Team:** Yossef Ashraf · John Samhan · Maryam Hamdy · Momen Abdelmonam
- **Supervisor:** Prof. Mohamed Abdelbaky
- **Faculty of Science · 2026**

Open the file directly:

```text
presentation/index.html
```

Or serve the folder so local image assets resolve consistently:

```bash
node presentation/qa/static-server.mjs    # http://127.0.0.1:4321/
```

The deck is designed at **1920x1080** and scales uniformly to the current viewport. It requires no network access; fonts fall back to the system sans stack and all screenshots are local assets.

| Action | Keys / gesture |
|--------|----------------|
| Next | Right arrow, Space, PageDown, swipe left, next button |
| Previous | Left arrow, PageUp, swipe right, previous button |
| First / last slide | Home / End |
| Fullscreen | F or fullscreen button |
| Jump to slide N | URL hash `#N`, for example `index.html#14` |

## Structure

**Narrative (1-13):** Cover, Roadmap, Problem, Objectives, Solution, Three Roles, Role Access, Inventory Flow, Lifecycles, System Architecture, Frontend Pattern, Data Domains, Security.

**Role evidence (14-33):** one application screen per slide.

- **System Admin (14-16):** Users, Reports, Audit Logs.
- **Operational Manager (17-26):** Dashboard, Products, Suppliers, Stock, Warehouses, Approve, Distribute Products, Stock Requests, Reports, Audit Logs.
- **Warehouse Manager (27-33):** Dashboard, Stock, Customers, Manage Sales, Sales Returns, Receive Orders, Request Stock Edit.

**Close (34-39):** Demo Plan, Testing, Challenges, Limitations and Future Work, Conclusion, Q&A.

**Appendix (40-42):** ERD domains, permission matrix, engineering facts and stock-movement shape.

The deck keeps the three-role explanation unchanged and separates every role screen onto its own slide. Each role screen slide pairs a cropped screenshot with a purpose panel explaining why the page exists and what it proves. Operational Manager appears after System Admin and before Warehouse Manager, and the Receive Orders page is included under Warehouse Manager.

## Assets

- `assets/ims-mark.svg` - IMS brand mark.
- `assets/admin-users.png`, `assets/admin-reports.png`, `assets/admin-audit-logs.png` - System Admin screenshots.
- `assets/op-dashboard.png`, `assets/op-products.png`, `assets/op-suppliers.png`, `assets/op-stock.png`, `assets/op-warehouses.png`, `assets/op-approve.png`, `assets/op-distribute-products.png`, `assets/op-stock-requests.png`, `assets/op-reports.png`, `assets/op-audit-logs.png` - Operational Manager screenshots.
- `assets/om-dashboard.png`, `assets/om-stock.png`, `assets/om-customers.png`, `assets/om-sales.png`, `assets/om-sales-returns.png`, `assets/wm-receive-orders.png`, `assets/om-stock-edit.png` - Warehouse Manager screenshots.
- `assets/ui-audit-logs.png`, `assets/ui-sales-invoices.png` - retained supporting/legacy evidence assets.

## Visual QA

Visual QA is run at **1920x1080** and **1366x768** with Playwright.

```bash
node .agents/skills/inventory-ms-html-deck/scripts/qa-slides.mjs presentation/index.html presentation/qa
```

Expected gates:

- No slide scrollbars.
- No clipped content or broken images.
- 0 console errors and 0 page errors.
- Working keyboard, button, hash, fullscreen, and touch navigation.
- Print/PDF mode keeps each slide on one page.

See `presentation/qa/report.json`, `presentation/qa/summary.md`, and `presentation/qa/screens/` for the latest QA run.

## Source Traceability

Technical claims are grounded in the current repository: `src/constants/roles.ts`, `src/constants/routes.ts`, frontend page/hook/service patterns, Spring Boot backend structure, PostgreSQL/Flyway migrations `V1` through `V14`, and the supplied application screenshots. Items labeled future work are proposals, not completed implementation.

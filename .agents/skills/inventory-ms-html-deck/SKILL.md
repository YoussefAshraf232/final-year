---
name: inventory-ms-html-deck
description: Create, revise, and visually QA a polished self-contained HTML slide deck for the Inventory MS / Inflow graduation project. Use whenever the user asks for HTML slides, a graduation-defense presentation, Level 2 or Level 3 slide work, a presentation matching the project's UI, project storytelling, speaker-ready diagrams, or browser-based visual QA. Inspect the repository and supplied screenshots as the source of truth, generate the deck, then render and fix it with Playwright before declaring it complete.
argument-hint: "[create|revise|qa] [optional output path]"
---

# Inventory MS HTML Deck

Create a presentation that looks like a projector-readable extension of the actual Inventory MS application, not a generic graduation template.

## Start here

1. Inspect the repository before writing slide content.
2. Read `references/project-context.md`.
3. Read `references/visual-system.md`.
4. Read `references/storyboard.md`.
5. For generation or revision, read `references/level-2-build.md`.
6. For completion or review, read `references/level-3-qa.md`.
7. Treat source code and migrations as authoritative when documentation conflicts with implementation.

## Source-of-truth order

Use this priority:

1. Executable source code, database migrations, tests, and current runtime behavior.
2. Current UI screenshots and implemented routes.
3. README, presentation drafts, and other documentation.
4. Assumptions only when explicitly labeled.

Never invent completed modules, metrics, integrations, test results, or business outcomes.

## Required workflow

### Phase A — Evidence collection

- Identify the official project name and branding.
- Map the frontend, backend, database, security, deployment, and major business workflows.
- Verify every slide claim against the repository.
- Locate current screenshots or capture them from the running application.
- Ask only for genuinely missing identity details such as student names, supervisors, university, department, and presentation duration.

### Phase B — Story design

Build a coherent defense narrative:

1. Operational problem.
2. Objectives and proposed solution.
3. Main users and functional scope.
4. End-to-end inventory and invoice workflows.
5. Architecture and engineering decisions.
6. Security, data integrity, and auditability.
7. UI demonstration and evidence.
8. Testing, challenges, limitations, and future work.
9. Conclusion and questions.

Prefer 16–20 main slides plus appendix. One message or decision per slide.

### Phase C — Level 2 implementation

- Produce a browser-native 16:9 HTML presentation.
- Default output: `presentation/index.html`.
- Keep the deck self-contained when practical.
- Use local assets when available.
- Provide keyboard, click, touch, fullscreen, slide-number, and progress controls.
- Ensure every slide fits one viewport without internal scrolling.
- Use staged reveals only when they support the speaker.
- Add speaker notes in source comments or a notes data structure.
- Add a print/PDF mode.
- Include an appendix for dense technical material.

### Phase D — Level 3 visual QA

Do not stop after generating HTML.

1. Serve the deck over localhost.
2. Open it with Playwright MCP or Playwright CLI.
3. Inspect every slide at 1920×1080 and 1366×768.
4. Navigate using the same controls the presenter will use.
5. Capture screenshots of every slide.
6. Check clipping, overflow, tiny text, broken assets, contrast, animation order, console errors, and control behavior.
7. Edit the HTML/CSS/JS.
8. Reload and repeat until all mandatory gates pass.
9. Produce a QA report listing the checked viewports, screenshots, issues fixed, and any remaining limitations.

Use `scripts/qa-slides.mjs` as the deterministic fallback when browser MCP is unavailable.

## Visual direction

Match the supplied UI:

- Light gray-blue canvas.
- White compact panels.
- Indigo-purple primary actions.
- Thin cool-gray borders.
- Small restrained radii.
- Minimal shadows.
- Inter or a system sans-serif stack.
- Lucide-style outline icons or equivalent inline SVG.
- Semantic emerald, amber, and red only for operational meaning.
- Dense application screenshots must be cropped or enlarged for projector readability.

Do not use neon gradients, glassmorphism, decorative graduation motifs, excessive 3D effects, or generic AI-presentation styling.

## Content rules

- Explain business logic, not only CRUD screens.
- Show purchase receiving, sales stock deduction, returns, transfers, stock adjustments, approvals, role checks, warehouse scope, audit logs, and reports where implementation evidence exists.
- Show architecture as a flow, not a raw folder tree.
- Show database domains before the full ERD.
- Explain that frontend visibility is UX; backend authorization is authoritative.
- Use real screenshots as evidence, but recreate workflows and architecture as clear diagrams.
- Put source code snippets only in the appendix unless a specific implementation detail is central to the defense.

## Output contract

A completed run must leave:

- `presentation/index.html`
- `presentation/assets/` if the deck is not fully embedded
- `presentation/README.md`
- `presentation/qa/report.json`
- `presentation/qa/screens/`
- `presentation/qa/summary.md`

Before reporting completion, state:

- Total slide count.
- Main narrative sections.
- Viewports tested.
- Number of console errors.
- Number of unresolved overflow issues.
- Any claims or visuals that still need user confirmation.

## Mandatory quality gates

- No slide scrollbars.
- No clipped content.
- No broken images or missing fonts.
- No console errors.
- Minimum projector-readable body text.
- Consistent title and content alignment.
- Working left/right, space, home/end, fullscreen, and touch navigation.
- Reduced-motion support.
- Print/PDF mode does not cut slides.
- Every technical claim is traceable to the repository or labeled as proposed/future work.

If any mandatory gate fails, do not call the deck finished.

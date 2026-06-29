# Level 3 browser QA

Level 3 adds a rendered inspection-and-repair loop. The agent must operate the deck in a real browser and correct what it sees.

## Preferred tool order

1. Playwright MCP, when the agent has it.
2. Playwright CLI, when installed for the coding agent.
3. `scripts/qa-slides.mjs` as a deterministic fallback.

## Test viewports

Mandatory:

- 1920×1080
- 1366×768

Recommended:

- 1280×720
- a high-DPI 16:10 laptop viewport

## Inspection loop

For each viewport:

1. Open the localhost URL.
2. Record console and page errors.
3. Start at slide 1.
4. Capture the slide before fragments.
5. Trigger all fragments.
6. Capture the fully revealed slide.
7. Move to the next slide using keyboard controls.
8. Verify the visible slide index and progress indicator.
9. Measure overflow.
10. Inspect the screenshot visually.
11. Repeat through the complete deck.

Then test:

- Previous navigation.
- Home and End.
- Fullscreen request behavior.
- Click controls.
- Touch/swipe where tooling supports it.
- Reload state.
- Reduced-motion mode.
- Print mode.

## Overflow checks

Flag any visible element when:

- its bounding rectangle extends outside the slide safe area;
- `scrollWidth > clientWidth` or `scrollHeight > clientHeight`;
- text is clipped by `overflow: hidden`;
- an image is distorted;
- fixed controls cover content.

Automatic geometry checks are necessary but insufficient. Visually inspect every screenshot.

## Readability checks

Reject a slide when:

- body text is too small for projection;
- a screenshot table is technically visible but unreadable;
- the title wraps awkwardly;
- a diagram has crossed connectors or ambiguous order;
- contrast is weak;
- the slide has more than one competing focal point;
- the audience must read a paragraph while listening to the presenter.

## Functional checks

- No browser console errors.
- No failed local assets.
- No uncaught promise errors.
- All keyboard controls work.
- Slide counter and progress are accurate.
- Fragments reveal in the intended order.
- Printing exposes all fragments.
- Back/forward browser history does not corrupt navigation.

## QA output

Write:

```text
presentation/qa/
├── report.json
├── summary.md
└── screens/
    ├── 1920x1080/
    └── 1366x768/
```

`report.json` should contain:

- timestamp;
- deck URL;
- slide count;
- viewports;
- console errors;
- page errors;
- overflow findings;
- missing assets;
- screenshot paths;
- controls tested;
- final status.

## Exit criteria

The final status may be `PASS` only when:

- zero console/page errors;
- zero unresolved overflow findings;
- all assets load;
- all mandatory controls work;
- every slide has been manually or agent-visually inspected;
- no essential text is below the approved projector size;
- unresolved content claims are listed for user confirmation.

Do not treat a successful build as a visual QA pass.

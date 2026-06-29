# Level 2 build requirements

Level 2 means producing a polished, browser-native presentation rather than a static document.

## File structure

Default:

```text
presentation/
├── index.html
├── assets/
├── README.md
└── qa/
```

A single self-contained HTML file is preferred when it remains maintainable. Otherwise use local relative assets only.

## Stage and scaling

- Design at 1920×1080.
- Scale the entire stage uniformly to the browser viewport.
- Center the stage.
- Do not reflow slide content responsively.
- Do not permit internal slide scrolling.
- Keep content inside a safe area of at least 80 px on all sides at design resolution.

## Navigation

Implement:

- ArrowRight and Space: next.
- ArrowLeft: previous.
- Home: first.
- End: last.
- `F`: fullscreen.
- Click/tap navigation controls.
- Swipe support.
- Slide number.
- Progress indicator.
- Deep-linkable hash or query state if practical.
- Restore current slide on reload.

## Accessibility

- Use semantic headings.
- Give images meaningful alt text.
- Preserve keyboard focus visibility.
- Meet contrast requirements.
- Respect reduced motion.
- Avoid conveying status by color alone.

## Content behavior

- One primary claim per slide.
- Use fragments for staged explanation.
- Keep speaker text out of the visible slide.
- Use comments or a notes structure for speaker notes.
- Avoid tables with more than 6–8 rows in the main deck.
- Replace dense text with diagrams, timelines, matrices, or enlarged UI crops.

## Print/PDF

Create a print stylesheet:

- One slide per page.
- Landscape 16:9.
- No navigation controls.
- No clipping.
- All staged fragments visible in print.
- Preserve backgrounds when the browser allows it.

## Offline behavior

- Avoid CDN dependencies unless the user explicitly accepts them.
- Prefer inline SVG icons.
- Use local fonts or system fonts.
- Validate that the deck opens without network access.

## Completion evidence

Level 2 is not complete until the HTML opens, navigation works, the deck fits the viewport, and the output folder contains a README with controls and launch instructions.

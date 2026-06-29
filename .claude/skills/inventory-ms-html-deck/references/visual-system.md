# Visual system

## Character

Use a clean operational ERP/SaaS aesthetic: compact, structured, reliable, and data-driven.

## Palette

```css
:root {
  --ims-primary: #5B4CF0;
  --ims-primary-dark: #4C3EDB;
  --ims-primary-soft: #EEF0FF;

  --ims-canvas: #F7F8FC;
  --ims-surface: #FFFFFF;
  --ims-border: #E7E9F0;

  --ims-text: #171A25;
  --ims-text-secondary: #667085;
  --ims-text-muted: #98A2B3;

  --ims-success: #10A37F;
  --ims-success-soft: #EAFBF5;
  --ims-warning: #D97706;
  --ims-warning-soft: #FFF8E6;
  --ims-danger: #EF4444;
  --ims-danger-soft: #FFF0F0;
}
```

## Typography

Prefer Inter when available, with a local system fallback:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", sans-serif;
```

Projector targets:

- Cover title: 64–76 px at 1920×1080.
- Section title: 48–60 px.
- Standard slide title: 38–44 px.
- Card title: 22–26 px.
- Body: 20–24 px.
- Caption: 15–18 px.
- Do not place essential information below 18 px at the 1920×1080 design size.

## Shapes

- Cards: 8–12 px radius.
- Buttons: 6–8 px radius.
- Borders: 1 px cool gray.
- Shadows: subtle only.
- Avoid pill-shaped containers except status badges.

## Slide composition

Use a fixed 16:9 stage. Normal slides:

1. Small brand mark.
2. Title and one-line subtitle.
3. One primary visual or decision.
4. Quiet footer with section and slide number.

Useful layouts:

- 40/60 explanation + diagram.
- Three or four operational cards.
- Full-width architecture or workflow.
- Screenshot + numbered callouts.
- KPI strip + chart/table.
- Comparison or problem/solution matrix.

## Screenshot treatment

- Crop browser chrome unless URL context matters.
- Use a thin border and restrained shadow.
- Never stretch.
- Highlight one feature at a time.
- Dim irrelevant regions when explaining a specific control.
- Prefer enlarged crops over full desktop screenshots for tables.

## Motion

Allowed:

- Fade.
- Small vertical movement.
- Sequential workflow reveal.
- Highlight transitions.
- Number counters used sparingly.

Avoid:

- Bounce.
- Spin.
- 3D flips.
- long cinematic entrances.
- automatic slide advance.

Respect `prefers-reduced-motion`.

## Brand asset

`assets/ims-mark.svg` is a neutral IMS mark derived from the visual language of the supplied application. Replace it if the repository contains an official logo.

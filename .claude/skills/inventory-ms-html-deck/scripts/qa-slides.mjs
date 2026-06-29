#!/usr/bin/env node
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { extname, dirname, resolve, relative } from "node:path";
import process from "node:process";

const input = resolve(process.argv[2] || "presentation/index.html");
const baseDir = dirname(input);
const outDir = resolve(process.argv[3] || "presentation/qa");
const screensDir = resolve(outDir, "screens");

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  const candidate = resolve(baseDir, clean || "index.html");
  if (!candidate.startsWith(baseDir)) throw new Error("Invalid path");
  return candidate;
}

const server = createServer(async (req, res) => {
  try {
    let file = safePath(req.url || "/");
    const info = await stat(file);
    if (info.isDirectory()) file = resolve(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": mime[extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

await new Promise(resolveReady => server.listen(0, "127.0.0.1", resolveReady));
const address = server.address();
const url = `http://127.0.0.1:${address.port}/${encodeURIComponent(relative(baseDir, input)).replaceAll("%2F", "/")}`;

await mkdir(screensDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const viewports = [
  { width: 1920, height: 1080, name: "1920x1080" },
  { width: 1366, height: 768, name: "1366x768" }
];

const report = {
  timestamp: new Date().toISOString(),
  input,
  url,
  viewports: [],
  finalStatus: "PASS"
};

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: "reduce"
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on("console", msg => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", err => pageErrors.push(String(err)));
  page.on("requestfailed", req => failedRequests.push({
    url: req.url(),
    reason: req.failure()?.errorText || "unknown"
  }));

  await page.goto(url, { waitUntil: "networkidle" });

  const slideCount = await page.locator(".slide").count();
  const viewportDir = resolve(screensDir, viewport.name);
  await mkdir(viewportDir, { recursive: true });
  const slides = [];

  for (let index = 0; index < slideCount; index += 1) {
    await page.evaluate(i => {
      location.hash = String(i + 1);
    }, index);
    await page.waitForTimeout(100);

    // Reveal all fragments for final-state inspection.
    await page.locator(".slide.active .fragment").evaluateAll(nodes => {
      nodes.forEach(node => node.classList.add("visible"));
    }).catch(() => {});

    const issues = await page.evaluate(() => {
      const active = document.querySelector(".slide.active");
      if (!active) return [{ type: "missing-active-slide" }];

      const activeRect = active.getBoundingClientRect();
      const findings = [];

      if (active.scrollWidth > active.clientWidth + 1 || active.scrollHeight > active.clientHeight + 1) {
        findings.push({
          type: "slide-scroll-overflow",
          scrollWidth: active.scrollWidth,
          clientWidth: active.clientWidth,
          scrollHeight: active.scrollHeight,
          clientHeight: active.clientHeight
        });
      }

      const candidates = [...active.querySelectorAll("*")].filter(el => {
        const style = getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0;
      });

      for (const el of candidates) {
        const rect = el.getBoundingClientRect();
        const tolerance = 2;
        if (
          rect.left < activeRect.left - tolerance ||
          rect.top < activeRect.top - tolerance ||
          rect.right > activeRect.right + tolerance ||
          rect.bottom > activeRect.bottom + tolerance
        ) {
          findings.push({
            type: "element-outside-slide",
            tag: el.tagName,
            className: String(el.className || ""),
            text: (el.textContent || "").trim().slice(0, 120),
            rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
            slideRect: {
              left: activeRect.left, top: activeRect.top,
              right: activeRect.right, bottom: activeRect.bottom
            }
          });
        }
      }

      for (const img of active.querySelectorAll("img")) {
        if (!img.complete || img.naturalWidth === 0) {
          findings.push({ type: "broken-image", src: img.getAttribute("src") });
        }
      }

      return findings;
    });

    const file = resolve(viewportDir, `slide-${String(index + 1).padStart(2, "0")}.png`);
    await page.screenshot({ path: file, fullPage: false });
    slides.push({ index: index + 1, screenshot: file, issues });
  }

  const controls = {};
  await page.evaluate(() => location.hash = "1");
  await page.keyboard.press("ArrowRight");
  controls.arrowRight = await page.evaluate(() => location.hash === "#2" || location.hash === "#1");
  await page.keyboard.press("End");
  controls.end = await page.evaluate(count => location.hash === `#${count}`, slideCount);
  await page.keyboard.press("Home");
  controls.home = await page.evaluate(() => location.hash === "#1");

  const viewportResult = {
    viewport,
    slideCount,
    consoleErrors,
    pageErrors,
    failedRequests,
    controls,
    slides
  };

  const hasIssues =
    consoleErrors.length ||
    pageErrors.length ||
    failedRequests.length ||
    Object.values(controls).some(value => !value) ||
    slides.some(slide => slide.issues.length);

  if (hasIssues) report.finalStatus = "CHECK_REQUIRED";
  report.viewports.push(viewportResult);
  await context.close();
}

await browser.close();
server.close();

await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");

const summary = [
  "# Slide QA summary",
  "",
  `- Status: **${report.finalStatus}**`,
  `- Input: \`${input}\``,
  `- Viewports: ${report.viewports.map(v => `${v.viewport.width}×${v.viewport.height}`).join(", ")}`,
  `- Slides: ${report.viewports[0]?.slideCount ?? 0}`,
  `- Console errors: ${report.viewports.reduce((n, v) => n + v.consoleErrors.length, 0)}`,
  `- Page errors: ${report.viewports.reduce((n, v) => n + v.pageErrors.length, 0)}`,
  `- Failed requests: ${report.viewports.reduce((n, v) => n + v.failedRequests.length, 0)}`,
  `- Geometry findings: ${report.viewports.reduce((n, v) => n + v.slides.reduce((m, s) => m + s.issues.length, 0), 0)}`,
  "",
  "Inspect every screenshot manually even when the automatic status is PASS."
].join("\n");

await writeFile(resolve(outDir, "summary.md"), summary, "utf8");
console.log(summary);

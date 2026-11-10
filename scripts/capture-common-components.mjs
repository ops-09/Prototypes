import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK_PATH = path.join(ROOT, 'docs/common-components-approval/pack.json');
const SHOT_DIR = path.join(ROOT, 'docs/common-components-approval/screenshots');
const BASE_URL = process.env.APPROVAL_BASE_URL || 'http://127.0.0.1:5173';

const pack = JSON.parse(await readFile(PACK_PATH, 'utf8'));

await mkdir(SHOT_DIR, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 2600 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
page.setDefaultTimeout(20_000);

async function waitForPage(waitSelector) {
  await page.waitForSelector(waitSelector || 'h1', { state: 'visible' });
  await page.waitForTimeout(400);
}

async function expandHint(hint) {
  if (!hint) {
    return;
  }
  await page.evaluate((hintText) => {
    const hosts = Array.from(document.querySelectorAll('ontario-hint-expander'));
    const host = hosts.find((el) => (el.getAttribute('hint') || '').trim() === hintText);
    const button = host?.shadowRoot?.querySelector('button');
    button?.click();
  }, hint);
  await page.waitForTimeout(250);
}

async function checkOption(label) {
  if (!label) {
    return;
  }
  await page.evaluate((labelText) => {
    const target = labelText.trim().toLowerCase();
    const hosts = Array.from(document.querySelectorAll('ontario-checkboxes'));
    for (const host of hosts) {
      const root = host.shadowRoot;
      if (!root) {
        continue;
      }
      const labels = Array.from(root.querySelectorAll('label'));
      const match = labels.find((el) =>
        (el.textContent || '').trim().toLowerCase().includes(target),
      );
      if (!match) {
        continue;
      }
      const input =
        match.querySelector('input[type="checkbox"]') ||
        root.querySelector(`#${match.getAttribute('for')}`);
      if (input && !input.checked) {
        input.click();
      }
      return;
    }
  }, label);
  await page.waitForTimeout(400);
}

async function placeBadges(targets) {
  return page.evaluate((items) => {
    document.querySelectorAll('.approval-badge').forEach((el) => el.remove());

    if (!document.getElementById('approval-badge-style')) {
      const style = document.createElement('style');
      style.id = 'approval-badge-style';
      style.textContent = `
        .approval-badge {
          position: absolute;
          z-index: 2147483647;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #c8102e;
          color: #fff;
          font: 700 13px/26px Arial, Helvetica, sans-serif;
          text-align: center;
          box-shadow: 0 0 0 2px #fff, 0 1px 4px rgba(0,0,0,.35);
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }

    function captionOf(el) {
      const value = el.caption ?? el.getAttribute('caption');
      if (!value) {
        return '';
      }
      return typeof value === 'string' ? value : value.captionText || '';
    }

    function odsHosts() {
      return Array.from(
        document.querySelectorAll(
          'ontario-input, ontario-dropdown-list, ontario-radio-buttons, ontario-checkboxes, ontario-textarea, ontario-date-input, ontario-button, ontario-hint-expander, ontario-hint-text, ontario-callout, ontario-step-indicator, ontario-search-box',
        ),
      );
    }

    function byElementId(id) {
      const direct = document.getElementById(id);
      if (direct) {
        return direct;
      }
      return odsHosts().find((el) => {
        const value = el.elementId || el.getAttribute('element-id') || el.getAttribute('elementId');
        return value === id;
      });
    }

    function byText(needle) {
      const target = needle.trim().toLowerCase();
      const exactNodes = Array.from(
        document.querySelectorAll('h1,h2,h3,h4,h5,a,button,label,legend,ontario-button'),
      );
      const exact = exactNodes.find((el) => (el.textContent || '').trim().toLowerCase() === target);
      if (exact) {
        return exact;
      }
      const button = odsHosts().find((el) => {
        const label = el.label || el.getAttribute('label') || '';
        return String(label).trim().toLowerCase() === target;
      });
      if (button) {
        return button;
      }
      return exactNodes.find((el) => (el.textContent || '').trim().toLowerCase().includes(target));
    }

    function findEl(spec) {
      if (!spec) {
        return null;
      }
      if (spec.id) {
        const el = byElementId(spec.id);
        if (el) {
          return el;
        }
      }
      if (spec.css) {
        const el = document.querySelector(spec.css);
        if (el) {
          return el;
        }
      }
      if (spec.caption) {
        const el = odsHosts().find((host) => captionOf(host).trim() === spec.caption);
        if (el) {
          return el;
        }
      }
      if (spec.hint) {
        const el = odsHosts().find((host) => {
          const hint = host.hint || host.getAttribute('hint') || '';
          return String(hint).trim() === spec.hint;
        });
        if (el) {
          return el;
        }
      }
      if (spec.label) {
        const el = odsHosts().find((host) => {
          const label = host.label || host.getAttribute('label') || '';
          return String(label).trim() === spec.label;
        });
        if (el) {
          return el;
        }
      }
      if (spec.text) {
        return byText(spec.text);
      }
      return null;
    }

    const placed = [];
    for (const item of items) {
      const el = findEl(item.find) || findEl(item.fallback);
      if (!el) {
        placed.push({ n: item.n, ok: false });
        continue;
      }
      const inner =
        el.shadowRoot?.querySelector('textarea, input:not([type="hidden"])') || el;
      const rect = inner.getBoundingClientRect();
      const badge = document.createElement('div');
      badge.className = 'approval-badge';
      badge.textContent = String(item.n);
      const top = Math.max(8, rect.top + window.scrollY - 4);
      const left = Math.max(8, rect.left + window.scrollX - 34);
      badge.style.top = `${top}px`;
      badge.style.left = `${left}px`;
      document.body.appendChild(badge);
      placed.push({ n: item.n, ok: true });
    }
    return placed;
  }, targets);
}

async function screenshotComponent(component) {
  const fileName = `${component.id}-${slug(component.name)}.png`;
  const filePath = path.join(SHOT_DIR, fileName);
  const maxHeight = component.maxHeight || 2100;
  await page.setViewportSize({
    width: 1440,
    height: Math.max(2600, maxHeight + 200),
  });

  for (const setupUrl of component.setupUrls ?? []) {
    await page.goto(`${BASE_URL}${setupUrl}`, { waitUntil: 'domcontentloaded' });
    await waitForPage('h1');
  }

  await page.goto(`${BASE_URL}${component.url}`, { waitUntil: 'domcontentloaded' });
  await waitForPage(component.wait);
  await page.locator('h1').first().waitFor({ state: 'visible' });
  await page.locator('ontario-button').first().waitFor({ state: 'attached' }).catch(() => {});
  await page.waitForTimeout(250);
  if (component.id === 'C06') {
    const countInput = page.getByRole('textbox', { name: /Fixed number of directors/i });
    if (await countInput.count()) {
      await countInput.fill('3');
      await page.waitForTimeout(500);
    }
  }
  await expandHint(component.expandHint);
  await checkOption(component.checkText);

  const placed = await placeBadges(component.targets);
  const missing = placed.filter((row) => !row.ok).map((row) => row.n);
  if (missing.length) {
    console.warn(`${component.id}: missing badges ${missing.join(', ')}`);
  }

  const clip = await page.evaluate((clipMaxHeight) => {
    const heading = document.querySelector('h1');
    const column =
      document.querySelector('main .ontario-medium-8') ||
      document.querySelector('main') ||
      document.body;
    const start = heading || column;
    const startRect = start.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    const buttons = document.querySelector('.buttonGroup, [class*="buttonGroup"], [class*="button-group"]');
    const buttonRect = buttons?.getBoundingClientRect();
    const badges = Array.from(document.querySelectorAll('.approval-badge'));
    let minX = Math.min(columnRect.left, startRect.left);
    let minY = startRect.top;
    let maxX = columnRect.right;
    let maxY = columnRect.bottom;
    for (const badge of badges) {
      const b = badge.getBoundingClientRect();
      minX = Math.min(minX, b.left);
      minY = Math.min(minY, b.top);
      maxX = Math.max(maxX, b.right);
      maxY = Math.max(maxY, b.bottom);
    }
    if (buttonRect) {
      maxY = Math.max(maxY, buttonRect.bottom);
    }
    const pad = 16;
    const x = Math.max(0, minX - pad);
    const y = Math.max(0, minY - pad);
    const width = Math.min(window.innerWidth - x, maxX - minX + pad * 2);
    const height = Math.min(maxY - minY + pad * 2, clipMaxHeight, window.innerHeight - y);
    return { x, y, width, height };
  }, maxHeight);

  await page.screenshot({
    path: filePath,
    clip: {
      x: Math.floor(clip.x),
      y: Math.floor(clip.y),
      width: Math.max(40, Math.floor(clip.width)),
      height: Math.max(40, Math.floor(clip.height)),
    },
  });

  return { fileName, missing };
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

const onlyIds = (process.env.APPROVAL_ONLY || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);
const components = onlyIds.length
  ? pack.components.filter((component) => onlyIds.includes(component.id))
  : pack.components;

const manifest = [];
for (const component of components) {
  try {
    const result = await screenshotComponent(component);
    manifest.push({
      id: component.id,
      name: component.name,
      fileName: result.fileName,
      missing: result.missing,
    });
    console.log(`captured ${component.id} -> ${result.fileName}`);
  } catch (error) {
    console.error(`${component.id} failed:`, error.message);
    manifest.push({
      id: component.id,
      name: component.name,
      fileName: null,
      missing: ['error'],
      error: error.message,
    });
  }
}

const manifestPath = path.join(SHOT_DIR, 'manifest.json');
let written = manifest;
if (onlyIds.length) {
  try {
    const existing = JSON.parse(await readFile(manifestPath, 'utf8'));
    written = existing.map((row) => manifest.find((item) => item.id === row.id) || row);
    for (const row of manifest) {
      if (!written.some((item) => item.id === row.id)) {
        written.push(row);
      }
    }
  } catch {
    written = manifest;
  }
}

await writeFile(manifestPath, JSON.stringify(written, null, 2));

await browser.close();
console.log(`Wrote ${manifest.length} screenshots to ${SHOT_DIR}`);

/**
 * Records Form 1 Step 1 interactions to an MP4 suitable for MS Teams upload.
 * Usage: node scripts/record-form1-demo.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'tmp', 'demo');
const videoDir = path.join(outDir, 'raw-video');
const samplePdf = path.join(outDir, 'sample-nuans.pdf');
const samplePdfFr = path.join(outDir, 'sample-nuans-fr.pdf');
const baseURL = process.env.FORM1_DEMO_URL || 'http://localhost:5175';

fs.mkdirSync(videoDir, { recursive: true });
const pdfBytes = Buffer.from('%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
fs.writeFileSync(samplePdf, pdfBytes);
fs.writeFileSync(samplePdfFr, pdfBytes);

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function selectRadio(page, value) {
  await page.evaluate((optionValue) => {
    const host = document.querySelector('ontario-radio-buttons');
    if (!host) throw new Error('ontario-radio-buttons missing');
    const input = host.shadowRoot?.querySelector(`input[value="${optionValue}"]`);
    if (!input) throw new Error(`radio ${optionValue} missing`);
    input.checked = true;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    // Drive React customOnChange used by Form1Step1
    if (typeof host.customOnChange === 'function') {
      const evt = new Event('change', { bubbles: true });
      Object.defineProperty(evt, 'target', { configurable: true, value: input });
      host.customOnChange(evt);
    }
  }, value);
  await pause(900);
}

async function typeInput(page, name, text) {
  // Clear then type slowly so the video shows the interaction
  await page.evaluate((fieldName) => {
    const host = document.querySelector(`ontario-input[name="${fieldName}"]`);
    if (!host) throw new Error(`ontario-input ${fieldName} missing`);
    host.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const input = host.shadowRoot?.querySelector('input');
    if (!input) throw new Error(`input inside ${fieldName} missing`);
    input.focus();
    input.value = '';
    host.value = '';
    if (typeof host.customOnInput === 'function') {
      const evt = new Event('input', { bubbles: true });
      Object.defineProperty(evt, 'target', { configurable: true, value: input });
      host.customOnInput(evt);
    }
  }, name);
  await pause(350);

  for (const ch of text) {
    await page.evaluate(
      ({ fieldName, ch: character }) => {
        const host = document.querySelector(`ontario-input[name="${fieldName}"]`);
        const input = host?.shadowRoot?.querySelector('input');
        if (!host || !input) return;
        input.value = `${input.value}${character}`;
        host.value = input.value;
        if (typeof host.customOnInput === 'function') {
          const evt = new Event('input', { bubbles: true });
          Object.defineProperty(evt, 'target', { configurable: true, value: input });
          host.customOnInput(evt);
        }
      },
      { fieldName: name, ch },
    );
    await pause(40);
  }

  await page.evaluate((fieldName) => {
    const host = document.querySelector(`ontario-input[name="${fieldName}"]`);
    const input = host?.shadowRoot?.querySelector('input');
    if (!host || !input) return;
    input.blur();
    if (typeof host.customOnBlur === 'function') {
      const evt = new Event('blur', { bubbles: true });
      Object.defineProperty(evt, 'target', { configurable: true, value: input });
      host.customOnBlur(evt);
    }
  }, name);
  await pause(600);
}

async function fillAllDates(page, isoDate = '2026-06-15') {
  await page.evaluate((date) => {
    const [year, month, day] = date.split('-');
    document.querySelectorAll('ontario-date-input').forEach((hostEl) => {
      hostEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const root = hostEl.shadowRoot;
      if (!root) return;
      const dayInput = root.querySelector('input[id*="day"], input[name*="day"]');
      const monthInput = root.querySelector('input[id*="month"], input[name*="month"]');
      const yearInput = root.querySelector('input[id*="year"], input[name*="year"]');
      const inputs = [...root.querySelectorAll('input')];
      const setVal = (input, value) => {
        if (!input) return;
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };
      if (dayInput || monthInput || yearInput) {
        setVal(monthInput, month);
        setVal(dayInput, day);
        setVal(yearInput, year);
      } else if (inputs.length >= 3) {
        setVal(inputs[0], day);
        setVal(inputs[1], month);
        setVal(inputs[2], year);
      }
      hostEl.value = `${date}T00:00:00.000Z`;
      hostEl.dispatchEvent(
        new CustomEvent('inputOnChange', {
          detail: { value: `${date}T00:00:00.000Z`, fieldType: 'year' },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }, isoDate);
  await pause(700);
}

async function fillFirstDate(page, isoDate = '2026-06-15') {
  await fillAllDates(page, isoDate);
}

async function upload(page, inputId, filePath) {
  await page.locator(`#${inputId}`).setInputFiles(filePath);
  await pause(900);
}

async function clickButton(page, label) {
  await page.getByRole('button', { name: label }).scrollIntoViewIfNeeded();
  await pause(250);
  await page.getByRole('button', { name: label }).click();
  await pause(1000);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();

try {
  // Open Step 1
  await page.goto(`${baseURL}/form-1`, { waitUntil: 'networkidle' });
  await pause(1500);

  // Empty Continue → errors
  await clickButton(page, 'Continue');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(1600);

  // English path
  await selectRadio(page, 'english');
  await page.waitForSelector('ontario-input[name="cooperative-name"]', { timeout: 10000 });
  await pause(700);

  // Invalid name → validation message
  await typeInput(page, 'cooperative-name', 'green institute inc.');
  await clickButton(page, 'Continue');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(1500);

  // Valid name (block capitals)
  await typeInput(page, 'cooperative-name', 'GREEN CO-OPERATIVE INC.');
  await upload(page, 'nuans-file', samplePdf);
  await fillFirstDate(page, '2026-06-15');
  await clickButton(page, 'Continue');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(1700);

  // Separate EN/FR path
  await selectRadio(page, 'separate');
  await page.waitForSelector('ontario-input[name="cooperative-name-en"]', { timeout: 10000 });
  await pause(900);
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'smooth' }));
  await pause(600);

  await typeInput(page, 'cooperative-name-en', 'GREEN CO-OPERATIVE INC.');
  await typeInput(page, 'cooperative-name-fr', 'COOPÉRATIVE GREEN INC.');
  await upload(page, 'nuans-file-en', samplePdf);
  await fillAllDates(page, '2026-06-15');

  // Missing second upload → story error
  await clickButton(page, 'Continue');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(1600);

  // Complete second upload + continue
  await upload(page, 'nuans-file-fr', samplePdfFr);
  await fillAllDates(page, '2026-06-15');
  await clickButton(page, 'Continue');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(1600);

  // Save as Draft → summary
  await clickButton(page, 'Save as Draft');
  await page.waitForURL('**/form-1/draft-summary', { timeout: 10000 });
  await pause(2000);

  // Back to form
  await page.goto(`${baseURL}/form-1`, { waitUntil: 'networkidle' });
  await pause(1000);

  // Cancel / Exit → home
  await clickButton(page, 'Cancel / Exit');
  await page.waitForURL((url) => url.pathname === '/', { timeout: 10000 });
  await pause(1600);
} finally {
  await context.close();
  await browser.close();
}

const webm = fs
  .readdirSync(videoDir)
  .filter((f) => f.endsWith('.webm'))
  .map((f) => path.join(videoDir, f))
  .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];

if (!webm) {
  console.error('No video recorded');
  process.exit(1);
}

function findFfmpeg() {
  const which = spawnSync('which', ['ffmpeg'], { encoding: 'utf8' });
  if (which.status === 0 && which.stdout.trim()) return which.stdout.trim();

  const cacheRoot = '/var/folders/97/v82vlnxj10d96pk8jb4x7mxh0000gn/T/cursor-sandbox-cache';
  if (fs.existsSync(cacheRoot)) {
    for (const d of fs.readdirSync(cacheRoot)) {
      const candidate = path.join(cacheRoot, d, 'playwright', 'ffmpeg-1011', 'ffmpeg-mac');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

const ffmpeg = findFfmpeg();
const mp4Out = path.join(outDir, 'Form1-Step1-interaction-demo.mp4');
const webmOut = path.join(outDir, 'Form1-Step1-interaction-demo.webm');
fs.copyFileSync(webm, webmOut);

console.log('Raw WebM:', webmOut);

if (!ffmpeg) {
  console.log('ffmpeg not found — share the WebM file with Teams.');
  process.exit(0);
}

const convert = spawnSync(
  ffmpeg,
  ['-y', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', mp4Out],
  { encoding: 'utf8' },
);

if (convert.status !== 0) {
  console.error(convert.stderr);
  console.log('MP4 conversion failed — use WebM:', webmOut);
  process.exit(0);
}

console.log('Teams-ready MP4:', mp4Out);
console.log('Size:', `${(fs.statSync(mp4Out).size / (1024 * 1024)).toFixed(2)} MB`);

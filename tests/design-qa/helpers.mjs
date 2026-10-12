import { expect } from '@playwright/test';

export function normalizeCssColor(color) {
  const trimmed = color.trim().toLowerCase();

  if (trimmed.startsWith('#')) {
    return trimmed.toUpperCase();
  }

  const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!rgbMatch) {
    return trimmed;
  }

  const [, red, green, blue] = rgbMatch;
  return `#${[red, green, blue]
    .map((value) => Number(value).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

export async function expectBackgroundColor(locator, expectedHex) {
  const backgroundColor = await locator.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(normalizeCssColor(backgroundColor)).toBe(expectedHex.toUpperCase());
}

export async function expectMinHeight(locator, expectedPx, tolerancePx = 2) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box.height).toBeGreaterThanOrEqual(expectedPx - tolerancePx);
}

export async function expectWidth(locator, expectedPx, tolerancePx = 2) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThanOrEqual(expectedPx - tolerancePx);
  expect(box.width).toBeLessThanOrEqual(expectedPx + tolerancePx);
}

export async function waitForAppReady(page) {
  await page.goto('/user-management');
  await page.locator('ontario-header').waitFor({ state: 'attached' });
  await page.getByRole('navigation', { name: 'Account navigation' }).waitFor();
  await page.getByRole('heading', { name: 'User management', level: 1 }).waitFor();
}

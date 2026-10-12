import { test, expect } from '@playwright/test';
import {
  FIGMA_LAYOUT,
  FIGMA_TOKENS,
  SIDEBAR_LINK_LABELS,
  SIDEBAR_PARENT_LABELS,
  USER_MANAGEMENT_COPY,
} from './figma-spec.mjs';
import {
  expectBackgroundColor,
  expectMinHeight,
  expectWidth,
  waitForAppReady,
} from './helpers.mjs';

test.describe('Design QA — User management shell (Figma 29713:100454)', () => {
  test.beforeEach(async ({ page }) => {
    await waitForAppReady(page);
  });

  test('header matches ServiceOntario application pattern', async ({ page }) => {
    const header = page.locator('ontario-header');
    await expect(header).toBeVisible();

    await expect(header.locator('.ontario-service-subheader__heading')).toHaveText(
      USER_MANAGEMENT_COPY.headerTitle,
    );
    await expect(page.getByRole('link', { name: USER_MANAGEMENT_COPY.languageToggle })).toBeVisible();

    await expect(header).toHaveScreenshot('header-service-ontario.png', {
      animations: 'disabled',
    });
  });

  test('sidebar structure, labels, and active state follow Figma', async ({ page }) => {
    const sidebar = page.getByRole('navigation', { name: 'Account navigation' });
    await expect(sidebar).toBeVisible();

    await expectWidth(sidebar, FIGMA_LAYOUT.sidebarNavWidthPx, FIGMA_LAYOUT.sidebarNavWidthTolerancePx);

    const profileSelector = sidebar.getByText(USER_MANAGEMENT_COPY.profileLabel);
    await expect(profileSelector).toBeVisible();
    await expectMinHeight(profileSelector.locator('..'), FIGMA_LAYOUT.profileSelectorMinHeightPx);

    const profileBorderRadius = await profileSelector.evaluate((element) => {
      const selector = element.closest('div');
      return selector ? getComputedStyle(selector).borderRadius : '';
    });
    expect(profileBorderRadius).toBe(`${FIGMA_LAYOUT.profileSelectorBorderRadiusPx}px`);

    for (const label of SIDEBAR_LINK_LABELS) {
      if (label === 'Notifications') {
        await expect(sidebar.getByRole('link', { name: /Notifications/ })).toBeVisible();
        continue;
      }

      await expect(sidebar.getByRole('link', { name: label, exact: true })).toBeVisible();
    }

    for (const label of SIDEBAR_PARENT_LABELS) {
      await expect(sidebar.getByText(label, { exact: true })).toBeVisible();
    }

    const activeLink = sidebar.getByRole('link', {
      name: USER_MANAGEMENT_COPY.activeNavLabel,
      exact: true,
    });
    await expect(activeLink).toHaveAttribute('aria-current', 'page');
    await expectBackgroundColor(activeLink, FIGMA_TOKENS.tertiaryActive);

    await expect(sidebar.getByText('10', { exact: true })).toBeVisible();

    await expect(sidebar).toHaveScreenshot('sidebar-navigation.png', {
      animations: 'disabled',
    });
  });

  test('page heading places title above the user list', async ({ page }) => {
    const heading = page.getByRole('heading', { name: USER_MANAGEMENT_COPY.pageTitle, level: 1 });
    const description = page.getByText(USER_MANAGEMENT_COPY.pageDescription);
    const userList = page.locator('section[aria-label="User list"]');

    await expect(heading).toBeVisible();
    await expect(description).toBeVisible();
    await expect(userList).toBeVisible();

    const headingBox = await heading.boundingBox();
    const userListBox = await userList.boundingBox();
    expect(headingBox).not.toBeNull();
    expect(userListBox).not.toBeNull();
    expect(headingBox.y).toBeLessThan(userListBox.y);

    await expect(userList).toHaveScreenshot('page-user-list-card.png', {
      animations: 'disabled',
    });
  });

  test('shell layout includes sidebar divider and preserves user management table', async ({ page }) => {
    const dividerWidth = await page.getByTestId('app-body-divider').evaluate((element) => {
      return element.getBoundingClientRect().width;
    });

    expect(dividerWidth).toBe(FIGMA_LAYOUT.bodyDividerWidthPx);

    await expect(page.getByRole('link', { name: /Invite user/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'User details' })).toBeVisible();
    await expect(page.getByText('Sarah Chen')).toBeVisible();
  });

  test('full viewport shell snapshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('user-management-shell.png', {
      fullPage: false,
      animations: 'disabled',
      mask: [page.locator('ontario-footer')],
    });
  });
});

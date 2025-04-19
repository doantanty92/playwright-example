import { test, expect, Page } from '@playwright/test';
import { PRIORITY } from '../src/shared/constants';
import { formatForInput, parseCellDate } from './utils/date';

test.describe('Tasks Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the tasks page before each test
    await page.goto('/tasks');

    // Wait for the page to be fully loaded
    // await page.waitForSelector('h1:has-text("Tasks")');
    await page.waitForURL(/\/tasks$/);
  });

  test('should display tasks page with correct elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle('Tasks');

    // Check heading
    await expect(page.getByRole('heading', { name: 'Tasks', level: 1 })).toBeVisible();

    // Check "Create New Task" button
    await expect(page.getByRole('link', { name: 'Create New Task' })).toBeVisible();

    // Check search form elements
    await expect(page.getByRole('textbox', { name: 'Task Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Start Date' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'End Date' })).toBeVisible();
    await expect(page.getByLabel('Priority')).toBeVisible();

    // Check placeholders
    expect(page.getByPlaceholder('Search by task name')).toBeVisible();
    expect(page.getByLabel('Priority').locator('option[value=""]')).toHaveText('Select priority');

    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();

    // Check table headers
    const headers = ['ID', 'Name', 'Start Date', 'End Date', 'Priority'];
    for (const header of headers) {
      await expect(page.locator('table thead th', { hasText: header })).toBeVisible();
    }
  });

  test('should filter tasks by name', async ({ page }) => {
    await waitForTableLoading(page);

    // Fill the name filter
    await page.getByLabel('Task Name').fill('code');
    await page.getByRole('button', { name: 'Search' }).click();

    await waitForTableLoading(page);

    // Check if the URL contains the correct search parameters
    expect(page.url()).toContain('name=code');

    // Check if filtered tasks contain the search term
    const filteredTaskCount = await page.locator('table tbody tr').count();
    if (!filteredTaskCount) test.skip();

    // If there are filtered results, check if they contain the search term
    for (let i = 0; i < filteredTaskCount; i++) {
      const taskName = await page
        .locator(`table tbody tr:nth-child(${i + 1}) td:nth-child(2)`)
        .textContent();
      expect(taskName?.toLowerCase()).toContain('code');
    }
  });

  [PRIORITY.HIGH, PRIORITY.NORMAL, PRIORITY.LOW].forEach((priority) => {
    test(`should filter tasks by ${priority} priority`, async ({ page }) => {
      await waitForTableLoading(page);
      // Select the priority
      await page.getByLabel('Priority').selectOption(priority);
      await page.getByRole('button', { name: 'Search' }).click();
      await waitForTableLoading(page);

      const filteredTaskCount = await page.locator('table tbody tr').count();
      if (!filteredTaskCount) test.skip();

      // Check if filtered tasks have the selected priority
      for (let i = 0; i < filteredTaskCount; i++) {
        const taskPriority = await page
          .locator(`table tbody tr:nth-child(${i + 1}) td:nth-child(5)`)
          .textContent();
        expect(taskPriority?.toLowerCase()).toBe(priority);
      }
    });
  });

  test('should filter tasks by start date', async ({ page }) => {
    await waitForTableLoading(page);

    // Set start date (using a specific date from the mock data)
    await page.getByLabel('Start Date').fill('2025-05-01');
    await page.getByRole('button', { name: 'Search' }).click();

    await waitForTableLoading(page);

    // Check if the URL contains the correct search parameters
    expect(page.url()).toContain('start_date=2025-05-01');

    // Check if filtered tasks are after the start date
    const taskStartDates = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
    if (!taskStartDates.length) test.skip();

    const startDate = new Date(2025, 4, 1); // May 1, 2025 00:00:00
    for (const date of taskStartDates) {
      const taskDate = parseCellDate(date);
      expect(taskDate >= startDate).toBeTruthy();
    }
  });

  test('should filter tasks by end date', async ({ page }) => {
    await waitForTableLoading(page);

    // Set end date (using a specific date from the mock data)
    await page.getByLabel('End Date').fill('2025-05-31');
    await page.getByRole('button', { name: 'Search' }).click();

    await waitForTableLoading(page);

    // Check if the URL contains the correct search parameters
    expect(page.url()).toContain('end_date=2025-05-31');

    // Check if filtered tasks are before the end date
    const taskEndDates = await page.locator('table tbody tr td:nth-child(4)').allTextContents();
    if (!taskEndDates.length) test.skip();

    const endDate = new Date(2025, 4, 31); // May 31, 2025 00:00:00
    for (const date of taskEndDates) {
      const taskDate = parseCellDate(date);
      expect(taskDate <= endDate).toBeTruthy();
    }
  });

  test('should filter tasks by date range', async ({ page }) => {
    await waitForTableLoading(page);

    // Set date range (using a specific range from the mock data)
    await page.getByLabel('Start Date').fill('2025-05-01');
    await page.getByLabel('End Date').fill('2025-05-31');
    await page.getByRole('button', { name: 'Search' }).click();

    await waitForTableLoading(page);

    // Check if the URL contains the correct search parameters
    expect(page.url()).toContain('start_date=2025-05-01');
    expect(page.url()).toContain('end_date=2025-05-31');

    // Check if filtered tasks are within the date range
    const filteredTaskCount = await page.locator('table tbody tr').count();
    if (!filteredTaskCount) test.skip();

    const startDate = new Date(2025, 4, 1); // May 1, 2025 00:00:00
    const endDate = new Date(2025, 4, 31); // May 31, 2025 00:00:00
    for (let i = 0; i < filteredTaskCount; i++) {
      const taskStartDate = await page
        .locator(`table tbody tr:nth-child(${i + 1}) td:nth-child(3)`)
        .textContent();
      const taskEndDate = await page
        .locator(`table tbody tr:nth-child(${i + 1}) td:nth-child(4)`)
        .textContent();

      expect(
        parseCellDate(taskStartDate!) >= startDate && parseCellDate(taskEndDate!) <= endDate
      ).toBeTruthy();
    }
  });

  test('should filter tasks by multiple criteria', async ({ page }) => {
    await waitForTableLoading(page);

    // Skip if there are no tasks
    if (await page.locator('text=No tasks found').isVisible()) test.skip();

    // Get data from the first task
    const firstTask = await page.locator('table tbody tr:nth-child(1)').innerText();
    const [_id, name, startDateStr, endDateStr, priority] = firstTask
      .split('\t')
      .map((text) => text.trim());

    const startDate = parseCellDate(startDateStr);
    const endDate = parseCellDate(endDateStr);

    // Fill the filters
    await page.getByLabel('Task Name').fill(name);
    await page.getByLabel('Start Date').fill(formatForInput(startDate));
    await page.getByLabel('End Date').fill(formatForInput(endDate));
    await page.getByLabel('Priority').selectOption(priority.toLowerCase());
    await page.getByRole('button', { name: 'Search' }).click();

    await waitForTableLoading(page);

    // Check if the URL contains the correct search parameters
    const params = new URLSearchParams();
    params.set('name', name);
    params.set('start_date', formatForInput(startDate));
    params.set('end_date', formatForInput(endDate));
    params.set('priority', priority.toLowerCase());
    expect(page.url()).toContain(params.toString());

    // Check if filtered tasks match the criteria
    const filteredTaskCount = await page.locator('table tbody tr').count();
    expect(filteredTaskCount).toBeGreaterThan(0);

    const filteredTasks = await page.locator('table tbody tr').allInnerTexts();
    for (const task of filteredTasks) {
      const [_taskId, taskName, taskStartDateStr, taskEndDateStr, taskPriority] = task
        .split('\t')
        .map((text) => text.trim());

      const taskStartDate = parseCellDate(taskStartDateStr);
      const taskEndDate = parseCellDate(taskEndDateStr);

      expect(taskName).toContain(name);
      expect(taskStartDate >= startDate).toBeTruthy();
      expect(taskEndDate <= endDate).toBeTruthy();
      expect(taskPriority).toBe(priority);
    }
  });

  test('should clear all filters and show all tasks', async ({ page }) => {
    await waitForTableLoading(page);

    // Get the count of initial tasks
    const initialTaskCount = await page.locator('table tbody tr').count();
    if (!initialTaskCount) test.skip();

    // Fill some filters
    await page.getByLabel('Task Name').fill('code');
    await page.getByLabel('Start Date').fill('2025-05-01');
    await page.getByLabel('End Date').fill('2025-05-31');
    await page.getByLabel('Priority').selectOption(PRIORITY.HIGH);
    await page.getByRole('button', { name: 'Search' }).click();

    await waitForTableLoading(page);

    // Check if tasks are filtered
    const filteredTaskCount = await page.locator('table tbody tr').count();
    expect(filteredTaskCount).toBeLessThanOrEqual(initialTaskCount);

    // Clear all filters
    await page.getByRole('button', { name: 'Reset' }).click();

    await waitForTableLoading(page);

    const resetTaskCount = await page.locator('table tbody tr').count();
    expect(resetTaskCount).toEqual(initialTaskCount);
  });

  test('should correctly reflect URL query values in the search form', async ({ page }) => {
    await page.goto('/tasks?name=code&start_date=2025-05-01&end_date=2025-05-31&priority=high');

    await waitForTableLoading(page);

    // Check if the search form values are set correctly
    await expect(page.getByLabel('Task Name')).toHaveValue('code');
    await expect(page.getByLabel('Start Date')).toHaveValue('2025-05-01');
    await expect(page.getByLabel('End Date')).toHaveValue('2025-05-31');
    await expect(page.getByLabel('Priority')).toHaveValue(PRIORITY.HIGH);
  });

  test('should navigate through pagination', async ({ page }) => {
    await waitForTableLoading(page);

    // Check if pagination is visible
    const paginationExists = await page.locator('nav[aria-label="pagination"]').isVisible();

    // Only run pagination tests if there are enough items to paginate
    if (!paginationExists) test.skip();

    // Get the first page tasks
    const firstPageTasks = await page.locator('table tbody tr').allTextContents();

    // If pagination has only one page, skip the test
    const nextPageButton = page.getByRole('button', { name: 'next page' });
    if (await nextPageButton.isDisabled()) test.skip();

    // Click on the next page button
    await page.getByRole('button', { name: 'next page' }).click();

    await waitForTableLoading(page);

    // Get the second page tasks
    const secondPageTasks = await page.locator('table tbody tr').allTextContents();

    // Verify that the tasks on the second page are different from the first page
    expect(firstPageTasks).not.toEqual(secondPageTasks);

    // Go back to the first page
    await page.getByRole('button', { name: 'previous page' }).click();

    await waitForTableLoading(page);

    // Get the tasks again
    const backToFirstPageTasks = await page.locator('table tbody tr').allTextContents();

    // Verify that we're back to the first page
    expect(backToFirstPageTasks).toEqual(firstPageTasks);

    // Click on '2' to go to the second page directly
    await page.getByRole('button', { name: '2' }).click();

    await waitForTableLoading(page);

    // Get the tasks again
    const tasksOnSecondPage = await page.locator('table tbody tr').allTextContents();

    // Verify that we're on the second page
    expect(tasksOnSecondPage).not.toEqual(firstPageTasks);
    expect(tasksOnSecondPage).toEqual(secondPageTasks);
  });

  test('should navigate to create new task page', async ({ page }) => {
    // Click on the "Create New Task" button
    await page.getByRole('link', { name: 'Create New Task' }).click();

    // Check if we're on the new task page
    await expect(page).toHaveURL(/\/tasks\/new$/);
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    await waitForTableLoading(page);

    // Search for a task that doesn't exist
    await page.getByLabel('Task Name').fill('ThisTaskDoesNotExist12345');
    await page.getByRole('button', { name: 'Search' }).click();

    await waitForTableLoading(page);

    // Check for "No tasks found" message
    await expect(page.locator('table tbody')).toContainText('No tasks found');
  });
});

const waitForTableLoading = async (page: Page) => {
  const hasLoading = await page
    .waitForSelector('text=Loading...', { state: 'attached', timeout: 2000 })
    .catch(() => false);

  if (hasLoading) {
    await page.waitForSelector('text=Loading...', { state: 'hidden' });
  }
};

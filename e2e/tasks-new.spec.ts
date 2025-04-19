import { test, expect, Page } from '@playwright/test';
import { PRIORITY } from '../src/shared/constants';

test.describe('Create New Task Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the new task page before each test
    await page.goto('/tasks/new');

    // Wait for the page to be fully loaded
    await page.waitForSelector('h1:has-text("Create New Task")');
  });

  test('should display new task page with correct elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle('Create New Task');

    // Check heading
    await expect(page.getByRole('heading', { name: 'Create New Task', level: 1 })).toBeVisible();

    // Check form elements
    await expect(page.getByLabel(/Task Name/)).toBeVisible();
    await expect(page.getByLabel('Start Date')).toBeVisible();
    await expect(page.getByLabel('End Date')).toBeVisible();
    await expect(page.getByLabel('Priority')).toBeVisible();

    // Check buttons
    await expect(page.getByRole('button', { name: /Back to tasks/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Task' })).toBeVisible();

    // Check default values
    await expect(page.getByLabel('Priority')).toHaveValue(PRIORITY.NORMAL);
  });

  test('should validate name field', async ({ page }) => {
    // Submit the form without filling required fields
    await page.getByRole('button', { name: 'Create Task' }).click();

    // Check for validation error
    await expect(page.getByText('Task name is required')).toBeVisible();

    // Fill name field and check validation error is gone
    await page.getByLabel(/Task Name/).fill('Test Task');
    await expect(page.getByText('Task name is required')).not.toBeVisible();

    // Check max length validation 255
    await page.getByLabel(/Task Name/).fill('a'.repeat(300));
    await expect(page.getByLabel(/Task Name/)).toHaveValue('a'.repeat(255));
  });

  test('should validate priority field', async ({ page }) => {
    // Select empty option and check validation error
    await page.getByLabel('Priority').selectOption('');
    await expect(page.getByText('Priority is required')).toBeVisible();

    // Select option and check validation error is gone
    await page.getByLabel('Priority').selectOption(PRIORITY.LOW);
    await expect(page.getByText('Priority is required')).not.toBeVisible();
  });

  test('should validate date range', async ({ page }) => {
    // Fill task name
    await page.getByLabel(/Task Name/).fill('Test Task');

    // Set invalid date range (end date before start date)
    await page.getByLabel('Start Date').fill('2025-05-10');
    await page.getByLabel('End Date').fill('2025-05-01');

    // Submit the form
    await page.getByRole('button', { name: 'Create Task' }).click();

    // Check for validation error
    await expect(page.getByText('End date must be after start date')).toBeVisible();
  });

  test('should reset form fields when clicking Reset button', async ({ page }) => {
    // Fill form fields
    await page.getByLabel(/Task Name/).fill('Test Task');
    await page.getByLabel('Start Date').fill('2025-05-01');
    await page.getByLabel('End Date').fill('2025-05-10');
    await page.getByLabel('Priority').selectOption(PRIORITY.HIGH);

    // Click Reset button
    await page.getByRole('button', { name: 'Reset' }).click();

    // Check if fields are reset
    await expect(page.getByLabel(/Task Name/)).toHaveValue('');
    await expect(page.getByLabel('Start Date')).toHaveValue('');
    await expect(page.getByLabel('End Date')).toHaveValue('');
    await expect(page.getByLabel('Priority')).toHaveValue(PRIORITY.NORMAL);
  });

  test('should navigate back to tasks page', async ({ page }) => {
    // Click Back to tasks button
    await page.getByRole('button', { name: /Back to tasks/i }).click();

    // Check if we're redirected to the tasks page
    await expect(page).toHaveURL('/tasks');
  });

  test('should successfully create a new task', async ({ page }) => {
    // Fill form with valid data
    const taskName = 'New Test Task';
    const startDate = '2025-06-01';
    const endDate = '2025-06-15';

    await page.getByLabel(/Task Name/).fill(taskName);
    await page.getByLabel('Start Date').fill(startDate);
    await page.getByLabel('End Date').fill(endDate);
    await page.getByLabel('Priority').selectOption(PRIORITY.HIGH);

    const submitButton = page.getByRole('button', { name: 'Create Task' });
    const backButton = page.getByRole('button', { name: 'Back to tasks' });
    const resetButton = page.getByRole('button', { name: 'Reset' });

    // Submit the form
    await submitButton.click();

    // Check for loading state
    await expect(page.locator('.chakra-spinner')).toBeVisible();
    await expect(submitButton).toBeDisabled();
    await expect(backButton).toBeDisabled();
    await expect(resetButton).toBeDisabled();

    await expectCreateSuccess(page, taskName);
  });

  [(PRIORITY.LOW, PRIORITY.NORMAL, PRIORITY.HIGH)].forEach((priority) => {
    test(`should successfully create a task with ${priority} priority`, async ({ page }) => {
      // Fill required field
      const taskName = `Priority Test - ${priority}`;
      await page.getByLabel(/Task Name/).fill(taskName);

      // Select priority
      await page.getByLabel('Priority').selectOption(priority);

      // Check if the correct option is selected
      await expect(page.getByLabel('Priority')).toHaveValue(priority);

      // Submit the form
      await page.locator('button[type="submit"]').click();

      await expectCreateSuccess(page, taskName);
    });
  });

  test('should handle mobile view correctly', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if the back button shows icon instead of text
    const iconButton = page.getByRole('button', { name: /Back to tasks/i });
    await expect(iconButton).toBeVisible();
    expect(await iconButton.getAttribute('aria-label')).toEqual('Back to tasks');
    expect(iconButton.locator('svg')).toBeVisible();

    await expect(
      page.locator('button[type="button"] span:has-text("Back to tasks")')
    ).not.toBeVisible();

    // Fill and submit form to ensure it works on mobile
    await page.getByLabel(/Task Name/).fill('Mobile Test Task');
    await page.getByLabel('Start Date').fill('2025-07-01');
    await page.getByLabel('End Date').fill('2025-07-15');

    // Submit the form
    await page.getByRole('button', { name: 'Create Task' }).click();

    await expectCreateSuccess(page, 'Mobile Test Task');
  });
});

const expectCreateSuccess = async (page: Page, taskName: string) => {
  await expect(page).toHaveURL('/tasks');
  await expect(page.getByText(`Task "${taskName}" has been created successfully.`)).toBeVisible();
};

import { test as base, expect, Page } from '@playwright/test';
import { PRIORITY } from '../src/shared/constants';
import { TasksForm } from './fixtures/tasks-form';

type MyFixtures = {
  form: TasksForm;
};

const test = base.extend<MyFixtures>({
  form: async ({ page }, testUse) => {
    await testUse(new TasksForm(page));
  },
});

test.describe('Create New Task Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the new task page before each test
    await page.goto('/tasks/new');

    // Wait for the page to be fully loaded
    await page.waitForSelector('h1:has-text("Create New Task")');
  });

  test('should display new task page with correct elements', async ({ page, form }) => {
    // Check page title
    await expect(page).toHaveTitle('Create New Task');

    // Check heading
    await expect(page.getByRole('heading', { name: 'Create New Task', level: 1 })).toBeVisible();

    // Check form elements
    await expect(form.nameInput).toBeVisible();
    await expect(form.startDateInput).toBeVisible();
    await expect(form.endDateInput).toBeVisible();
    await expect(form.prioritySelect).toBeVisible();

    // Check buttons
    await expect(form.backButton).toBeVisible();
    await expect(form.resetButton).toBeVisible();
    await expect(form.submitButton).toBeVisible();

    // Check default values
    await expect(form.prioritySelect).toHaveValue(PRIORITY.NORMAL);
  });

  test('should validate name field', async ({ page, form }) => {
    // Submit the form without filling required fields
    await form.submit();

    // Check for validation error
    await expect(page.getByText('Task name is required')).toBeVisible();

    // Fill name field and check validation error is gone
    await form.nameInput.fill('Test Task');
    await expect(page.getByText('Task name is required')).not.toBeVisible();

    // Check max length validation 255
    await form.nameInput.fill('a'.repeat(300));
    await expect(form.nameInput).toHaveValue('a'.repeat(255));
  });

  test('should validate priority field', async ({ page, form }) => {
    // Select empty option and check validation error
    await form.prioritySelect.selectOption('');
    await expect(page.getByText('Priority is required')).toBeVisible();

    // Select option and check validation error is gone
    await form.prioritySelect.selectOption(PRIORITY.LOW);
    await expect(page.getByText('Priority is required')).not.toBeVisible();
  });

  test('should validate date range', async ({ page, form }) => {
    await form.fillForm({ name: 'Test Task', startDate: '2025-05-10', endDate: '2025-05-01' });

    await form.submit();

    // Check for validation error
    await expect(page.getByText('End date must be after start date')).toBeVisible();
  });

  test('should reset form fields when clicking Reset button', async ({ page, form }) => {
    await form.fillForm({
      name: 'Test Task',
      startDate: '2025-05-01',
      endDate: '2025-05-10',
      priority: PRIORITY.HIGH,
    });

    await form.reset();

    await expect(form.nameInput).toHaveValue('');
    await expect(form.startDateInput).toHaveValue('');
    await expect(form.endDateInput).toHaveValue('');
    await expect(form.prioritySelect).toHaveValue(PRIORITY.NORMAL);
  });

  test('should navigate back to tasks page', async ({ page, form }) => {
    await form.backButton.click();

    // Check if we're redirected to the tasks page
    await expect(page).toHaveURL('/tasks');
  });

  test('should successfully create a new task', async ({ page, form }) => {
    const taskName = 'New Test Task';
    await form.fillForm({
      name: taskName,
      startDate: '2025-06-01',
      endDate: '2025-06-15',
      priority: PRIORITY.HIGH,
    });

    await form.submit();

    // Check for loading state
    await expect(form.submitButton.locator('.chakra-spinner')).toBeVisible();
    await expect(form.submitButton).toBeDisabled();
    await expect(form.backButton).toBeDisabled();
    await expect(form.resetButton).toBeDisabled();

    await expectCreateSuccess(page, taskName);
  });

  [(PRIORITY.LOW, PRIORITY.NORMAL, PRIORITY.HIGH)].forEach((priority) => {
    test(`should successfully create a task with ${priority} priority`, async ({ page, form }) => {
      const taskName = `Priority Test - ${priority}`;
      await form.fillForm({ name: taskName, priority });

      // Check if the correct option is selected
      await expect(form.prioritySelect).toHaveValue(priority);

      await form.submit();

      await expectCreateSuccess(page, taskName);
    });
  });

  test('should handle mobile view correctly', async ({ page, form }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if the back button shows icon instead of text
    await expect(form.backButton).toBeVisible();
    expect(await form.backButton.getAttribute('aria-label')).toEqual('Back to tasks');
    expect(form.backButton.locator('svg')).toBeVisible();

    await expect(
      page.locator('button[type="button"] span:has-text("Back to tasks")')
    ).not.toBeVisible();

    const taskName = 'Mobile Test Task';
    await form.fillForm({
      name: taskName,
      startDate: '2025-07-01',
      endDate: '2025-07-15',
      priority: PRIORITY.HIGH,
    });

    await form.submit();

    await expectCreateSuccess(page, taskName);
  });
});

const expectCreateSuccess = async (page: Page, taskName: string) => {
  await expect(page).toHaveURL('/tasks');
  await expect(page.getByText(`Task "${taskName}" has been created successfully.`)).toBeVisible();
};

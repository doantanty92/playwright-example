import { type Page, type Locator } from '@playwright/test';

type TaskFormData = {
  name: string;
  startDate: string;
  endDate: string;
  priority: 'low' | 'normal' | 'high';
};

// Can use this fixture in any spec file that imports it.
// Useful for write tests for 'Create New Task' or 'Edit Task' pages.
export class TasksForm {
  readonly nameInput: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly prioritySelect: Locator;
  readonly backButton: Locator;
  readonly resetButton: Locator;
  readonly submitButton: Locator;

  constructor(public readonly page: Page) {
    this.nameInput = page.getByLabel(/Task Name/);
    this.startDateInput = page.getByLabel('Start Date');
    this.endDateInput = page.getByLabel('End Date');
    this.prioritySelect = page.getByLabel('Priority');

    this.backButton = page.getByRole('button', { name: /Back to tasks/ });
    this.resetButton = page.locator('button[type="reset"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async fillForm(data: Partial<TaskFormData>) {
    if (data.name) await this.nameInput.fill(data.name);
    if (data.startDate) await this.startDateInput.fill(data.startDate);
    if (data.endDate) await this.endDateInput.fill(data.endDate);
    if (data.priority) await this.prioritySelect.selectOption(data.priority);
  }

  async submit() {
    await this.submitButton.click();
  }

  async reset() {
    await this.resetButton.click();
  }
}

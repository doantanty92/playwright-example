'use client';

import { toaster } from '@/components/ui';
import { Box, Button, Field, HStack, Input, Link, NativeSelect, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MdKeyboardArrowLeft } from 'react-icons/md';

import { PRIORITY, PRIORITY_OPTIONS } from '@/shared/constants';

type FormErrors = {
  name?: string;
  dates?: string;
  priority?: string;
};

const MESSAGES = {
  name: {
    required: 'Task name is required',
  },
  dates: {
    invalid: 'End date must be after start date',
  },
  priority: {
    required: 'Priority is required',
  },
};
export default function TasksForm() {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState<string>(PRIORITY.NORMAL);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    setErrors({});
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = MESSAGES.name.required;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.dates = MESSAGES.dates.invalid;
    }

    if (!priority) {
      newErrors.priority = MESSAGES.priority.required;
    }

    setErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    // In a real app, we would submit to an API here
    // For now, we'll just show a success message and redirect
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toaster.success({
      title: 'Task created',
      description: `Task "${name}" has been created successfully.`,
    });
    setIsSubmitting(false);
    router.push('/tasks');
  };

  const onReset = () => {
    setName('');
    setStartDate('');
    setEndDate('');
    if (priority !== PRIORITY.NORMAL) {
      setPriority(PRIORITY.NORMAL);
    }
  };
  return (
    <Box w="full" maxW="4xl" margin="auto" p={6} borderRadius="md" shadow="md">
      <form noValidate onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <Field.Root id="name" invalid={!!errors.name}>
            <Field.Label>
              Task Name <span className="text-red-500">*</span>
            </Field.Label>
            <Input
              autoFocus
              placeholder="Please enter your task name"
              value={name}
              maxLength={255}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({
                  ...errors,
                  name: !e.target.value ? MESSAGES.name.required : undefined,
                });
              }}
            />
            <Field.ErrorText>{errors.name}</Field.ErrorText>
          </Field.Root>

          <HStack gap={4} align="flex-start">
            <Field.Root id="start-date" invalid={!!errors.dates}>
              <Field.Label>Start Date</Field.Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field.Root>

            <Field.Root id="end-date" invalid={!!errors.dates}>
              <Field.Label>End Date</Field.Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <Field.ErrorText>{errors.dates}</Field.ErrorText>
            </Field.Root>
          </HStack>

          <Field.Root id="priority" invalid={!!errors.priority}>
            <Field.Label>
              Priority <span className="text-red-500">*</span>
            </Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Select priority"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setErrors({
                    ...errors,
                    priority: !e.target.value ? MESSAGES.priority.required : undefined,
                  });
                }}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Field.ErrorText>{errors.priority}</Field.ErrorText>
          </Field.Root>

          <HStack justify="space-between" pt={4} wrap={{ base: 'wrap' }}>
            <Link href="/tasks" className="!no-underline">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                aria-label="Back to tasks"
              >
                <span className="hidden md:block">Back to tasks</span>
                <MdKeyboardArrowLeft className="!block md:!hidden" size={24} />
              </Button>
            </Link>

            <HStack>
              <Button type="reset" variant="outline" disabled={isSubmitting} onClick={onReset}>
                Reset
              </Button>

              <Button type="submit" colorScheme="teal" loading={isSubmitting}>
                Create Task
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}

import { Heading, VStack } from '@chakra-ui/react';
import { Metadata } from 'next';

import TasksForm from '@/components/tasks/tasks-form';

export const metadata: Metadata = {
  title: 'Create New Task',
  description: 'Create a new task',
};

export default function TasksNewPage() {
  return (
    <VStack gap={6} align="stretch" w="full">
      <Heading as="h1" size="2xl" textAlign="center">
        Create New Task
      </Heading>

      <TasksForm />
    </VStack>
  );
}

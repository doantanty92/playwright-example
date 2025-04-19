import { Button, Heading, HStack, VStack } from '@chakra-ui/react';
import { Metadata } from 'next';
import Link from 'next/link';

import TaskSearchForm from '@/components/tasks/task-search-form';
import TasksTable from '@/components/tasks/tasks-table';

export const metadata: Metadata = {
  title: 'Tasks',
  description: 'Tasks',
};

export const dynamic = 'force-dynamic';

export default function TasksPage() {
  return (
    <VStack gap={6} align="stretch" w="full">
      <HStack justify="space-between" align="center">
        <Heading as="h1" size="2xl">
          Tasks
        </Heading>
        <Link href="/tasks/new">
          <Button type="button" size="sm">
            Create New Task
          </Button>
        </Link>
      </HStack>

      <TaskSearchForm />

      <TasksTable />
    </VStack>
  );
}

'use client';

import { Badge, Box, Spinner, Table, Text } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { mockTasks, Task } from '@/lib/mock-data';
import { PRIORITY } from '@/shared/constants';
import CustomPagination from '../ui/custom-pagination';

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colorScheme = {
    [PRIORITY.HIGH]: 'red',
    [PRIORITY.NORMAL]: 'blue',
    [PRIORITY.LOW]: 'green',
  }[priority as PRIORITY];

  return (
    <Badge variant="subtle" colorPalette={colorScheme}>
      {priority.toUpperCase()}
    </Badge>
  );
};

const ITEMS_PER_PAGE = 10;

export default function TasksTable() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [paginatedTasks, setPaginatedTasks] = useState<Task[]>([]);

  const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1'), [searchParams]);

  useEffect(() => {
    const fetchTasks = async () => {
      const name = searchParams.get('name')?.toLowerCase().trim() || '';
      const startDate = searchParams.get('start_date') || '';
      const endDate = searchParams.get('end_date') || '';
      const priority = searchParams.get('priority') || '';

      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const tasks = mockTasks.filter((task) => {
        if (name && !task.name.toLowerCase().includes(name)) {
          return false;
        }

        if (startDate && task.startDate && new Date(task.startDate) < new Date(startDate)) {
          return false;
        }

        if (endDate && task.endDate && new Date(task.endDate) > new Date(endDate)) {
          return false;
        }

        if (priority && task.priority !== priority) {
          return false;
        }

        return true;
      });

      setIsLoading(false);
      setFilteredTasks(tasks);

      // Filter by page
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setPaginatedTasks(tasks.slice(start, end));
    };

    fetchTasks();
  }, [searchParams, currentPage]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box overflow="hidden" position="relative" borderRadius="md" shadow="md">
      <Table.ScrollArea>
        <Table.Root striped>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader textAlign="center">ID</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Name</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Start Date</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">End Date</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Priority</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body className="relative" minH="55px">
            {!paginatedTasks.length ? (
              <Table.Row>
                <Table.Cell colSpan={5} textAlign="center" py={4}>
                  No tasks found
                </Table.Cell>
              </Table.Row>
            ) : (
              paginatedTasks.map((task) => (
                <Table.Row key={task.id}>
                  <Table.Cell textAlign="center">{task.id}</Table.Cell>
                  <Table.Cell textAlign="center" fontWeight="medium">
                    {task.name}
                  </Table.Cell>
                  <Table.Cell textAlign="center">{formatDate(task.startDate)}</Table.Cell>
                  <Table.Cell textAlign="center">{formatDate(task.endDate)}</Table.Cell>
                  <Table.Cell textAlign="center">
                    <PriorityBadge priority={task.priority} />
                  </Table.Cell>
                </Table.Row>
              ))
            )}

            {isLoading && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                bg={'whiteAlpha.800'}
                opacity={0.8}
                _dark={{ bg: 'blackAlpha.800' }}
              >
                <Spinner
                  size="md"
                  color="colorPalette.600"
                  _dark={{
                    color: 'whiteAlpha.800',
                  }}
                />
                <Text
                  color="colorPalette.600"
                  _dark={{
                    color: 'whiteAlpha.800',
                  }}
                >
                  Loading...
                </Text>
              </Box>
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {filteredTasks.length > 0 && (
        <Box p={{ base: 2, md: 4 }}>
          <CustomPagination count={filteredTasks.length} pageSize={ITEMS_PER_PAGE} />
        </Box>
      )}
    </Box>
  );
}

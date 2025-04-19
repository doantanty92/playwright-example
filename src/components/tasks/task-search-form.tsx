'use client';

import { Box, Button, Field, Grid, GridItem, Input, NativeSelect, VStack } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PRIORITY_OPTIONS } from '@/shared/constants';

export default function TaskSearchForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState('');

  useEffect(() => {
    setName(searchParams.get('name') || '');
    setStartDate(searchParams.get('start_date') || '');
    setEndDate(searchParams.get('end_date') || '');
    setPriority(searchParams.get('priority') || '');
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    if (priority) params.set('priority', priority);

    router.push(`/tasks?${params.toString()}`);
  };

  const handleReset = () => {
    setName('');
    setStartDate('');
    setEndDate('');
    setPriority('');
    router.push('/tasks');
  };

  return (
    <Box p={6} borderRadius="md" shadow="md">
      <form noValidate onSubmit={handleSubmit}>
        <VStack align="stretch">
          <Grid
            gap={4}
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(5, 1fr)',
            }}
          >
            <GridItem>
              <Field.Root id="task-name">
                <Field.Label>Task Name</Field.Label>
                <Input
                  placeholder="Search by task name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field.Root>
            </GridItem>

            <GridItem>
              <Field.Root id="start-date">
                <Field.Label>Start Date</Field.Label>
                <Input
                  type="date"
                  max={endDate}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Field.Root>
            </GridItem>

            <GridItem>
              <Field.Root id="end-date">
                <Field.Label>End Date</Field.Label>
                <Input
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Field.Root>
            </GridItem>

            <GridItem>
              <Field.Root id="priority">
                <Field.Label>Priority</Field.Label>

                <NativeSelect.Root>
                  <NativeSelect.Field
                    placeholder="Select priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
            </GridItem>

            <GridItem
              colStart={{ base: 1, md: 2, lg: 5 }}
              display="grid"
              alignItems="end"
              gap={2}
              gridTemplateColumns={{ base: 'repeat(2, 1fr)' }}
            >
              <Button type="reset" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit" colorScheme="teal">
                Search
              </Button>
            </GridItem>
          </Grid>
        </VStack>
      </form>
    </Box>
  );
}

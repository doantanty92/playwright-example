'use client';

import { ButtonGroup, IconButton, Pagination, useBreakpointValue } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

type PaginationProps = {
  count: number;
  pageSize: number;
  forceDefaultPage?: number;
  pageQuery?: string;
  onPageChange?: (page: number) => void;
};

export default function CustomPagination({
  count,
  pageSize,
  forceDefaultPage,
  pageQuery = 'page',
  onPageChange,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(count / pageSize);

  const defaultPage = useMemo(() => {
    if (forceDefaultPage) return forceDefaultPage;
    return parseInt(searchParams.get(pageQuery) ?? '1');
  }, [forceDefaultPage, pageQuery, searchParams]);

  const onPageChangeHandler = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set(pageQuery, page.toString());
    router.push(`?${params.toString()}`);
  };

  const siblingCount = useBreakpointValue({ base: 0, md: 1 });

  return (
    <Pagination.Root
      count={count}
      pageSize={pageSize}
      defaultPage={defaultPage}
      justifyContent="space-between"
      alignItems="center"
      display="flex"
      flexWrap={{ base: 'wrap' }}
      flexDirection={{ base: 'column', md: 'row' }}
      gap={2}
      siblingCount={siblingCount}
      onPageChange={(e) => onPageChangeHandler(e.page)}
    >
      <Pagination.PageText format="long" flex={1} />

      {totalPages > 1 && (
        <ButtonGroup variant="subtle" size="sm">
          <Pagination.PrevTrigger asChild>
            <IconButton>
              <LuChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={(page) => (
              <IconButton variant={{ base: 'subtle', _selected: 'solid' }}>{page.value}</IconButton>
            )}
          />

          <Pagination.NextTrigger asChild>
            <IconButton>
              <LuChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      )}
    </Pagination.Root>
  );
}

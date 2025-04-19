'use client';

import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';

import { ColorModeButton } from './color-mode';

export default function NavBar() {
  return (
    <Box
      px={4}
      w="100%"
      position="sticky"
      top={0}
      zIndex={100}
      borderBottom="1px solid"
      borderColor="gray.200"
      bg="gray.50"
      _dark={{ borderColor: 'gray.700', bg: 'gray.900' }}
    >
      <HStack h={16} justifyContent="space-between" alignItems="center">
        <Link href="/">
          <Text fontSize="2xl" fontWeight="bold">
            Sample App
          </Text>
        </Link>

        <VStack>
          <ColorModeButton />
        </VStack>
      </HStack>
    </Box>
  );
}

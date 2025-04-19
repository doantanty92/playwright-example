import { Box, Container } from '@chakra-ui/react';
import type React from 'react';

import NavBar from '@/components/ui/nav-bar';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
      colorPalette="blackAlpha"
      position="relative"
    >
      <NavBar />

      <Container maxW="8xl" p={4} fluid>
        {children}
      </Container>
    </Box>
  );
}

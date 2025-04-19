import { LoginForm } from '@/components/login/login-form';
import { Box, Container } from '@chakra-ui/react';

import { ColorModeButton } from '@/components/ui/color-mode';

export default function LoginPage() {
  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
      py={10}
      px={6}
      colorPalette="blackAlpha"
    >
      <div className="absolute bottom-4 right-4">
        <ColorModeButton />
      </div>

      <Container maxW="xl">
        <LoginForm />
      </Container>
    </Box>
  );
}

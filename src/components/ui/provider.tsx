'use client';

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
  },
});

export function Provider(props: ColorModeProviderProps) {
  const system = createSystem(defaultConfig, config);

  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} defaultTheme="light" />
    </ChakraProvider>
  );
}

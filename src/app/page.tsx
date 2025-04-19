import { ColorModeButton } from '@/components/ui/color-mode';
import { Button, HStack } from '@chakra-ui/react';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HStack>
        <Button>Hello</Button>
        <Button>World</Button>
        <ColorModeButton />
      </HStack>
    </div>
  );
}

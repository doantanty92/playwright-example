'use client';

import type React from 'react';

import { Box, Button, Field, Heading, Input } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { useRouter } from 'next/navigation';
import { toaster, PasswordInput } from '@/components/ui';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toaster.dismiss();

    const emailValue = email.trim();
    const passwordValue = password.trim();

    if (!emailValue) {
      emailRef.current?.focus();
      return;
    }

    if (!passwordValue) {
      passwordRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    if (password === 'password') {
      router.push('/tasks');
      return;
    }

    toaster.error({ title: 'Invalid email or password' });
  };

  return (
    <Box borderRadius="lg" overflow="hidden" boxShadow="md">
      <form className="!px-4 !py-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Heading as="h1" size="2xl" textAlign="center" fontWeight="bold">
          Login
        </Heading>

        <Field.Root id="email">
          <Field.Label fontSize="md">Email</Field.Label>
          <Input
            ref={emailRef}
            autoFocus
            size="lg"
            placeholder="Please enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field.Root>

        <Field.Root id="password">
          <Field.Label fontSize="md">Password</Field.Label>
          <PasswordInput
            ref={passwordRef}
            size="lg"
            placeholder="Please enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field.Root>

        <Button
          type="submit"
          variant="solid"
          className="w-full"
          borderRadius="lg"
          size="lg"
          loading={isSubmitting}
        >
          Login
        </Button>
      </form>
    </Box>
  );
}

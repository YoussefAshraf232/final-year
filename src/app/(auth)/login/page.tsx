'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Card, { CardDescription, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { LoginFormData, loginSchema } from '@/lib/validators';

export default function LoginPage() {
  const { login, loginAsGuest, loginAsRole } = useAuth();
  const guestModeEnabled = process.env.NEXT_PUBLIC_ENABLE_GUEST_MODE === 'true';
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    try {
      await login(data);
      toast.success('Signed in');
    } catch {
      setSubmitError('Unable to sign in with those credentials.');
    }
  };

  const handleGuestSignIn = () => {
    setSubmitError(null);
    loginAsGuest();
    toast.success('Signed in as guest');
  };

  return (
    <Card className="w-full max-w-md">
      <div className="mb-6 space-y-2">
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>Use your inventory account to continue.</CardDescription>
      </div>

      {submitError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Sign in
        </Button>
        {guestModeEnabled && (
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleGuestSignIn}
            disabled={isSubmitting}
          >
            Continue as guest
          </Button>
        )}
      </form>

      <div className="mt-6 border-t border-gray-100 pt-6">
        <div className="mb-4 text-sm font-semibold text-gray-700">
          Temporary role login
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => {
              loginAsRole('ADMIN');
              toast.success('Logged in as System Admin');
            }}
          >
            System Admin
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => {
              loginAsRole('MANAGER');
              toast.success('Logged in as Operational Manager');
            }}
          >
            Operational Manager
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => {
              loginAsRole('EMPLOYEE');
              toast.success('Logged in as Warehouse Manager');
            }}
          >
            Warehouse Manager
          </Button>
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-gray-500">
        Need an account?{' '}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
          Register
        </Link>
      </p>
    </Card>
  );
}

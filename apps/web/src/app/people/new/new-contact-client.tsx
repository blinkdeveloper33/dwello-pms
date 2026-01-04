'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@loomi/ui';
import { Button } from '@loomi/ui';
import { Card } from '@loomi/ui';
import { Input } from '@loomi/ui';
import { Label } from '@loomi/ui';
import { Alert, AlertTitle, AlertDescription } from '@loomi/ui';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/api';

const contactSchema = z.object({
  type: z.enum(['resident', 'owner', 'board', 'vendor']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface NewContactClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
}

export function NewContactClient({
  user,
  orgs,
  currentOrgId,
}: NewContactClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      type: 'resident',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest('/api/contacts', {
        method: 'POST',
        body: JSON.stringify({
          orgId: currentOrgId,
          ...data,
          email: data.email || undefined,
          phone: data.phone || undefined,
        }),
      });

      setSuccess('Contact created successfully!');
      setTimeout(() => {
        router.push('/people');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create contact');
      setIsSubmitting(false);
    }
  };

  const handleOrgChange = (orgId: string) => {
    router.push(`/people/new?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <AppShell
      user={user}
      orgs={orgs}
      currentOrgId={currentOrgId}
      onOrgChange={handleOrgChange}
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/people')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">New Contact</h1>
            <p className="mt-1 text-sm text-white/80">
              Add a new contact to your directory
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Contact Type *</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <option value="resident">Resident</option>
                  <option value="owner">Owner</option>
                  <option value="vendor">Vendor</option>
                  <option value="board">Board Member</option>
                </select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/people')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Contact'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}


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

const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zip: z.string().min(5, 'ZIP code is required'),
  propertyType: z.enum(['rental', 'hoa', 'condo', 'mixed']),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface NewPropertyClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
}

export function NewPropertyClient({
  user,
  orgs,
  currentOrgId,
}: NewPropertyClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      propertyType: 'rental',
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiRequest('/api/properties', {
        method: 'POST',
        body: JSON.stringify({
          orgId: currentOrgId,
          ...data,
        }),
      });

      setSuccess('Property created successfully!');
      setTimeout(() => {
        router.push('/properties');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create property');
      setIsSubmitting(false);
    }
  };

  const handleOrgChange = (orgId: string) => {
    router.push(`/properties/new?org=${orgId}`);
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
            onClick={() => router.push('/properties')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">New Property</h1>
            <p className="mt-1 text-sm text-white/80">
              Add a new property to your portfolio
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
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Sunset Apartments"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <select
                  id="propertyType"
                  {...register('propertyType')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <option value="rental">Rental</option>
                  <option value="hoa">HOA</option>
                  <option value="condo">Condo</option>
                  <option value="mixed">Mixed</option>
                </select>
                {errors.propertyType && (
                  <p className="text-sm text-red-600">
                    {errors.propertyType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="123 Main St"
                />
                {errors.address && (
                  <p className="text-sm text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" {...register('city')} placeholder="Los Angeles" />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="CA"
                  maxLength={2}
                  className="uppercase"
                />
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  {...register('zip')}
                  placeholder="90001"
                  maxLength={10}
                />
                {errors.zip && (
                  <p className="text-sm text-red-600">{errors.zip.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/properties')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Property'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}


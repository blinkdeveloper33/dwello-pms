'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger, Alert, AlertTitle, AlertDescription } from '@loomi/ui';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

const chargeSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional(),
  contactId: z.string().optional(),
  type: z.enum(['rent', 'dues', 'assessment', 'fee', 'other']),
  description: z.string().min(1, 'Description is required'),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  dueDate: z.string().min(1, 'Due date is required'),
  isRecurring: z.boolean().optional(),
  recurringSchedule: z.object({
    frequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional(),
});

type ChargeFormData = z.infer<typeof chargeSchema>;

interface NewChargeClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  properties: Array<{
    id: string;
    name: string;
    units: Array<{ id: string; unitNumber: string }>;
  }>;
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export function NewChargeClient({
  user,
  orgs,
  currentOrgId,
  properties,
  contacts,
}: NewChargeClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ChargeFormData>({
    resolver: zodResolver(chargeSchema),
    defaultValues: {
      isRecurring: false,
    },
  });

  const isRecurring = watch('isRecurring');
  const selectedPropertyData = properties.find((p) => p.id === selectedProperty);

  const handleOrgChange = (orgId: string) => {
    router.push(`/charges/new?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const onSubmit = async (data: ChargeFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          propertyId: data.propertyId,
          unitId: data.unitId || undefined,
          contactId: data.contactId || undefined,
          type: data.type,
          description: data.description,
          amount: parseFloat(data.amount),
          dueDate: data.dueDate,
          isRecurring: data.isRecurring ?? false,
          recurringSchedule: data.isRecurring ? data.recurringSchedule : undefined,
          status: 'pending',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create charge');
      }

      setSuccess('Charge created successfully!');
      setTimeout(() => {
        router.push('/charges');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error creating charge:', error);
      setError('Failed to create charge. Please try again.');
      setIsSubmitting(false);
    }
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
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Post New Charge</h1>
            <p className="mt-1 text-sm text-white/80">Create a charge for rent, dues, assessments, or fees</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Charge Details</CardTitle>
              <CardDescription>Enter the charge information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="propertyId">Property *</Label>
                <select
                  id="propertyId"
                  {...register('propertyId')}
                  onChange={(e) => {
                    setSelectedProperty(e.target.value);
                    register('propertyId').onChange(e);
                  }}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
                {errors.propertyId && (
                  <p className="text-sm text-red-600 mt-1">{errors.propertyId.message}</p>
                )}
              </div>

              {selectedPropertyData && selectedPropertyData.units.length > 0 && (
                <div>
                  <Label htmlFor="unitId">Unit (Optional)</Label>
                  <select
                    id="unitId"
                    {...register('unitId')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All units</option>
                    {selectedPropertyData.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        Unit {unit.unitNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="contactId">Resident (Optional)</Label>
                <select
                  id="contactId"
                  {...register('contactId')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a resident</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} ({contact.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="type">Charge Type *</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="rent">Rent</option>
                  <option value="dues">HOA Dues</option>
                  <option value="assessment">Assessment</option>
                  <option value="fee">Fee</option>
                  <option value="other">Other</option>
                </select>
                {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  {...register('description')}
                  placeholder="e.g., Monthly Rent - January 2024"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...register('amount')}
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...register('dueDate')}
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recurring Schedule (Optional)</CardTitle>
              <CardDescription>Set up automatic recurring charges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  {...register('isRecurring')}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isRecurring">Make this a recurring charge</Label>
              </div>

              {isRecurring && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <select
                      id="frequency"
                      {...register('recurringSchedule.frequency')}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...register('recurringSchedule.startDate')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...register('recurringSchedule.endDate')}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Charge'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}


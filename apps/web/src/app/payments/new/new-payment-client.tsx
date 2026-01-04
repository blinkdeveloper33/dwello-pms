'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  AppShell,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertTitle,
  AlertDescription,
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@loomi/ui';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

const paymentSchema = z.object({
  chargeId: z.string().optional(),
  invoiceId: z.string().optional(),
  contactId: z.string().min(1, 'Contact is required'),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  method: z.enum(['check', 'ach', 'card', 'cash', 'other']),
  paymentMethodId: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface NewPaymentClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  charges: Array<{
    id: string;
    description: string;
    amount: number;
    status: string;
    property?: { name: string } | null;
    unit?: { unitNumber: string } | null;
  }>;
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export function NewPaymentClient({
  user,
  orgs,
  currentOrgId,
  charges,
  contacts,
}: NewPaymentClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: 'check',
    },
  });

  const selectedContactId = watch('contactId');
  const selectedChargeId = watch('chargeId');
  const selectedCharge = charges.find((c) => c.id === selectedChargeId);

  const handleOrgChange = (orgId: string) => {
    router.push(`/payments/new?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          chargeId: data.chargeId || undefined,
          invoiceId: data.invoiceId || undefined,
          contactId: data.contactId,
          amount: parseFloat(data.amount),
          method: data.method,
          paymentMethodId: data.paymentMethodId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      setSuccess('Payment recorded successfully!');
      setTimeout(() => {
        router.push('/payments');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error creating payment:', error);
      setError('Failed to record payment. Please try again.');
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
            <h1 className="text-3xl font-bold text-white">Record Payment</h1>
            <p className="mt-1 text-sm text-white/80">Record a payment from a resident or contact</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FieldSet>
            <FieldLegend>Payment Information</FieldLegend>
            <FieldDescription>Enter the payment details below.</FieldDescription>
            <FieldGroup>
              <Field data-invalid={!!errors.contactId}>
                <FieldLabel htmlFor="contactId-select">Contact *</FieldLabel>
                <Select
                  value={selectedContactId || ''}
                  onValueChange={(value) => setValue('contactId', value)}
                >
                  <SelectTrigger id="contactId-select" aria-invalid={!!errors.contactId}>
                    <SelectValue placeholder="Select a contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName} ({contact.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>Select the resident or contact making the payment.</FieldDescription>
                <FieldError errors={errors.contactId} />
              </Field>

              <Field>
                <FieldLabel htmlFor="chargeId-select">Charge (Optional)</FieldLabel>
                <Select
                  value={selectedChargeId || ''}
                  onValueChange={(value) => {
                    setValue('chargeId', value);
                    if (value) {
                      const charge = charges.find((c) => c.id === value);
                      if (charge) {
                        setValue('amount', charge.amount.toString());
                      }
                    }
                  }}
                >
                  <SelectTrigger id="chargeId-select">
                    <SelectValue placeholder="Select a charge (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {charges
                      .filter((c) => !selectedContactId || c.status === 'pending' || c.status === 'overdue')
                      .map((charge) => (
                        <SelectItem key={charge.id} value={charge.id}>
                          {charge.description} - ${charge.amount.toFixed(2)}
                          {charge.property && ` (${charge.property.name})`}
                          {charge.unit && ` - Unit ${charge.unit.unitNumber}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Select a charge to apply this payment to. The amount will be auto-filled.
                </FieldDescription>
              </Field>

              <Field data-invalid={!!errors.amount}>
                <FieldLabel htmlFor="amount">Amount *</FieldLabel>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount')}
                  placeholder="0.00"
                  aria-invalid={!!errors.amount}
                />
                <FieldDescription>Enter the payment amount in dollars.</FieldDescription>
                <FieldError errors={errors.amount} />
              </Field>

              <Field data-invalid={!!errors.method}>
                <FieldLabel htmlFor="method-select">Payment Method *</FieldLabel>
                <Select
                  value={watch('method')}
                  onValueChange={(value) => setValue('method', value as PaymentFormData['method'])}
                >
                  <SelectTrigger id="method-select" aria-invalid={!!errors.method}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="ach">ACH / Bank Transfer</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>Select how the payment was made.</FieldDescription>
                <FieldError errors={errors.method} />
              </Field>

              {selectedCharge && (
                <Field>
                  <FieldDescription className="text-blue-600">
                    Selected charge: {selectedCharge.description} - Amount due: ${selectedCharge.amount.toFixed(2)}
                  </FieldDescription>
                </Field>
              )}
            </FieldGroup>
          </FieldSet>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}


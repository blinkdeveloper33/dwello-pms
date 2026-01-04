'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@loomi/ui';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'Card number must be 16 digits').max(19, 'Invalid card number'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date (MM/YY)'),
  cvv: z.string().min(3, 'CVV must be at least 3 digits').max(4, 'CVV must be at most 4 digits'),
  cardholderName: z.string().min(1, 'Cardholder name is required'),
  billingAddress: z.string().min(1, 'Billing address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  interval: string;
}

interface BillingClientProps {
  currentPlan: {
    name: string;
    displayName: string;
  };
  plans: Plan[];
  selectedPlanId?: string;
}

export function BillingClient({ currentPlan, plans, selectedPlanId }: BillingClientProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>(selectedPlanId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);
  const isUpgrade = selectedPlanData && selectedPlanData.name !== currentPlan.name;

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentForm(true);
    setError(null);
    setSuccess(null);
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!selectedPlan) {
      setError('Please select a plan first');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Format card number (remove spaces)
      const cardNumber = data.cardNumber.replace(/\s/g, '');
      
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethod: {
            cardNumber,
            expiryDate: data.expiryDate,
            cvv: data.cvv,
            cardholderName: data.cardholderName,
            billingAddress: data.billingAddress,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }

      setSuccess('Payment processed successfully! Your plan has been updated.');
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error instanceof Error ? error.message : 'Failed to process payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Subscription
          </CardTitle>
          <CardDescription>Manage your subscription and payment methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Plan</label>
            <p className="text-gray-900 mt-1 font-semibold">{currentPlan.displayName}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : plan.name === currentPlan.name
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                    <CardDescription>
                      {plan.price === 0 ? (
                        'Custom Pricing'
                      ) : (
                        <>
                          ${plan.price.toFixed(2)}/{plan.interval}
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  {plan.name === currentPlan.name && (
                    <CardContent>
                      <span className="text-sm text-blue-600 font-medium">Current Plan</span>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {showPaymentForm && selectedPlanData && isUpgrade && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Information - {selectedPlanData.displayName} Plan
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FieldSet>
                  <FieldLegend>Card Details</FieldLegend>
                  <FieldDescription>Enter your payment information to upgrade your plan.</FieldDescription>
                  <FieldGroup>
                    <Field data-invalid={!!errors.cardNumber}>
                      <FieldLabel htmlFor="cardNumber">Card Number *</FieldLabel>
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        {...register('cardNumber', {
                          onChange: (e) => {
                            const formatted = formatCardNumber(e.target.value);
                            setValue('cardNumber', formatted);
                          },
                        })}
                        aria-invalid={!!errors.cardNumber}
                      />
                      <FieldDescription>Enter your 16-digit card number.</FieldDescription>
                      <FieldError errors={errors.cardNumber} />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field data-invalid={!!errors.expiryDate}>
                        <FieldLabel htmlFor="expiryDate">Expiry Date *</FieldLabel>
                        <Input
                          id="expiryDate"
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          {...register('expiryDate', {
                            onChange: (e) => {
                              const formatted = formatExpiryDate(e.target.value);
                              setValue('expiryDate', formatted);
                            },
                          })}
                          aria-invalid={!!errors.expiryDate}
                        />
                        <FieldError errors={errors.expiryDate} />
                      </Field>

                      <Field data-invalid={!!errors.cvv}>
                        <FieldLabel htmlFor="cvv">CVV *</FieldLabel>
                        <Input
                          id="cvv"
                          type="text"
                          placeholder="123"
                          maxLength={4}
                          {...register('cvv')}
                          aria-invalid={!!errors.cvv}
                        />
                        <FieldError errors={errors.cvv} />
                      </Field>
                    </div>

                    <Field data-invalid={!!errors.cardholderName}>
                      <FieldLabel htmlFor="cardholderName">Cardholder Name *</FieldLabel>
                      <Input
                        id="cardholderName"
                        type="text"
                        placeholder="John Doe"
                        {...register('cardholderName')}
                        aria-invalid={!!errors.cardholderName}
                      />
                      <FieldError errors={errors.cardholderName} />
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Billing Address</FieldLegend>
                  <FieldGroup>
                    <Field data-invalid={!!errors.billingAddress}>
                      <FieldLabel htmlFor="billingAddress">Address *</FieldLabel>
                      <Input
                        id="billingAddress"
                        type="text"
                        placeholder="123 Main St"
                        {...register('billingAddress')}
                        aria-invalid={!!errors.billingAddress}
                      />
                      <FieldError errors={errors.billingAddress} />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field data-invalid={!!errors.city}>
                        <FieldLabel htmlFor="city">City *</FieldLabel>
                        <Input
                          id="city"
                          type="text"
                          placeholder="New York"
                          {...register('city')}
                          aria-invalid={!!errors.city}
                        />
                        <FieldError errors={errors.city} />
                      </Field>

                      <Field data-invalid={!!errors.state}>
                        <FieldLabel htmlFor="state">State *</FieldLabel>
                        <Input
                          id="state"
                          type="text"
                          placeholder="NY"
                          maxLength={2}
                          {...register('state')}
                          aria-invalid={!!errors.state}
                        />
                        <FieldError errors={errors.state} />
                      </Field>
                    </div>

                    <Field data-invalid={!!errors.zipCode}>
                      <FieldLabel htmlFor="zipCode">ZIP Code *</FieldLabel>
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="10001"
                        maxLength={10}
                        {...register('zipCode')}
                        aria-invalid={!!errors.zipCode}
                      />
                      <FieldError errors={errors.zipCode} />
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setSelectedPlan('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : `Subscribe to ${selectedPlanData.displayName}`}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


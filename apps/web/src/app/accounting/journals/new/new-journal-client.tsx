'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea } from '@loomi/ui';
import { ArrowLeft, Plus, Trash2, Save, DollarSign } from 'lucide-react';

const journalEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  reference: z.string().optional(),
  lines: z.array(z.object({
    accountId: z.string().min(1, 'Account is required'),
    debit: z.string().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), 'Debit must be a positive number'),
    credit: z.string().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), 'Credit must be a positive number'),
    description: z.string().optional(),
  })).min(2, 'At least 2 lines required'),
}).refine((data) => {
  const totalDebit = data.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = data.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  return Math.abs(totalDebit - totalCredit) < 0.01; // Allow small floating point differences
}, {
  message: 'Total debits must equal total credits',
  path: ['lines'],
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface NewJournalClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  accounts: Array<{ id: string; name: string; code: string | null; type: string }>;
}

export function NewJournalClient({
  user,
  orgs,
  currentOrgId,
  accounts,
}: NewJournalClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: '',
      lines: [{ accountId: '', debit: '', credit: '', description: '' }, { accountId: '', debit: '', credit: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const lines = watch('lines');
  const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleOrgChange = (orgId: string) => {
    router.push(`/accounting/journals/new?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const onSubmit = async (data: JournalEntryFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/accounting/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          date: data.date,
          description: data.description,
          reference: data.reference || undefined,
          entries: data.lines.map((line) => ({
            accountId: line.accountId,
            debit: line.debit ? parseFloat(line.debit) : 0,
            credit: line.credit ? parseFloat(line.credit) : 0,
            description: line.description || undefined,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create journal entry');
      }

      router.push('/accounting/journals');
    } catch (error) {
      console.error('Error creating journal entry:', error);
      alert('Failed to create journal entry. Please ensure debits equal credits.');
    } finally {
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
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">New Journal Entry</h1>
            <p className="mt-1 text-sm text-white/80">Create a double-entry journal entry</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entry Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" {...register('date')} />
                  {errors.date && (
                    <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="reference">Reference</Label>
                  <Input id="reference" {...register('reference')} placeholder="Optional reference number" />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter journal entry description"
                  rows={2}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Journal Lines</CardTitle>
                  <CardDescription>Debits must equal credits</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ accountId: '', debit: '', credit: '', description: '' })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Line
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Account</th>
                      <th className="text-right p-2">Debit</th>
                      <th className="text-right p-2">Credit</th>
                      <th className="text-left p-2">Description</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={field.id} className="border-b">
                        <td className="p-2">
                          <select
                            {...register(`lines.${index}.accountId`)}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select account</option>
                            {accounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.code ? `${account.code} - ` : ''}{account.name}
                              </option>
                            ))}
                          </select>
                          {errors.lines?.[index]?.accountId && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.lines[index]?.accountId?.message}
                            </p>
                          )}
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`lines.${index}.debit`)}
                            placeholder="0.00"
                            className="text-right"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`lines.${index}.credit`)}
                            placeholder="0.00"
                            className="text-right"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            {...register(`lines.${index}.description`)}
                            placeholder="Optional"
                          />
                        </td>
                        <td className="p-2">
                          {fields.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold">
                      <td className="p-2">Total</td>
                      <td className="p-2 text-right">
                        <span className={isBalanced ? 'text-green-600' : 'text-red-600'}>
                          ${totalDebit.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <span className={isBalanced ? 'text-green-600' : 'text-red-600'}>
                          ${totalCredit.toFixed(2)}
                        </span>
                      </td>
                      <td colSpan={2} className="p-2">
                        {!isBalanced && (
                          <span className="text-sm text-red-600">
                            Difference: ${Math.abs(totalDebit - totalCredit).toFixed(2)}
                          </span>
                        )}
                        {isBalanced && (
                          <span className="text-sm text-green-600">✓ Balanced</span>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {errors.lines && typeof errors.lines === 'object' && 'message' in errors.lines && (
                <p className="text-sm text-red-600">{errors.lines.message as string}</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isBalanced}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Journal Entry'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}


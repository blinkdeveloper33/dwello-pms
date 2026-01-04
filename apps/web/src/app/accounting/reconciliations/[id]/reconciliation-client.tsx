'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Save } from 'lucide-react';

interface ReconciliationClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  reconciliation: any;
  unmatchedTransactions: any[];
}

export function ReconciliationClient({
  user,
  orgs,
  currentOrgId,
  reconciliation,
  unmatchedTransactions,
}: ReconciliationClientProps) {
  const router = useRouter();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [selectedMatches, setSelectedMatches] = useState<Record<string, string>>({});

  const handleOrgChange = (orgId: string) => {
    router.push(`/accounting/reconciliations/${reconciliation.id}?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const handleMatch = async (transactionId: string, journalEntryId: string) => {
    try {
      const response = await fetch(`/api/accounting/reconciliations/${reconciliation.id}/lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          bankTransactionId: transactionId,
          journalEntryId: journalEntryId,
        }),
      });

      if (!response.ok) throw new Error('Failed to match');
      router.refresh();
    } catch (error) {
      console.error('Error matching transaction:', error);
      alert('Failed to match transaction');
    }
  };

  const handleFinalize = async () => {
    if (!confirm('Are you sure you want to finalize this reconciliation? This cannot be undone.')) {
      return;
    }

    setIsFinalizing(true);
    try {
      const response = await fetch(`/api/accounting/reconciliations/${reconciliation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          status: 'finalized',
        }),
      });

      if (!response.ok) throw new Error('Failed to finalize');
      router.push('/accounting/reconciliations');
    } catch (error) {
      console.error('Error finalizing reconciliation:', error);
      alert('Failed to finalize reconciliation');
    } finally {
      setIsFinalizing(false);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Bank Reconciliation</h1>
              <p className="mt-1 text-sm text-white/80">
                {reconciliation.bankAccount?.name} - {new Date(reconciliation.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          {reconciliation.status === 'in_progress' && (
            <Button onClick={handleFinalize} disabled={isFinalizing}>
              <Save className="mr-2 h-4 w-4" />
              {isFinalizing ? 'Finalizing...' : 'Finalize Reconciliation'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Matched Transactions</CardTitle>
                <CardDescription>Transactions that have been matched</CardDescription>
              </CardHeader>
              <CardContent>
                {reconciliation.lines && reconciliation.lines.length > 0 ? (
                  <div className="space-y-2">
                    {reconciliation.lines.map((line: any) => (
                      <div key={line.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {line.bankTransaction?.description || 'Transaction'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {line.journalEntry?.description || 'Matched to journal entry'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {line.bankTransaction?.date ? new Date(line.bankTransaction.date).toLocaleDateString() : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              ${Math.abs(Number(line.bankTransaction?.amount || 0)).toFixed(2)}
                            </p>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                              Matched
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No matched transactions yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unmatched Bank Transactions</CardTitle>
                <CardDescription>Transactions that need to be matched</CardDescription>
              </CardHeader>
              <CardContent>
                {unmatchedTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">All transactions matched</p>
                ) : (
                  <div className="space-y-2">
                    {unmatchedTransactions.map((tx) => (
                      <div key={tx.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{tx.description || 'Transaction'}</p>
                            <p className="text-sm text-gray-600">
                              {tx.date ? new Date(tx.date).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              ${Math.abs(Number(tx.amount)).toFixed(2)}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                // In a full implementation, this would open a modal to select journal entry
                                alert('Match transaction feature - would open journal entry selector');
                              }}
                            >
                              Match
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold capitalize">{reconciliation.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(reconciliation.startDate).toLocaleDateString()}
                  </p>
                </div>
                {reconciliation.endDate && (
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(reconciliation.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Matched Transactions</p>
                  <p className="text-lg font-semibold">
                    {reconciliation.lines?.length || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}


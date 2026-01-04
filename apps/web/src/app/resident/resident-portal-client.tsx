'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Alert, AlertDescription, AlertTitle } from '@loomi/ui';
import { DollarSign, FileText, Wrench, Receipt, Download, Plus, AlertCircle } from 'lucide-react';

interface ResidentPortalClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  residentContact: any;
  balance: number;
  charges: any[];
  payments: any[];
  documents: any[];
}

export function ResidentPortalClient({
  user,
  orgs,
  currentOrgId,
  residentContact,
  balance,
  charges,
  payments,
  documents,
}: ResidentPortalClientProps) {
  const router = useRouter();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleOrgChange = (orgId: string) => {
    router.push(`/resident?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePayNow = async () => {
    if (charges.length === 0) {
      setError('No outstanding charges to pay');
      setTimeout(() => setError(null), 5000);
      return;
    }

    setIsProcessingPayment(true);
    setError(null);
    // Stub: In production, this would integrate with PaymentProvider
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess('Payment processing would be handled by PaymentProvider integration');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError('Failed to process payment. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!residentContact) {
    return (
      <AppShell
        user={user}
        orgs={orgs}
        currentOrgId={currentOrgId}
        onOrgChange={handleOrgChange}
        onSignOut={handleSignOut}
      >
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No resident profile found. Please contact your property manager.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

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
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <div>
          <h1 className="text-3xl font-bold text-white">Resident Portal</h1>
          <p className="mt-1 text-sm text-white/80">Welcome, {residentContact.firstName} {residentContact.lastName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Balance Due
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
              {balance > 0 && (
                <Button className="mt-4 w-full" onClick={handlePayNow} disabled={isProcessingPayment}>
                  {isProcessingPayment ? 'Processing...' : 'Pay Now'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outstanding Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{charges.length}</div>
              <p className="text-sm text-gray-600 mt-2">Charges pending payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{payments.length}</div>
              <p className="text-sm text-gray-600 mt-2">Payments recorded</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="charges" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charges">Charges</TabsTrigger>
            <TabsTrigger value="payments">Payments & Receipts</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="charges">
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Charges</CardTitle>
                <CardDescription>Charges that need to be paid</CardDescription>
              </CardHeader>
              <CardContent>
                {charges.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No outstanding charges</p>
                ) : (
                  <div className="space-y-4">
                    {charges.map((charge) => (
                      <div key={charge.id} className="p-4 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{charge.description}</p>
                            <p className="text-sm text-gray-600">
                              {charge.property?.name} {charge.unit?.unitNumber && `- Unit ${charge.unit.unitNumber}`}
                            </p>
                            <p className="text-sm text-gray-500">Due: {new Date(charge.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">${Number(charge.amount).toFixed(2)}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              charge.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {charge.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History & Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No payments yet</p>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-4 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{payment.charge?.description || 'Payment'}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(payment.createdAt).toLocaleDateString()} • {payment.method}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold">${Number(payment.amount).toFixed(2)}</p>
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                {payment.status}
                              </span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Receipt
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Your property documents</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No documents available</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 border rounded-md cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-600">{doc.fileName}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Submit and track maintenance requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={() => router.push('/maintenance/new')} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Maintenance Request
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    View your maintenance requests in the Maintenance section
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}


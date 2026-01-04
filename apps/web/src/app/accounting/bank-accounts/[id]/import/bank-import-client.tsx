'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@loomi/ui';
import { ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react';

interface BankImportClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  bankAccount: {
    id: string;
    name: string;
    accountNumber: string | null;
  };
}

export function BankImportClient({
  user,
  orgs,
  currentOrgId,
  bankAccount,
}: BankImportClientProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importedTransactions, setImportedTransactions] = useState<any[]>([]);

  const handleOrgChange = (orgId: string) => {
    router.push(`/accounting/bank-accounts/${bankAccount.id}/import?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orgId', currentOrgId);
      formData.append('bankAccountId', bankAccount.id);

      const response = await fetch(`/api/accounting/bank-accounts/${bankAccount.id}/transactions`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to import transactions');
      }

      const data = await response.json();
      setImportedTransactions(data.transactions || []);
      alert(`Successfully imported ${data.transactions?.length || 0} transactions`);
    } catch (error) {
      console.error('Error importing transactions:', error);
      alert('Failed to import transactions. Please check the CSV format.');
    } finally {
      setIsUploading(false);
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
            <h1 className="text-3xl font-bold text-white">Import Bank Transactions</h1>
            <p className="mt-1 text-sm text-white/80">{bankAccount.name} - {bankAccount.accountNumber}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>Import bank transactions from a CSV file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csvFile">CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-2">
                Expected format: Date, Description, Amount, Type (debit/credit)
              </p>
            </div>

            {file && (
              <div className="p-3 bg-blue-50 rounded-md flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-900">{file.name}</span>
                <span className="text-xs text-blue-600">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            )}

            <Button onClick={handleImport} disabled={!file || isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Importing...' : 'Import Transactions'}
            </Button>
          </CardContent>
        </Card>

        {importedTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Imported Transactions ({importedTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {importedTransactions.map((tx, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{tx.description || 'Transaction'}</p>
                        <p className="text-sm text-gray-600">
                          {tx.date ? new Date(tx.date).toLocaleDateString() : 'No date'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.type === 'debit' ? '-' : '+'}${Math.abs(Number(tx.amount)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}


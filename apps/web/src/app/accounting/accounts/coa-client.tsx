'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import { Plus, DollarSign, FileText } from 'lucide-react';

interface ChartOfAccountsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  initialAccounts: any[];
}

export function ChartOfAccountsClient({
  user,
  orgs,
  currentOrgId,
  initialAccounts,
}: ChartOfAccountsClientProps) {
  const router = useRouter();
  const [accounts] = useState(initialAccounts);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleOrgChange = (orgId: string) => {
    router.push(`/accounting/accounts?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesCategory = categoryFilter === 'all' || account.category === categoryFilter;
    const matchesSearch = !searchQuery || 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', 'asset', 'liability', 'equity', 'revenue', 'expense'];
  const accountsByCategory = categories.reduce((acc, cat) => {
    if (cat === 'all') return acc;
    acc[cat] = filteredAccounts.filter((a) => a.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

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
          <div>
            <h1 className="text-3xl font-bold text-white">Chart of Accounts</h1>
            <p className="mt-1 text-sm text-white/80">Manage your accounting chart of accounts</p>
          </div>
          <Button onClick={() => router.push('/accounting/accounts/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                {categories.filter((c) => c !== 'all').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat}>
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)} ({cat === 'all' ? filteredAccounts.length : accountsByCategory[cat]?.length || 0})
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((cat) => (
                <TabsContent key={cat} value={cat}>
                  <div className="space-y-2">
                    {(cat === 'all' ? filteredAccounts : accountsByCategory[cat] || []).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No accounts found</p>
                    ) : (
                      (cat === 'all' ? filteredAccounts : accountsByCategory[cat] || []).map((account) => (
                        <div
                          key={account.id}
                          className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/accounting/accounts/${account.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{account.name}</p>
                              {account.code && (
                                <p className="text-sm text-gray-600">Code: {account.code}</p>
                              )}
                              {account.description && (
                                <p className="text-sm text-gray-500 mt-1">{account.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                {account.category}
                              </span>
                              {account.balance !== null && (
                                <p className="text-sm font-medium mt-1">
                                  ${Number(account.balance).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}


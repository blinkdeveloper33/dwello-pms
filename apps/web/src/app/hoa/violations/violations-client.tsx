'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import { Plus, AlertTriangle, DollarSign, FileText } from 'lucide-react';

interface ViolationsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  initialViolations: any[];
  properties: any[];
}

export function ViolationsClient({
  user,
  orgs,
  currentOrgId,
  initialViolations,
  properties,
}: ViolationsClientProps) {
  const router = useRouter();
  const [violations] = useState(initialViolations);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleOrgChange = (orgId: string) => {
    router.push(`/hoa/violations?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const filteredViolations = statusFilter === 'all'
    ? violations
    : violations.filter((v) => v.status === statusFilter);

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
            <h1 className="text-3xl font-bold text-white">Violations</h1>
            <p className="mt-1 text-sm text-white/80">Manage HOA violations and enforcement</p>
          </div>
          <Button onClick={() => router.push('/hoa/violations/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Log Violation
          </Button>
        </div>

        <div className="flex gap-2">
          {['all', 'open', 'warning', 'fine', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({violations.filter((v) => status === 'all' || v.status === status).length})
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredViolations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No violations found</p>
              </CardContent>
            </Card>
          ) : (
            filteredViolations.map((violation) => (
              <Card key={violation.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{violation.type}</CardTitle>
                      <CardDescription className="mt-1">
                        {violation.property?.name} {violation.unit?.unitNumber && `- Unit ${violation.unit.unitNumber}`}
                      </CardDescription>
                      {violation.description && (
                        <p className="text-sm text-gray-600 mt-2">{violation.description}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      violation.status === 'open' ? 'bg-gray-100 text-gray-800' :
                      violation.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      violation.status === 'fine' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {violation.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {violation.steps && violation.steps.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Progressive Steps:</p>
                        <div className="mt-1 space-y-1">
                          {violation.steps.map((step: any) => (
                            <div key={step.id} className="text-sm text-gray-600">
                              • {step.type}: {step.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {violation.fines && violation.fines.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Fines:</p>
                        <div className="mt-1 space-y-1">
                          {violation.fines.map((fine: any) => (
                            <div key={fine.id} className="text-sm text-gray-600">
                              ${Number(fine.amount).toFixed(2)} - {fine.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}


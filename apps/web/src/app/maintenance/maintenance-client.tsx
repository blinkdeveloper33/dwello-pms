'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Card, CardContent, CardHeader, CardTitle, Button } from '@loomi/ui';
import { Plus, Wrench, Clock, CheckCircle, XCircle } from 'lucide-react';

interface MaintenanceClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  initialWorkOrders: any[];
}

export function MaintenanceClient({
  user,
  orgs,
  currentOrgId,
  initialWorkOrders,
}: MaintenanceClientProps) {
  const router = useRouter();
  const [workOrders] = useState(initialWorkOrders);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleOrgChange = (orgId: string) => {
    router.push(`/maintenance?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const filteredOrders = statusFilter === 'all' 
    ? workOrders 
    : workOrders.filter((wo) => wo.status === statusFilter);

  const statusCounts = {
    all: workOrders.length,
    open: workOrders.filter((wo) => wo.status === 'open').length,
    assigned: workOrders.filter((wo) => wo.status === 'assigned').length,
    in_progress: workOrders.filter((wo) => wo.status === 'in_progress').length,
    completed: workOrders.filter((wo) => wo.status === 'completed').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-gray-100 text-gray-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <div>
            <h1 className="text-3xl font-bold text-white">Maintenance</h1>
            <p className="mt-1 text-sm text-white/80">Manage work orders and maintenance requests</p>
          </div>
          <Button onClick={() => router.push('/maintenance/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')} ({count})
            </button>
          ))}
        </div>

        {/* Work Orders List */}
        <div className="grid gap-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No work orders found</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((wo) => (
              <Card
                key={wo.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/maintenance/${wo.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{wo.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {wo.property?.name} {wo.unit?.unitNumber && `- Unit ${wo.unit.unitNumber}`}
                      </p>
                      {wo.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{wo.description}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(wo.status)}`}>
                      {wo.status.replace('_', ' ')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {wo.contact && (
                      <span>Requested by: {wo.contact.firstName} {wo.contact.lastName}</span>
                    )}
                    {wo.vendor && (
                      <span>Assigned to: {wo.vendor.firstName} {wo.vendor.lastName}</span>
                    )}
                    {wo.priority && (
                      <span className={`font-medium ${
                        wo.priority === 'urgent' ? 'text-red-600' :
                        wo.priority === 'high' ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        Priority: {wo.priority}
                      </span>
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


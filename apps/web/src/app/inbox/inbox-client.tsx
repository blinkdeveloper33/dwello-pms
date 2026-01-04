'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import { Clock, AlertCircle, CheckCircle, MessageSquare, Wrench } from 'lucide-react';

interface InboxClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  initialWorkOrders: any[];
  initialCommunications: any[];
}

export function InboxClient({
  user,
  orgs,
  currentOrgId,
  initialWorkOrders,
  initialCommunications,
}: InboxClientProps) {
  const router = useRouter();
  const [workOrders] = useState(initialWorkOrders);
  const [communications] = useState(initialCommunications);

  const handleOrgChange = (orgId: string) => {
    router.push(`/inbox?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const openWorkOrders = workOrders.filter((wo) => wo.status === 'open' || wo.status === 'assigned');
  const overdueWorkOrders = workOrders.filter((wo) => {
    if (wo.status === 'completed' || wo.status === 'closed') return false;
    // Check if created more than 7 days ago (SLA)
    const daysSinceCreated = Math.floor((Date.now() - new Date(wo.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated > 7;
  });

  return (
    <AppShell
      user={user}
      orgs={orgs}
      currentOrgId={currentOrgId}
      onOrgChange={handleOrgChange}
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Unified Inbox</h1>
          <p className="mt-1 text-sm text-white/80">View all work orders, communications, and alerts</p>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {overdueWorkOrders.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-900">
                    <AlertCircle className="h-5 w-5" />
                    Overdue Work Orders ({overdueWorkOrders.length})
                  </CardTitle>
                  <CardDescription>Items past SLA deadline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {overdueWorkOrders.map((wo) => (
                      <div
                        key={wo.id}
                        className="p-3 bg-white rounded-md border border-red-200 cursor-pointer hover:bg-red-100"
                        onClick={() => router.push(`/maintenance/${wo.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{wo.title}</p>
                            <p className="text-sm text-gray-600">
                              {wo.property?.name} {wo.unit?.unitNumber && `- Unit ${wo.unit.unitNumber}`}
                            </p>
                          </div>
                          <span className="text-xs text-red-600 font-medium">OVERDUE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Open Work Orders ({openWorkOrders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {openWorkOrders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No open work orders</p>
                  ) : (
                    openWorkOrders.map((wo) => (
                      <div
                        key={wo.id}
                        className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                        onClick={() => router.push(`/maintenance/${wo.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Wrench className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{wo.title}</p>
                              <p className="text-sm text-gray-600">
                                {wo.property?.name} {wo.unit?.unitNumber && `- Unit ${wo.unit.unitNumber}`}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {wo.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work-orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Work Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workOrders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No work orders</p>
                  ) : (
                    workOrders.map((wo) => (
                      <div
                        key={wo.id}
                        className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                        onClick={() => router.push(`/maintenance/${wo.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{wo.title}</p>
                            <p className="text-sm text-gray-600">
                              {wo.property?.name} {wo.unit?.unitNumber && `- Unit ${wo.unit.unitNumber}`}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                            {wo.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overdue">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Overdue Items
                </CardTitle>
                <CardDescription>Work orders past SLA deadline</CardDescription>
              </CardHeader>
              <CardContent>
                {overdueWorkOrders.length === 0 ? (
                  <p className="text-gray-500">No overdue items</p>
                ) : (
                  <div className="space-y-2">
                    {overdueWorkOrders.map((wo) => (
                      <div
                        key={wo.id}
                        className="p-3 border border-red-200 rounded-md cursor-pointer hover:bg-red-50"
                        onClick={() => router.push(`/maintenance/${wo.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{wo.title}</p>
                            <p className="text-sm text-gray-600">
                              {wo.property?.name} {wo.unit?.unitNumber && `- Unit ${wo.unit.unitNumber}`}
                            </p>
                          </div>
                          <span className="text-xs text-red-600 font-medium">OVERDUE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications">
            <Card>
              <CardHeader>
                <CardTitle>Communications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {communications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No communications</p>
                  ) : (
                    communications.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                        onClick={() => router.push(`/communications/${comm.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{comm.subject || comm.type}</p>
                              <p className="text-sm text-gray-600">{comm.property?.name || 'All Properties'}</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                            {comm.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}


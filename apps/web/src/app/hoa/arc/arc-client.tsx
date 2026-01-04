'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@loomi/ui';
import { Plus, CheckCircle, XCircle, FileText, Clock } from 'lucide-react';

interface ArcClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  initialRequests: any[];
}

export function ArcClient({
  user,
  orgs,
  currentOrgId,
  initialRequests,
}: ArcClientProps) {
  const router = useRouter();
  const [requests] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  const handleOrgChange = (orgId: string) => {
    router.push(`/hoa/arc?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(`/api/hoa/architectural-requests/${requestId}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          decision: 'approved',
          notes: decisionNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to approve');
      router.refresh();
      setSelectedRequest(null);
      setDecision(null);
      setDecisionNotes('');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch(`/api/hoa/architectural-requests/${requestId}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          decision: 'rejected',
          notes: decisionNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to reject');
      router.refresh();
      setSelectedRequest(null);
      setDecision(null);
      setDecisionNotes('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter((r) => r.status === statusFilter);

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
            <h1 className="text-3xl font-bold text-white">Architectural Requests</h1>
            <p className="mt-1 text-sm text-white/80">Review and approve architectural change requests</p>
          </div>
          <Button onClick={() => router.push('/hoa/arc/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({requests.filter((r) => r.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({requests.filter((r) => r.status === 'approved').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({requests.filter((r) => r.status === 'rejected').length})</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter}>
            <div className="grid gap-4">
              {filteredRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No requests found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{request.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {request.property?.name} {request.unit?.unitNumber && `- Unit ${request.unit.unitNumber}`}
                          </CardDescription>
                          {request.description && (
                            <p className="text-sm text-gray-600 mt-2">{request.description}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {request.approvals && request.approvals.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Approval History:</p>
                            <div className="space-y-2">
                              {request.approvals.map((approval: any) => (
                                <div key={approval.id} className="p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    {approval.decision === 'approved' ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-sm font-medium">{approval.user?.name || 'System'}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(approval.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {approval.notes && (
                                    <p className="text-sm text-gray-600 mt-1 ml-6">{approval.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {request.status === 'pending' && (
                          <div className="border-t pt-4">
                            {selectedRequest === request.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Decision</label>
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      variant={decision === 'approved' ? 'default' : 'outline'}
                                      onClick={() => setDecision('approved')}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant={decision === 'rejected' ? 'default' : 'outline'}
                                      onClick={() => setDecision('rejected')}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                                {decision && (
                                  <>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Notes</label>
                                      <Textarea
                                        value={decisionNotes}
                                        onChange={(e) => setDecisionNotes(e.target.value)}
                                        placeholder="Add notes for your decision..."
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => {
                                          if (decision === 'approved') {
                                            handleApprove(request.id);
                                          } else {
                                            handleReject(request.id);
                                          }
                                        }}
                                      >
                                        Submit Decision
                                      </Button>
                                      <Button variant="outline" onClick={() => {
                                        setSelectedRequest(null);
                                        setDecision(null);
                                        setDecisionNotes('');
                                      }}>
                                        Cancel
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : (
                              <Button onClick={() => setSelectedRequest(request.id)}>
                                Review Request
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}


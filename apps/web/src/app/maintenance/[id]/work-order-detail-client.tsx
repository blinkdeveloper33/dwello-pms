'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import { ArrowLeft, Clock, User, MapPin, Wrench, MessageSquare, History, Save } from 'lucide-react';

interface WorkOrderDetailClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  workOrder: any;
  auditLogs: any[];
}

export function WorkOrderDetailClient({
  user,
  orgs,
  currentOrgId,
  workOrder,
  auditLogs,
}: WorkOrderDetailClientProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(workOrder.status);
  const [priority, setPriority] = useState(workOrder.priority);
  const [newComment, setNewComment] = useState('');

  const handleOrgChange = (orgId: string) => {
    router.push(`/maintenance/${workOrder.id}?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/work-orders/${workOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          status,
          priority,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');
      router.refresh();
    } catch (error) {
      console.error('Error updating work order:', error);
      alert('Failed to update work order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/work-orders/${workOrder.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          comment: newComment,
        }),
      });

      if (!response.ok) throw new Error('Failed to add comment');
      setNewComment('');
      router.refresh();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
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
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/maintenance')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{workOrder.title}</h1>
            <p className="mt-1 text-sm text-white/80">
              Created {new Date(workOrder.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(workOrder.status)}`}>
            {workOrder.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{workOrder.description || 'No description provided'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline & Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {workOrder.comments.map((comment: any) => (
                    <div key={comment.id} className="p-3 border rounded-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{comment.userId ? `User ${comment.userId}` : 'System'}</p>
                          <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <Label htmlFor="newComment">Add Comment</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="newComment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                    />
                    <Button onClick={handleAddComment}>Send</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 border rounded-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {log.user?.name || 'System'} • {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="open">Open</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <Button onClick={handleStatusUpdate} disabled={isUpdating} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{workOrder.property?.name}</p>
                    {workOrder.unit && (
                      <p className="text-xs text-gray-600">Unit {workOrder.unit.unitNumber}</p>
                    )}
                  </div>
                </div>

                {workOrder.contact && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">
                        {workOrder.contact.firstName} {workOrder.contact.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{workOrder.contact.email}</p>
                    </div>
                  </div>
                )}

                {workOrder.vendor && (
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">
                        {workOrder.vendor.firstName} {workOrder.vendor.lastName}
                      </p>
                      <p className="text-xs text-gray-600">Assigned Vendor</p>
                    </div>
                  </div>
                )}

                {workOrder.scheduledAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">
                        Scheduled: {new Date(workOrder.scheduledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {workOrder.permissionToEnter && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-800">✓ Permission to Enter Granted</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}


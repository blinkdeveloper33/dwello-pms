'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger, Alert, AlertDescription, AlertTitle } from '@loomi/ui';
import { Plus, Webhook, CheckCircle, XCircle, Clock, Trash2, AlertCircle } from 'lucide-react';

interface WebhooksClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  initialWebhooks: any[];
  initialOutbox: any[];
}

export function WebhooksClient({
  user,
  orgs,
  currentOrgId,
  initialWebhooks,
  initialOutbox,
}: WebhooksClientProps) {
  const router = useRouter();
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [outbox] = useState(initialOutbox);
  const [isCreating, setIsCreating] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleOrgChange = (orgId: string) => {
    router.push(`/settings/webhooks?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const handleCreateWebhook = async () => {
    setError(null);
    setSuccess(null);

    if (!newWebhookUrl.trim()) {
      setError('Please enter a webhook URL');
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (newWebhookEvents.length === 0) {
      setError('Please select at least one event');
      setTimeout(() => setError(null), 5000);
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/enterprise/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          url: newWebhookUrl,
          events: newWebhookEvents,
          secret: 'generate-secret-here', // In production, generate a secure secret
        }),
      });

      if (!response.ok) throw new Error('Failed to create webhook');

      const data = await response.json();
      setWebhooks([data, ...webhooks]);
      setNewWebhookUrl('');
      setNewWebhookEvents([]);
      setSuccess('Webhook created successfully');
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error creating webhook:', error);
      setError('Failed to create webhook. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      const response = await fetch(`/api/enterprise/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrgId }),
      });

      if (!response.ok) throw new Error('Failed to delete webhook');
      setWebhooks(webhooks.filter((w) => w.id !== webhookId));
    } catch (error) {
      console.error('Error deleting webhook:', error);
      alert('Failed to delete webhook');
    }
  };

  const eventOptions = [
    'charge.created',
    'charge.paid',
    'payment.created',
    'work_order.created',
    'work_order.updated',
    'work_order.completed',
    'violation.created',
    'violation.fined',
    'architectural_request.approved',
    'architectural_request.rejected',
  ];

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
          <h1 className="text-3xl font-bold text-white">Webhooks</h1>
          <p className="mt-1 text-sm text-white/80">Configure webhook endpoints for real-time events</p>
        </div>

        <Tabs defaultValue="webhooks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="webhooks">Webhooks ({webhooks.length})</TabsTrigger>
            <TabsTrigger value="outbox">Outbox ({outbox.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Create New Webhook</CardTitle>
                <CardDescription>Set up a webhook endpoint to receive events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://your-app.com/webhooks"
                  />
                </div>
                <div>
                  <Label>Events to Subscribe</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {eventOptions.map((event) => (
                      <label key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newWebhookEvents.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWebhookEvents([...newWebhookEvents, event]);
                            } else {
                              setNewWebhookEvents(newWebhookEvents.filter((e) => e !== event));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateWebhook} disabled={isCreating || !newWebhookUrl.trim() || newWebhookEvents.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? 'Creating...' : 'Create Webhook'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configured Webhooks</CardTitle>
              </CardHeader>
              <CardContent>
                {webhooks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No webhooks configured</p>
                ) : (
                  <div className="space-y-4">
                    {webhooks.map((webhook) => (
                      <div key={webhook.id} className="p-4 border rounded-md">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Webhook className="h-5 w-5 text-gray-400" />
                              <p className="font-medium">{webhook.url}</p>
                            </div>
                            {webhook.events && webhook.events.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">Events:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(webhook.events as string[]).map((event) => (
                                    <span key={event} className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                      {event}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Created: {new Date(webhook.createdAt).toLocaleDateString()}
                              {webhook.lastTriggeredAt && ` • Last triggered: ${new Date(webhook.lastTriggeredAt).toLocaleDateString()}`}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                              webhook.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {webhook.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outbox">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Delivery Outbox</CardTitle>
                <CardDescription>View webhook delivery attempts and retries</CardDescription>
              </CardHeader>
              <CardContent>
                {outbox.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No webhook deliveries yet</p>
                ) : (
                  <div className="space-y-2">
                    {outbox.map((delivery) => (
                      <div key={delivery.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{delivery.webhook?.url}</p>
                            <p className="text-sm text-gray-600">{delivery.event}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(delivery.createdAt).toLocaleString()}
                              {delivery.attempts > 0 && ` • Attempts: ${delivery.attempts}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {delivery.status === 'success' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : delivery.status === 'failed' ? (
                              <XCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-600" />
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              delivery.status === 'success' ? 'bg-green-100 text-green-800' :
                              delivery.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {delivery.status}
                            </span>
                          </div>
                        </div>
                        {delivery.error && (
                          <p className="text-xs text-red-600 mt-2">{delivery.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}


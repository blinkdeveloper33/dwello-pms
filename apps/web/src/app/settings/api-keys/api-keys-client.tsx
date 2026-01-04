'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@loomi/ui';
import { Plus, Key, Copy, Trash2, Eye, EyeOff } from 'lucide-react';

interface ApiKeysClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  initialApiKeys: any[];
}

export function ApiKeysClient({
  user,
  orgs,
  currentOrgId,
  initialApiKeys,
}: ApiKeysClientProps) {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const handleOrgChange = (orgId: string) => {
    router.push(`/settings/api-keys?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/enterprise/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          name: newKeyName,
        }),
      });

      if (!response.ok) throw new Error('Failed to create API key');

      const data = await response.json();
      setApiKeys([data, ...apiKeys]);
      setNewKeyName('');
      alert(`API key created! Key: ${data.key}\n\n⚠️ Save this key now - it won't be shown again!`);
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/enterprise/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrgId }),
      });

      if (!response.ok) throw new Error('Failed to delete API key');
      setApiKeys(apiKeys.filter((k) => k.id !== keyId));
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert('API key copied to clipboard');
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
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
        <div>
          <h1 className="text-3xl font-bold text-white">API Keys</h1>
          <p className="mt-1 text-sm text-white/80">Manage API keys for programmatic access</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>Generate a new API key for your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API Key"
              />
            </div>
            <Button onClick={handleCreateKey} disabled={isCreating || !newKeyName.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? 'Creating...' : 'Create API Key'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing API Keys</CardTitle>
            <CardDescription>Manage your API keys</CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No API keys created yet</p>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-gray-400" />
                          <p className="font-medium">{key.name}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {visibleKeys[key.id] ? key.key : maskKey(key.key || '')}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVisibleKeys({ ...visibleKeys, [key.id]: !visibleKeys[key.id] })}
                          >
                            {visibleKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyKey(key.key || '')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {new Date(key.createdAt).toLocaleDateString()}
                          {key.lastUsedAt && ` • Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                        </p>
                        {key.rateLimit && (
                          <p className="text-xs text-gray-500">
                            Rate limit: {key.rateLimit} requests/minute
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteKey(key.id)}
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
      </div>
    </AppShell>
  );
}


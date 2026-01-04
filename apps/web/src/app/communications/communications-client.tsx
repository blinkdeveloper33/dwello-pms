'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Card, CardContent, CardHeader, CardTitle, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import { Plus, Mail, MessageSquare, FileText, Send } from 'lucide-react';

interface CommunicationsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  initialCommunications: any[];
  initialTemplates: any[];
}

export function CommunicationsClient({
  user,
  orgs,
  currentOrgId,
  initialCommunications,
  initialTemplates,
}: CommunicationsClientProps) {
  const router = useRouter();
  const [communications] = useState(initialCommunications);
  const [templates] = useState(initialTemplates);

  const handleOrgChange = (orgId: string) => {
    router.push(`/communications?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'letter':
        return <FileText className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
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
            <h1 className="text-3xl font-bold text-white">Communications</h1>
            <p className="mt-1 text-sm text-white/80">Manage announcements, emails, and messages</p>
          </div>
          <Button onClick={() => router.push('/communications/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Communication
          </Button>
        </div>

        <Tabs defaultValue="communications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="communications">
            <Card>
              <CardHeader>
                <CardTitle>All Communications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {communications.length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">No communications yet</p>
                  ) : (
                    communications.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-4 border rounded-md cursor-pointer hover:bg-gray-50"
                        onClick={() => router.push(`/communications/${comm.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">{getTypeIcon(comm.type)}</div>
                            <div className="flex-1">
                              <p className="font-medium">{comm.subject || `${comm.type} message`}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {comm.property?.name || 'All Properties'}
                              </p>
                              {comm.body && (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{comm.body}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              comm.status === 'sent' ? 'bg-green-100 text-green-800' :
                              comm.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                              comm.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {comm.status}
                            </span>
                            {comm.scheduledAt && (
                              <span className="text-xs text-gray-500">
                                Scheduled: {new Date(comm.scheduledAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Email & Message Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates.length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">No templates yet</p>
                  ) : (
                    templates.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 border rounded-md cursor-pointer hover:bg-gray-50"
                        onClick={() => router.push(`/communications/templates/${template.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Type: {template.type} {template.subject && `- ${template.subject}`}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                            {template.type}
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


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@loomi/ui';
import { Button } from '@loomi/ui';
import { Card } from '@loomi/ui';
import { Input } from '@loomi/ui';
import { FileText, Plus, Search, Download } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  property?: { id: string; name: string } | null;
  createdAt: Date;
}

interface DocumentsClientProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  initialDocuments: Document[];
}

export function DocumentsClient({
  user,
  orgs,
  currentOrgId,
  initialDocuments,
}: DocumentsClientProps) {
  const router = useRouter();
  const [documents] = useState<Document[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter(
            (doc) =>
              !searchQuery ||
              doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              doc.mimeType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell
      user={user}
      orgs={orgs}
      currentOrgId={currentOrgId}
      onOrgChange={(orgId) => {
        router.push(`/documents?org=${orgId}`);
        router.refresh();
      }}
      onSignOut={async () => {
        const { signOut } = await import('next-auth/react');
        signOut({ callbackUrl: '/auth/signin' });
      }}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Documents</h1>
            <p className="mt-1 text-sm text-white/80">Manage your documents</p>
          </div>
          <Button onClick={() => router.push('/documents/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredDocs.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No documents
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload your first document
            </p>
            <Button className="mt-6" onClick={() => router.push('/documents/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((doc) => (
              <Card key={doc.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{doc.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {doc.fileName}
                    </p>
                    {doc.property && (
                      <p className="mt-1 text-xs text-gray-400">
                        {doc.property.name}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}


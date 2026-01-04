'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@loomi/ui';
import { Button } from '@loomi/ui';
import { Card } from '@loomi/ui';
import { Input } from '@loomi/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import { Plus, Users, Search, Mail, Phone, Building2, Home } from 'lucide-react';

interface Contact {
  id: string;
  type: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  links: Array<{
    property?: { id: string; name: string } | null;
    unit?: { id: string; unitNumber: string } | null;
    role?: string | null;
  }>;
  _count: {
    leases: number;
    workOrdersRequester: number;
    charges: number;
  };
}

interface PeopleClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  initialContacts: Contact[];
}

export function PeopleClient({
  user,
  orgs,
  currentOrgId,
  initialContacts,
}: PeopleClientProps) {
  const router = useRouter();
  const [contacts] = useState<Contact[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const handleOrgChange = (orgId: string) => {
    router.push(`/people?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      !searchQuery ||
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery);

    const matchesType = activeTab === 'all' || contact.type === activeTab;

    return matchesSearch && matchesType;
  });

  const contactTypeCounts = {
    all: contacts.length,
    resident: contacts.filter((c) => c.type === 'resident').length,
    owner: contacts.filter((c) => c.type === 'owner').length,
    vendor: contacts.filter((c) => c.type === 'vendor').length,
    board: contacts.filter((c) => c.type === 'board').length,
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">People</h1>
            <p className="mt-1 text-sm text-white/80">
              Manage contacts, residents, owners, and vendors
            </p>
          </div>
          <Button onClick={() => router.push('/people/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All ({contactTypeCounts.all})
            </TabsTrigger>
            <TabsTrigger value="resident">
              Residents ({contactTypeCounts.resident})
            </TabsTrigger>
            <TabsTrigger value="owner">
              Owners ({contactTypeCounts.owner})
            </TabsTrigger>
            <TabsTrigger value="vendor">
              Vendors ({contactTypeCounts.vendor})
            </TabsTrigger>
            <TabsTrigger value="board">
              Board ({contactTypeCounts.board})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredContacts.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No contacts found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Get started by adding your first contact'}
                </p>
                {!searchQuery && (
                  <Button
                    className="mt-6"
                    onClick={() => router.push('/people/new')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredContacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className="cursor-pointer transition-shadow hover:shadow-lg"
                    onClick={() => router.push(`/people/${contact.id}`)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 capitalize">
                            {contact.type}
                          </p>
                        </div>
                        <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 capitalize">
                          {contact.type}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-gray-500">
                        {contact.email && (
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.links.length > 0 && (
                          <div className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4" />
                            <span>
                              {contact.links.length}{' '}
                              {contact.links.length === 1
                                ? 'property'
                                : 'properties'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center space-x-4 text-xs text-gray-400">
                        {contact._count.leases > 0 && (
                          <span>{contact._count.leases} leases</span>
                        )}
                        {contact._count.workOrdersRequester > 0 && (
                          <span>
                            {contact._count.workOrdersRequester} work orders
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}


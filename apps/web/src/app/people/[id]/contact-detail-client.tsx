'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@loomi/ui';
import { Button } from '@loomi/ui';
import { Card } from '@loomi/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Home,
  FileText,
  Wrench,
  DollarSign,
} from 'lucide-react';

interface ContactDetailClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  contact: any;
}

export function ContactDetailClient({
  user,
  orgs,
  currentOrgId,
  contact,
}: ContactDetailClientProps) {
  const router = useRouter();

  const handleOrgChange = (orgId: string) => {
    router.push(`/people/${contact.id}?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/people')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {contact.firstName} {contact.lastName}
              </h1>
              <p className="mt-1 text-sm text-gray-500 capitalize">
                {contact.type}
              </p>
            </div>
          </div>
          <Button onClick={() => router.push(`/people/${contact.id}/edit`)}>
            Edit Contact
          </Button>
        </div>

        {/* Contact Info */}
        <Card className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
              <dl className="mt-2 space-y-2">
                {contact.email && (
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    <dd className="text-sm text-gray-900">{contact.email}</dd>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    <dd className="text-sm text-gray-900">{contact.phone}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Stats</h3>
              <dl className="mt-2 space-y-2">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-gray-400" />
                  <dd className="text-sm text-gray-900">
                    {contact._count.leases} {contact._count.leases === 1 ? 'lease' : 'leases'}
                  </dd>
                </div>
                <div className="flex items-center">
                  <Wrench className="mr-2 h-4 w-4 text-gray-400" />
                  <dd className="text-sm text-gray-900">
                    {contact._count.workOrdersRequester + contact._count.workOrdersVendor}{' '}
                    work orders
                  </dd>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
                  <dd className="text-sm text-gray-900">
                    {contact._count.charges} charges
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="properties" className="space-y-4">
          <TabsList>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="leases">Leases</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            {contact.links.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No properties linked
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  This contact is not linked to any properties yet
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {contact.links.map((link: any) => (
                  <Card key={link.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        {link.property && (
                          <h4
                            className="font-medium text-gray-900 cursor-pointer hover:text-indigo-600"
                            onClick={() =>
                              router.push(`/properties/${link.property.id}`)
                            }
                          >
                            {link.property.name}
                          </h4>
                        )}
                        {link.unit && (
                          <p className="text-sm text-gray-500">
                            Unit {link.unit.unitNumber}
                            {link.unit.building && ` - ${link.unit.building.name}`}
                          </p>
                        )}
                        {link.role && (
                          <p className="mt-1 text-xs text-gray-400 capitalize">
                            {link.role.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leases" className="space-y-4">
            {contact.leases.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No leases
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  This contact has no active or past leases
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {contact.leases.map((lease: any) => (
                  <Card key={lease.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {lease.property.name} - Unit {lease.unit.unitNumber}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(lease.startDate).toLocaleDateString()} -{' '}
                          {lease.endDate
                            ? new Date(lease.endDate).toLocaleDateString()
                            : 'Ongoing'}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          ${Number(lease.monthlyRent).toLocaleString()}/month
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          lease.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {lease.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="p-12 text-center">
              <p className="text-sm text-gray-500">
                Activity timeline coming soon
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@loomi/ui';
import { Button } from '@loomi/ui';
import { Card } from '@loomi/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import {
  ArrowLeft,
  Building2,
  Home,
  FileText,
  Wrench,
  Users,
} from 'lucide-react';

interface PropertyDetailClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  property: any;
}

export function PropertyDetailClient({
  user,
  orgs,
  currentOrgId,
  property,
}: PropertyDetailClientProps) {
  const router = useRouter();

  const handleOrgChange = (orgId: string) => {
    router.push(`/properties/${property.id}?org=${orgId}`);
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
              onClick={() => router.push('/properties')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {property.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {property.address}, {property.city}, {property.state}{' '}
                {property.zip}
              </p>
            </div>
          </div>
          <Button onClick={() => router.push(`/properties/${property.id}/edit`)}>
            Edit Property
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center">
              <Home className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Units</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {property.units.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Buildings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {property.buildings.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Wrench className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Work Orders
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {property._count.workOrders}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Contacts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {property._count.contacts}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="buildings">Buildings</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Property Details
              </h3>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {property.propertyType}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Full Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.address}
                    <br />
                    {property.city}, {property.state} {property.zip}
                  </dd>
                </div>
              </dl>
            </Card>
          </TabsContent>

          <TabsContent value="buildings" className="space-y-4">
            {property.buildings.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No buildings
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Add buildings to organize units
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {property.buildings.map((building: any) => (
                  <Card key={building.id} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {building.name}
                    </h3>
                    {building.address && (
                      <p className="mt-1 text-sm text-gray-500">
                        {building.address}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      {building._count.units} units
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="units" className="space-y-4">
            {property.units.length === 0 ? (
              <Card className="p-12 text-center">
                <Home className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No units
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Add units to this property
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {property.units.map((unit: any) => (
                  <Card key={unit.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Unit {unit.unitNumber}
                        </h4>
                        {unit.building && (
                          <p className="text-sm text-gray-500">
                            {unit.building.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {unit.bedrooms && (
                          <div>{unit.bedrooms} bed</div>
                        )}
                        {unit.bathrooms && (
                          <div>
                            {Number(unit.bathrooms).toFixed(1)} bath
                          </div>
                        )}
                        {unit.squareFeet && (
                          <div>{unit.squareFeet.toLocaleString()} sq ft</div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No documents
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Documents feature coming soon
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}


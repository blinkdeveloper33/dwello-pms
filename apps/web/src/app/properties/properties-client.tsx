'use client';

import { useState } from 'react';
import { AppShell } from '@loomi/ui';
import { Button } from '@loomi/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@loomi/ui';
import { Badge } from '@loomi/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@loomi/ui';
import { useRouter } from 'next/navigation';
import { Plus, Building2, Home, MapPin, ArrowRight } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  _count: {
    units: number;
    buildings: number;
  };
}

interface PropertiesClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  initialProperties: Property[];
}

export function PropertiesClient({
  user,
  orgs,
  currentOrgId,
  initialProperties,
}: PropertiesClientProps) {
  const router = useRouter();
  const [properties] = useState<Property[]>(initialProperties);

  const handleOrgChange = (orgId: string) => {
    router.push(`/properties?org=${orgId}`);
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
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Properties</h1>
            <p className="text-white/80 mt-2">
              Manage your property portfolio
            </p>
          </div>
          <Button onClick={() => router.push('/properties/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>

        {/* Properties Table */}
        {properties.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No properties yet
            </h3>
            <p className="mt-2 text-sm text-white/80">
              Get started by adding your first property
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push('/properties/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Properties</CardTitle>
              <CardDescription>
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} in your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Buildings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow
                      key={property.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/properties/${property.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {property.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {property.address}, {property.city}, {property.state} {property.zip}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {property.propertyType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{property._count.units}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {property._count.buildings > 0 ? (
                          <Badge variant="outline">{property._count.buildings}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/properties/${property.id}`);
                          }}
                        >
                          View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}


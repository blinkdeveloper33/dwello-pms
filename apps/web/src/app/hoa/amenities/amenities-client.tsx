'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@loomi/ui';
import { Plus, Calendar, Clock } from 'lucide-react';

interface AmenitiesClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  amenities: any[];
  reservations: any[];
}

export function AmenitiesClient({
  user,
  orgs,
  currentOrgId,
  amenities,
  reservations,
}: AmenitiesClientProps) {
  const router = useRouter();

  const handleOrgChange = (orgId: string) => {
    router.push(`/hoa/amenities?org=${orgId}`);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Amenities & Reservations</h1>
            <p className="mt-1 text-sm text-white/80">Manage community amenities and reservations</p>
          </div>
          <Button onClick={() => router.push('/hoa/amenities/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Reservation
          </Button>
        </div>

        <Tabs defaultValue="amenities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="amenities">Amenities ({amenities.length})</TabsTrigger>
            <TabsTrigger value="reservations">Reservations ({reservations.length})</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="amenities">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {amenities.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">No amenities configured</p>
                  </CardContent>
                </Card>
              ) : (
                amenities.map((amenity) => (
                  <Card key={amenity.id}>
                    <CardHeader>
                      <CardTitle>{amenity.name}</CardTitle>
                      {amenity.description && (
                        <CardDescription>{amenity.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {amenity.rules && (
                          <div>
                            <p className="font-medium text-gray-700">Rules:</p>
                            <p className="text-gray-600">{JSON.stringify(amenity.rules)}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Max Duration: {amenity.maxDuration || 'N/A'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reservations</p>
                ) : (
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <div key={reservation.id} className="p-4 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{reservation.amenity?.name}</p>
                            <p className="text-sm text-gray-600">
                              {reservation.contact?.firstName} {reservation.contact?.lastName}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(reservation.startDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(reservation.startDate).toLocaleTimeString()} - {new Date(reservation.endDate).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Reservation Calendar</CardTitle>
                <CardDescription>Calendar view coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  Calendar visualization will be implemented with a date picker component
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}


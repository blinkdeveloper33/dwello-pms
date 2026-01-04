'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@loomi/ui';
import { Input } from '@loomi/ui';
import { Label } from '@loomi/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@loomi/ui';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Call API to create org
      // For now, redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Organization</CardTitle>
          <CardDescription>Get started by creating your first organization</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) {
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')
                    );
                  }
                }}
                required
                placeholder="Acme Property Management"
              />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="acme-property-management"
              />
              <p className="text-xs text-gray-500 mt-1">This will be used in your organization URL</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Organization'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


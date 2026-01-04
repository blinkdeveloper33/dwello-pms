'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea } from '@loomi/ui';
import { ArrowLeft, Send, Calendar } from 'lucide-react';

const communicationSchema = z.object({
  type: z.enum(['email', 'sms', 'letter']),
  propertyId: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  templateId: z.string().optional(),
  scheduledAt: z.string().optional(),
});

type CommunicationFormData = z.infer<typeof communicationSchema>;

interface NewCommunicationClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs: Array<{ id: string; name: string }>;
  currentOrgId: string;
  properties: Array<{ id: string; name: string }>;
  templates: Array<{ id: string; name: string; type: string; subject: string }>;
}

export function NewCommunicationClient({
  user,
  orgs,
  currentOrgId,
  properties,
  templates,
}: NewCommunicationClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      type: 'email',
    },
  });

  const selectedTemplateId = watch('templateId');
  const selectedType = watch('type');

  const handleOrgChange = (orgId: string) => {
    router.push(`/communications/new?org=${orgId}`);
    router.refresh();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/auth/signin' });
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setValue('subject', template.subject || '');
      setValue('type', template.type as 'email' | 'sms' | 'letter');
    }
  };

  const onSubmit = async (data: CommunicationFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrgId,
          type: data.type,
          propertyId: data.propertyId || undefined,
          subject: data.subject,
          body: data.body,
          templateId: data.templateId || undefined,
          scheduledAt: isScheduled && data.scheduledAt ? data.scheduledAt : undefined,
          status: isScheduled ? 'scheduled' : 'draft',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create communication');
      }

      router.push('/communications');
    } catch (error) {
      console.error('Error creating communication:', error);
      alert('Failed to create communication. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">New Communication</h1>
            <p className="mt-1 text-sm text-white/80">Send announcements, emails, or messages</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Details</CardTitle>
              <CardDescription>Compose your message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="letter">Letter</option>
                </select>
              </div>

              {templates.length > 0 && (
                <div>
                  <Label htmlFor="templateId">Template (Optional)</Label>
                  <select
                    id="templateId"
                    {...register('templateId')}
                    onChange={(e) => {
                      handleTemplateSelect(e.target.value);
                      register('templateId').onChange(e);
                    }}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Start from scratch</option>
                    {templates
                      .filter((t) => t.type === selectedType)
                      .map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="propertyId">Target Property (Optional)</Label>
                <select
                  id="propertyId"
                  {...register('propertyId')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Properties</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  {...register('subject')}
                  placeholder="Enter subject line"
                />
                {errors.subject && (
                  <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="body">Message Body *</Label>
                <Textarea
                  id="body"
                  {...register('body')}
                  rows={10}
                  placeholder="Enter your message..."
                  className="font-mono"
                />
                {errors.body && (
                  <p className="text-sm text-red-600 mt-1">{errors.body.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule (Optional)</CardTitle>
              <CardDescription>Send now or schedule for later</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isScheduled"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isScheduled">Schedule for later</Label>
              </div>

              {isScheduled && (
                <div>
                  <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    {...register('scheduledAt')}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isScheduled ? (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Scheduling...' : 'Schedule'}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Sending...' : 'Send Now'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}


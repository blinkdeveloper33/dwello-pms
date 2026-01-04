'use client';

import * as React from 'react';
import { cn } from '../utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  orgs?: Array<{ id: string; name: string }>;
  currentOrgId?: string;
  onOrgChange?: (orgId: string) => void;
  onSignOut?: () => void;
}

export function AppShell({ children, user, orgs, currentOrgId, onOrgChange, onSignOut }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Properties', href: '/properties' },
    { label: 'People', href: '/people' },
    { label: 'Inbox', href: '/inbox' },
    { label: 'Maintenance', href: '/maintenance' },
    { label: 'Communications', href: '/communications' },
    { label: 'Documents', href: '/documents' },
    { label: 'Metrics', href: '/metrics' },
    { label: 'Reports', href: '/reports' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Top Bar */}
      <header className="bg-white/20 backdrop-blur-md border-b border-white/20 shadow-lg shadow-black/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-white/10 text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: 'var(--font-caveat), cursive' }}>Dwello.</h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* User Menu */}
            {user && (
              <>
                {/* Org Switcher - Next to User Icon */}
                {orgs && orgs.length > 0 && (
                  <select
                    value={currentOrgId || ''}
                    onChange={(e) => onOrgChange?.(e.target.value)}
                    className="px-3 py-2 border border-white/30 rounded-md text-sm bg-white/20 backdrop-blur-sm text-white hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors"
                  >
                    {orgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name || user.email}</p>
                      {user.email && user.name && (
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      )}
                    </div>
                    <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSignOut}>Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/20 backdrop-blur-md border-r border-white/20 shadow-lg shadow-black/5 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm text-white rounded-md hover:bg-white/10 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 relative z-10">{children}</main>
      </div>
    </div>
  );
}


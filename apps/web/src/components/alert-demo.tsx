'use client';

import { Alert, AlertDescription, AlertTitle } from '@loomi/ui';
import { Terminal, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Alert Component Demo
 * 
 * Usage examples for the Alert component from shadcn/ui
 */
export function AlertDemo() {
  return (
    <div className="space-y-4">
      {/* Default Alert */}
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the cli.
        </AlertDescription>
      </Alert>

      {/* Destructive Alert */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </Alert>

      {/* Success Alert (custom styling) */}
      <Alert className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>
          Your changes have been saved successfully.
        </AlertDescription>
      </Alert>

      {/* Info Alert (custom styling) */}
      <Alert className="border-blue-500/50 text-blue-700 dark:text-blue-400 [&>svg]:text-blue-600">
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          This feature is currently in beta. Please report any issues.
        </AlertDescription>
      </Alert>

      {/* Warning Alert (custom styling) */}
      <Alert className="border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          You are approaching your usage limit. Consider upgrading your plan.
        </AlertDescription>
      </Alert>
    </div>
  );
}


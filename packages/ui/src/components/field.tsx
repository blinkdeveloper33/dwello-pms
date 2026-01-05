import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { Label } from './label';
import { Separator } from './separator';

// FieldSet
const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    className={cn('space-y-6', className)}
    {...props}
  />
));
FieldSet.displayName = 'FieldSet';

// FieldLegend
const fieldLegendVariants = cva('', {
  variants: {
    variant: {
      legend: 'text-base font-semibold',
      label: 'text-sm font-medium leading-none',
    },
  },
  defaultVariants: {
    variant: 'legend',
  },
});

interface FieldLegendProps
  extends React.HTMLAttributes<HTMLLegendElement>,
    VariantProps<typeof fieldLegendVariants> {
  children?: React.ReactNode;
  className?: string;
}

const FieldLegend = React.forwardRef<HTMLLegendElement, FieldLegendProps>(
  ({ className, variant, children, ...props }, ref) => (
    <legend
      ref={ref}
      className={cn(fieldLegendVariants({ variant }), className)}
      {...props}
    >
      {children}
    </legend>
  )
);
FieldLegend.displayName = 'FieldLegend';

// FieldGroup
const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-6', className)}
    {...props}
  />
));
FieldGroup.displayName = 'FieldGroup';

// Field
const fieldVariants = cva('', {
  variants: {
    orientation: {
      vertical: 'flex flex-col gap-2',
      horizontal: 'flex flex-row items-start gap-4',
      responsive: 'flex flex-col gap-2 @container/field-group:flex-row @container/field-group:items-start @container/field-group:gap-4',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

interface FieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fieldVariants> {
  'data-invalid'?: boolean;
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, orientation, 'data-invalid': dataInvalid, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      data-invalid={dataInvalid}
      className={cn(
        fieldVariants({ orientation }),
        dataInvalid && 'data-[invalid]:text-destructive',
        className
      )}
      {...props}
    />
  )
);
Field.displayName = 'Field';

// FieldContent
const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5', className)}
    {...props}
  />
));
FieldContent.displayName = 'FieldContent';

// FieldLabel
interface FieldLabelProps
  extends React.ComponentPropsWithoutRef<typeof Label> {
  asChild?: boolean;
}

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  FieldLabelProps
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  />
));
FieldLabel.displayName = 'FieldLabel';

// FieldTitle
const FieldTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm font-medium leading-none', className)}
    {...props}
  />
));
FieldTitle.displayName = 'FieldTitle';

// FieldDescription
const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground [&:has(+*)]:mb-0', className)}
    {...props}
  />
));
FieldDescription.displayName = 'FieldDescription';

// FieldSeparator
interface FieldSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof Separator> {
  children?: React.ReactNode;
}

const FieldSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  FieldSeparatorProps
>(({ className, children, ...props }, ref) => {
  if (children) {
    return (
      <div className={cn('relative flex items-center gap-4', className)}>
        <Separator ref={ref} {...props} />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {children}
        </span>
        <Separator {...props} />
      </div>
    );
  }
  return <Separator ref={ref} className={className} {...props} />;
});
FieldSeparator.displayName = 'FieldSeparator';

// FieldError
interface FieldErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  errors?: Array<{ message?: string } | undefined> | { message?: string };
}

const FieldError = React.forwardRef<HTMLDivElement, FieldErrorProps>(
  ({ className, errors, children, ...props }, ref) => {
    const errorMessages = React.useMemo(() => {
      if (children) return [children];
      if (!errors) return [];
      
      // Handle single error object
      if (!Array.isArray(errors)) {
        return errors.message ? [errors.message] : [];
      }
      
      // Handle array of errors
      return errors
        .filter((error): error is { message?: string } => !!error)
        .map((error) => error.message)
        .filter((message): message is string => !!message);
    }, [errors, children]);

    if (errorMessages.length === 0) return null;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn('text-sm text-destructive', className)}
        {...props}
      >
        {errorMessages.length === 1 ? (
          <div>{errorMessages[0]}</div>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
FieldError.displayName = 'FieldError';

export {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldSeparator,
  FieldError,
};


'use client';

import { forwardRef } from 'react';
import { cn } from '@/app/lib/utils';

interface TimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="time"
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
); 
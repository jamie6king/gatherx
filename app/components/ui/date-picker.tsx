'use client';

import { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '@/app/lib/utils';

interface DatePickerProps {
  className?: string;
  selected?: Date;
  onChange?: (date: Date) => void;
  [key: string]: any;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, selected, onChange, ...props }, ref) => {
    return (
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        dateFormat="yyyy-MM-dd"
        {...props}
      />
    );
  }
); 
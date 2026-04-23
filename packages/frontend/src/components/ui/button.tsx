import { Button as AdmButton } from 'antd-mobile';
import type { ButtonProps as AdmButtonProps, ButtonRef } from 'antd-mobile/es/components/button';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type ButtonProps = AdmButtonProps;

export const Button = forwardRef<ButtonRef, ButtonProps>(
  function Button({ className, ...props }, ref) {
    return (
      <AdmButton
        ref={ref}
        className={cn('!rounded-xl', className)}
        {...props}
      />
    );
  },
);

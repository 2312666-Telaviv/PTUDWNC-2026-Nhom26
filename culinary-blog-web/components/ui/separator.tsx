import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils/cn';

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = false, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    className={cn(
      'shrink-0 border-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'w-[1px] h-full',
      className
    )}
    orientation={orientation}
    decorative={decorative}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };

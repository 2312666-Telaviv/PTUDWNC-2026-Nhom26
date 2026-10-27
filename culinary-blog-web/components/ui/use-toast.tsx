/**
 * Hook sử dụng toast notification (thông báo trên màn hình).
 * Dùng Radix UI Toast + zustand (hoặc context) để quản lý trạng thái.
 */
import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cn } from '@/lib/utils/cn';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:left-auto sm:top-0',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type ToastAction = {
  label: string;
  onClick: () => void;
};

type Toast = {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastAction;
  variant?: 'default' | 'destructive';
  duration?: number;
};

type ToastProps = Toast & {
  duration?: number;
};

const listeners: Array<(toasts: Toast[]) => void> = [];

let memoryState: Toast[] = [];

function dispatch(toasts: Toast[]) {
  listeners.forEach((listener) => {
    listener(toasts);
  });
}

type ToastActionElement = React.ReactElement<
  React.ComponentProps<typeof ToastActionComponent>
>;

function createToast() {
  return (props: ToastProps) => {
    const id = Math.random().toString(36).slice(2, 9);

    const update = (newProps: Partial<ToastProps>) => {
      memoryState = memoryState.map((t) =>
        t.id === id ? { ...t, ...newProps } : t
      );
      dispatch(memoryState);
    };

    const dismiss = () => {
      update({});
    };

    const toast: Toast = {
      id,
      title: props.title,
      description: props.description,
      action: props.action,
      variant: props.variant ?? 'default',
      duration: props.duration ?? TOAST_REMOVE_DELAY,
    };

    memoryState = [toast, ...memoryState].slice(0, TOAST_LIMIT);
    dispatch(memoryState);

    setTimeout(() => {
      dismiss();
    }, toast.duration);

    return {
      id,
      dismiss,
      update,
    };
  };
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>(memoryState);

  React.useEffect(() => {
    setToasts(memoryState);
  }, []);

  const toast = createToast();

  return {
    toast,
    toasts,
    dismiss: (id?: string) => {
      memoryState = memoryState.filter((t) => t.id !== id);
      dispatch(memoryState);
    },
  };
}

function ToastActionComponent({
  label,
  onClick,
}: ToastAction & { className?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
    >
      {label}
    </button>
  );
}

function ToastDismissButton({
  onClick = () => {},
}: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Dismiss"
      className="inline-flex items-center justify-center box-border rounded-md p-2 text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <span className="sr-only">Dismiss</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  );
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: 'default' | 'destructive';
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastAction;
  }
>(({ className, variant, title, description, action, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        'group pointer-events-auto flex flex-col items-start justify-between space-x-4 space-y-2 rounded-lg border p-4 pr-2 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:absolute data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:duration-200 data-[state=open]:duration-300',
        variant === 'destructive' &&
          'border-destructive/50 bg-destructive text-destructive-foreground',
        className
      )}
      {...props}
    >
      <div className="flex flex-col space-y-2">
        {title && (
          <ToastPrimitives.Title className="text-sm font-semibold">{title}</ToastPrimitives.Title>
        )}
        {description && (
          <ToastPrimitives.Description className="text-sm opacity-90">{description}</ToastPrimitives.Description>
        )}
      </div>
      <div className="flex">
        {action && (
          <ToastActionComponent label={action.label} onClick={action.onClick} />
        )}
        <ToastDismissButton />
      </div>
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  type ToastAction,
  type ToastProps,
};

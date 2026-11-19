import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    href: string;
    label: string;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-orange-100 bg-white p-6 text-center" role="status">
      <p className="text-base font-semibold text-gray-900">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      {action && (
        <Link href={action.href} className="btn btn-outline mt-4">
          {action.label}
        </Link>
      )}
    </div>
  );
}

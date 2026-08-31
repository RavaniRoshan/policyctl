import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-40 px-16">
      {Icon && (
        <div className="size-48 rounded-full bg-heat-4 inline-flex items-center justify-center mb-16 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-heat-12">
          <Icon className="size-5 text-heat-100" />
        </div>
      )}
      <div className="text-label-x-large text-accent-black">{title}</div>
      {description && (
        <div className="mt-8 text-body-medium text-black-alpha-64 max-w-sm">{description}</div>
      )}
      {action && <div className="mt-24">{action}</div>}
    </div>
  );
}

export function MonoAnnotation({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-mono-x-small text-black-alpha-32 uppercase tracking-[0.14em]">
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`pcl-skeleton ${className ?? ""}`} />;
}


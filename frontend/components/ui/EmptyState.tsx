type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center p-10 border border-dashed rounded-xl bg-white">
      <h2 className="text-lg font-medium text-zinc-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-zinc-600">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

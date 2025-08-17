type BadgeProps = { children: React.ReactNode; variant?: 'default' | 'soft'; className?: string };

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const base =
    variant === 'soft'
      ? 'inline-flex items-center rounded-full bg-brand-600/10 text-brand-700 px-2.5 py-1 text-xs font-medium'
      : 'inline-flex items-center rounded-full bg-brand-600 text-white px-2.5 py-1 text-xs font-medium';
  return <span className={[base, className].filter(Boolean).join(' ')}>{children}</span>;
}

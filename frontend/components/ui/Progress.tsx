type ProgressProps = { value: number; max?: number; label?: string };

export function Progress({ value, max = 100, label }: ProgressProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const pct = Math.round((clamped / max) * 100);
  return (
    <div aria-label={label} className="w-full">
      <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
        <div
          className="h-full bg-brand-600 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {label && <div className="mt-1 text-xs text-zinc-600">{label}</div>}
    </div>
  );
}

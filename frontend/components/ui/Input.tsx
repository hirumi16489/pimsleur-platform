import type { InputHTMLAttributes, ReactNode } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  left?: ReactNode;
  right?: ReactNode;
};

export function Input({ label, hint, error, left, right, id, className, ...rest }: InputProps) {
  const inputId = id || rest.name || 'input';
  const describedBy = [hint ? `${inputId}-hint` : undefined, error ? `${inputId}-error` : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700 mb-1.5">
          {label}
        </label>
      )}
      <div
        className={[
          'relative flex items-center rounded-lg border bg-white',
          error ? 'border-red-300 focus-within:ring-red-500/40' : 'border-zinc-300',
          'focus-within:ring-2 focus-within:ring-brand-600/30',
        ].join(' ')}
      >
        {left && <div className="pl-3 text-zinc-500">{left}</div>}
        <input
          id={inputId}
          aria-describedby={describedBy || undefined}
          className="w-full px-3 py-2 rounded-lg outline-none bg-transparent text-sm"
          {...rest}
        />
        {right && <div className="pr-3 text-zinc-500">{right}</div>}
      </div>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-zinc-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

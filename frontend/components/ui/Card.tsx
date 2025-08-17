import type { ReactNode } from 'react';

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={['card p-8', className].filter(Boolean).join(' ')}>
      {title && <h1 className="text-2xl font-semibold mb-4">{title}</h1>}
      {children}
    </div>
  );
}

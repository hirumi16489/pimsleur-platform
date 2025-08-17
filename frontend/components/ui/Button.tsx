import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type CommonProps = {
  variant?: 'primary' | 'secondary';
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps & {
  as?: 'button';
} & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsLink = CommonProps & {
  as: 'link';
  href: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = 'primary', className, children } = props;
  const base = ['btn', `btn-${variant}`, 'focus-ring', className].filter(Boolean).join(' ');

  if (props.as === 'link') {
    const { href, as: _ignore, ...rest } = props;
    return (
      <Link className={base} href={href} {...rest}>
        {children}
      </Link>
    );
  }

  const { as: _omit, ...buttonProps } = props as ButtonAsButton;
  return (
    <button className={base} {...buttonProps}>
      {children}
    </button>
  );
}

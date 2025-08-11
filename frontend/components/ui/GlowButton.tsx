import Link from 'next/link';

type GlowButtonProps = {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
};

export function GlowButton({ href, prefetch, children }: GlowButtonProps) {
  return (
    <Link href={href} prefetch={prefetch} className="inline-block">
      <span className="relative inline-flex rounded-xl p-[2px] bg-gradient-to-r from-brand-600 via-cyan-500 to-brand-700">
        <span
          className="absolute -inset-1 blur-md opacity-50 bg-gradient-to-r from-brand-600 via-cyan-500 to-brand-700"
          aria-hidden
        />
        <span className="relative inline-flex items-center justify-center rounded-[10px] bg-white text-brand-700 px-4 py-2 text-sm font-medium hover:bg-zinc-50 transition-colors">
          {children}
          <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </span>
    </Link>
  );
}

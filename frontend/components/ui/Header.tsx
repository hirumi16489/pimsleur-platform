'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white drop-shadow">
          <Logo size={20} />
          <span>Pimsleur Platform</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-3">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link
                    className="text-sm font-medium text-white hover:text-white drop-shadow"
                    href="/upload"
                  >
                    Upload
                  </Link>
                  <Link
                    className="text-sm font-medium text-white hover:text-white drop-shadow"
                    href="/status"
                  >
                    Status
                  </Link>
                  <Link
                    className="text-sm font-medium text-white hover:text-white drop-shadow"
                    href="/account"
                  >
                    Account
                  </Link>
                  <button
                    onClick={logout}
                    className="inline-flex items-center justify-center rounded-xl px-3.5 py-1.5 text-sm font-medium text-white bg-black/30 hover:bg-black/40 border border-white/20 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={login}
                  className="inline-flex items-center justify-center rounded-xl px-3.5 py-1.5 text-sm font-medium text-white bg-black/30 hover:bg-black/40 border border-white/20 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Sign in
                </button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

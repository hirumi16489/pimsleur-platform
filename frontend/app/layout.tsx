import './globals.css';
import type { Metadata } from 'next';
import { Header } from '@/components/ui/Header';
// import { Footer } from '@/components/ui/Footer'

export const metadata: Metadata = {
  title: 'Pimsleur Platform',
  description:
    'Upload content to generate Japanese lessons, audio, dictionary, flashcards, and progress tracking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900 antialiased min-h-screen flex flex-col">
        {/* Global rainbow bands - same as homepage */}
        <div className="rainbow-band fixed inset-x-0 top-0 h-64 sm:h-80 z-0" />
        <div className="rainbow-band-br fixed inset-x-0 bottom-0 h-64 sm:h-80 z-0" />

        <Header />
        <main className="flex-1 relative z-10">{children}</main>
        {/* Footer removed per request */}
      </body>
    </html>
  );
}

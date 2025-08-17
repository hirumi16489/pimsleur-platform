import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { GlowButton } from '@/components/ui/GlowButton';
import { CurvyFlow } from '@/components/CurvyFlow';
import { CurvyFlowVertical } from '@/components/CurvyFlowVertical';
import { ReactElement } from 'react';

export default function HomePage(): ReactElement {
  const headline: string = 'Create Japanese lessons from your content';
  const subhead: string =
    'Upload PDFs or audio and we generate Pimsleur-style lessons: audio drills, dictionary entries, flashcards, quizzes, and learning progress tracking.';

  return (
    <>
      {/* Stripe/Linear-inspired hero */}
      <div className="relative overflow-hidden">
        {/* Hero content over dark panel */}
        <div className="relative z-10 bg-gradient-to-b from-transparent to-zinc-950/95 pt-16">
          <div className="mx-auto max-w-6xl px-4 pb-16">
            <div className="max-w-3xl">
              <Badge variant="soft" className="bg-white/80 text-black">
                Private alpha
              </Badge>
              <h1 className="hero-headline mt-4 text-5xl sm:text-6xl font-semibold text-white">
                {headline}
              </h1>
              <p className="mt-5 text-zinc-300 max-w-2xl text-lg leading-7">{subhead}</p>
              <div className="mt-7">
                <GlowButton href="/api/auth/login" prefetch={false}>
                  Start now
                </GlowButton>
              </div>
            </div>
          </div>
        </div>
        {/* removed: experimental diagonal sweep */}
        {/* Dark band with journey rail */}
        <div className="bg-zinc-950 relative">
          {/* Band-level vertical rail (slight curve) for small screens, anchored to full band height */}
          <div
            id="mobile-rail"
            className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[180px] z-[1] block lg:hidden"
          >
            <svg
              className="h-full w-full overflow-visible"
              viewBox="0 0 180 1000"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="railMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
                <filter
                  id="glowMobile"
                  filterUnits="userSpaceOnUse"
                  x="-40"
                  y="-40"
                  width="260"
                  height="1080"
                >
                  <feGaussianBlur stdDeviation="8" />
                </filter>
              </defs>
              <path
                id="mobile-rail-path"
                d="M90 0 C -55 280, 235 720, 90 1000"
                stroke="url(#railMobile)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M90 0 C -55 280, 235 720, 90 1000"
                stroke="url(#railMobile)"
                strokeWidth="18"
                opacity=".25"
                filter="url(#glowMobile)"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <div className="relative py-10 lg:py-8 z-[2] min-h-[640px] lg:min-h-[280px]">
            <div className="mx-auto max-w-6xl px-4 mb-4">
              <span className="inline-flex items-center rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-medium tracking-wide text-white">
                Your journey
              </span>
            </div>
            {/* Full-width flow rail beneath, independent from max-width container */}
            <div className="-mt-8 sm:-mt-10 relative" id="journey-band">
              <div className="hidden lg:block">
                <CurvyFlow />
              </div>
              <div className="block lg:hidden relative z-[2]">
                <CurvyFlowVertical withRail={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

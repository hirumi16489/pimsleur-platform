'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = { withRail?: boolean };

export function CurvyFlowVertical({ withRail = true }: Props) {
  const steps = useMemo(
    () => [
      { t: 'Join', d: 'Create your account in seconds' },
      { t: 'Send your files', d: 'Drop your text or pictures—done' },
      { t: 'We create your lessons', d: 'Pimsleur audio, flashcards, quizzes' },
      { t: 'Start learning', d: 'Practice daily and see your progress' },
    ],
    []
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<SVGPathElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const recomputePassRef = useRef<number>(0);
  const BASE_MIN_HEIGHT = 720;
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cardHeights, setCardHeights] = useState<number[]>([130, 130, 130, 130]);
  const [cardWidths, setCardWidths] = useState<number[]>([]);
  const [positions, setPositions] = useState<
    { top: number; left: number; right?: number; alignRight: boolean }[]
  >([]);

  useEffect(() => {
    const compute = () => {
      const el = containerRef.current;
      const internalPath = railRef.current;
      const externalPath = document.getElementById('mobile-rail-path') as SVGPathElement | null;
      const path = internalPath ?? externalPath;
      if (!el || !path) return;
      const rect = el.getBoundingClientRect();
      const originRect = contentRef.current?.getBoundingClientRect() ?? rect;
      const svgEl = path.closest('svg') as SVGSVGElement | null;
      const railRect = svgEl
        ? svgEl.getBoundingClientRect()
        : ({ width: 180, height: rect.height, top: rect.top, left: rect.left } as any);
      const viewW = 180;
      const viewH = 1000;
      const scaleX = railRect.width / viewW;
      const scaleY = railRect.height / viewH;
      const centerPx = originRect.width / 2;
      const offsetY = (railRect.top ?? 0) - originRect.top;
      const total = path.getTotalLength();
      // Distribute evenly along the curve length for stable spacing independent of container height
      const stepsCount = steps.length;
      const baseMinHeight = 640;
      const intendedHeight = Math.max(originRect.height, baseMinHeight);
      const startL = total * 0.1;
      const endL = total * 0.86;
      const baseLengths = Array.from(
        { length: stepsCount },
        (_, i) => startL + (i * (endL - startL)) / (stepsCount - 1)
      );
      // Per-card arc-length bias to gently lower card 1 and lift card 4 while keeping dots on the rail
      const lengthBiasFractions = [0.02, 0.0, 0.0, -0.025]; // fractions of total path length
      const sampleLengths = baseLengths.map((len, i) => {
        const biased = len + (lengthBiasFractions[i] || 0) * total;
        return Math.min(total, Math.max(0, biased));
      });
      const results: { top: number; left: number; right?: number; alignRight: boolean }[] = [];
      sampleLengths.forEach((len, i) => {
        const p = path.getPointAtLength(len);
        const xOnRailAbs = (railRect.left ?? 0) + p.x * scaleX;
        const yOnRailAbs = (railRect.top ?? 0) + p.y * scaleY;
        const alignRight = i % 2 === 1;
        const fallbackWidth = originRect.width * 0.4;
        const cardWidth = cardWidths[i] ?? fallbackWidth;
        const cardHeight = cardHeights[i] ?? 130;
        const dotOffset = 0;
        const biasX = i === 0 ? -4 : 0;
        const left = alignRight
          ? xOnRailAbs + dotOffset + biasX - originRect.left
          : xOnRailAbs - dotOffset + biasX - originRect.left - cardWidth;
        const top = Math.max(
          0,
          Math.min(yOnRailAbs - originRect.top - cardHeight / 2, intendedHeight - cardHeight)
        );
        results.push({ top, left, alignRight });
      });
      setPositions(results);
      // No dynamic container growth to avoid runaway height when resizing
      // Measure actual card sizes after render and recompute if changed
      requestAnimationFrame(() => {
        const measuredH = steps.map(
          (_, i) => cardRefs.current[i]?.getBoundingClientRect().height ?? 130
        );
        const measuredW = steps.map(
          (_, i) => cardRefs.current[i]?.getBoundingClientRect().width ?? originRect.width * 0.4
        );
        const changedH =
          measuredH.length !== cardHeights.length ||
          measuredH.some((h, i) => Math.abs(h - (cardHeights[i] ?? 0)) > 1);
        const changedW =
          measuredW.length !== cardWidths.length ||
          measuredW.some((w, i) => Math.abs(w - (cardWidths[i] ?? 0)) > 1);
        if (changedH) setCardHeights(measuredH);
        if (changedW) setCardWidths(measuredW);
      });
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [cardHeights, cardWidths]);

  return (
    <div
      ref={containerRef}
      className="relative w-full px-4 py-10 overflow-visible"
      style={{ minHeight: BASE_MIN_HEIGHT }}
      id="journey-vertical"
    >
      {withRail && (
        <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[180px] z-[1]">
          <svg
            className="h-full w-full overflow-visible"
            viewBox="-20 -20 220 1040"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="railMobileInternal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <filter id="glowMobileInternal">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <path
              ref={railRef}
              id="internal-rail-path"
              d="M90 0 C -55 280, 235 720, 90 1000"
              stroke="url(#railMobileInternal)"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M90 0 C -55 280, 235 720, 90 1000"
              stroke="url(#railMobileInternal)"
              strokeWidth="18"
              opacity=".25"
              filter="url(#glowMobileInternal)"
              fill="none"
            />
          </svg>
        </div>
      )}

      <div ref={contentRef} className="relative z-20" style={{ minHeight: '520px' }}>
        {positions.length === 0
          ? steps.map((s, i) => <div key={s.t} className="opacity-0" />)
          : positions.map((pos, i) => {
              const s = steps[i];
              return (
                <div
                  key={s.t}
                  className="absolute"
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  style={{ top: pos.top, left: pos.left, width: '40%' }}
                >
                  <div className="glass rounded-2xl p-5 min-h-[110px] flex flex-col justify-center relative">
                    {pos.alignRight ? (
                      <span className="absolute top-1/2 -translate-y-1/2 left-[-6px] h-3 w-3 rounded-full bg-white/90 ring-4 ring-white/15" />
                    ) : (
                      <span className="absolute top-1/2 -translate-y-1/2 right-[-6px] h-3 w-3 rounded-full bg-white/90 ring-4 ring-white/15" />
                    )}
                    <div className="text-base font-semibold text-white">{s.t}</div>
                    <p className="mt-1 text-sm leading-6 text-white/70">{s.d}</p>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}

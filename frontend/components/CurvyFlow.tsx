'use client';
import { useEffect, useRef, useState } from 'react';

export function CurvyFlow() {
  const steps: Array<{ t: string; d: string }> = [
    { t: 'Join', d: 'Create your account in seconds' },
    { t: 'Send your files', d: 'Drop your text or pictures—done' },
    { t: 'We create your lessons', d: 'Pimsleur audio, flashcards, quizzes' },
    { t: 'Start learning', d: 'Practice daily and see your progress' },
  ];

  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  type BoxPos = { left: number; top: number; anchorTop: boolean; width?: number };
  const [boxPositions, setBoxPositions] = useState<BoxPos[] | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [cardHeights, setCardHeights] = useState<number[] | null>(null);

  function computePositions() {
    const wrapper = wrapperRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!wrapper || !svg || !path) return;

    // Band width and a hard safety margin so outer cards never clip
    const wrapperRect = wrapper.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const bandWidth = wrapperRect.width;
    // Cap layout expansion to 2000px and center within the band
    const maxLayout = 2000;
    const width = Math.min(bandWidth, maxLayout);
    const leftOffsetStatic = (bandWidth - width) / 2;
    const n = steps.length;
    const cardWidthsInitial = steps.map((_, i) => {
      const base = 260;
      if (bandWidth >= 1160) {
        // Above breakpoint, keep a stable base width to avoid oscillation
        return base;
      }
      const measured = cardRefs.current[i]?.getBoundingClientRect().width || base;
      const shrunk = Math.max(200, Math.min(measured, base - (1160 - bandWidth) * 0.3));
      return shrunk;
    });
    const minGap = bandWidth < 1160 ? 16 : 24;
    const contentMin = cardWidthsInitial.reduce((s, w) => s + w, 0) + (n - 1) * minGap;
    const dynamicMargin = Math.max(24, Math.floor((width - contentMin) / 2));
    const baseMargin = Math.max(80, Math.min(160, Math.round(width * 0.06)));
    const LM = Math.max(24, Math.min(baseMargin, dynamicMargin));

    const inner = Math.max(0, width - 2 * LM);
    // Evenly spaced target centers across the band
    const xs = Array.from({ length: n }, (_, i) => LM + (i * inner) / (n - 1));

    // Enforce minimum spacing between cards to avoid overlap on small widths
    const cardWidths = cardWidthsInitial;
    const centers = xs.slice();
    // Left-to-right pass
    centers[0] = Math.max(centers[0], LM + cardWidths[0] / 2);
    for (let i = 1; i < n; i++) {
      const minCenter = centers[i - 1] + cardWidths[i - 1] / 2 + minGap + cardWidths[i] / 2;
      centers[i] = Math.max(centers[i], minCenter);
    }
    // Right-to-left pass to keep within right margin
    centers[n - 1] = Math.min(centers[n - 1], width - LM - cardWidths[n - 1] / 2);
    for (let i = n - 2; i >= 0; i--) {
      const maxCenter = centers[i + 1] - (cardWidths[i] / 2 + minGap + cardWidths[i + 1] / 2);
      centers[i] = Math.min(centers[i], maxCenter);
    }
    // Final clamp for both margins
    for (let i = 0; i < n; i++) {
      centers[i] = Math.min(
        width - LM - cardWidths[i] / 2,
        Math.max(LM + cardWidths[i] / 2, centers[i])
      );
    }

    // Map target x (wrapper px) to path length using binary search (account for svg offset/scale)
    const viewBoxWidth = 1200;
    const viewBoxHeight = 220;
    const scaleX = svgRect.width / viewBoxWidth;
    const scaleY = svgRect.height / viewBoxHeight;
    const offsetX = svgRect.left - wrapperRect.left;
    const offsetY = svgRect.top - wrapperRect.top;
    const total = path.getTotalLength();

    const xAt = (len: number) => path.getPointAtLength(len).x * scaleX + offsetX;
    const yAt = (len: number) => path.getPointAtLength(len).y * scaleY + offsetY;
    const findLenForX = (targetX: number) => {
      let lo = 0,
        hi = total;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (xAt(mid) < targetX) lo = mid;
        else hi = mid;
      }
      // refine by projecting toward exact x using local derivative
      let len = (lo + hi) / 2;
      for (let j = 0; j < 3; j++) {
        const delta = 2;
        const p1x = xAt(Math.max(0, len - delta));
        const p2x = xAt(Math.min(total, len + delta));
        const dx = p2x - p1x || 1;
        const x = xAt(len);
        const step = ((targetX - x) / dx) * delta;
        len = Math.min(total, Math.max(0, len + step));
      }
      return len;
    };

    const approxH = 128;
    const positions: BoxPos[] = centers.map((cx, i) => {
      const x = cx + leftOffsetStatic;
      const len = findLenForX(x);
      const y = yAt(len);
      // compute small normal adjustment for visual alignment at steeper slope
      const d = 2;
      const p1x = xAt(Math.max(0, len - d));
      const p1y = yAt(Math.max(0, len - d));
      const p2x = xAt(Math.min(total, len + d));
      const p2y = yAt(Math.min(total, len + d));
      const dx = p2x - p1x;
      const dy = p2y - p1y;
      const normalAdjust = i >= 2 ? Math.max(-6, Math.min(6, (dy / (dx || 1)) * 2)) : 0;
      const anchorTop = i < 2;
      const h = cardRefs.current[i]?.getBoundingClientRect().height ?? approxH;
      const top = anchorTop ? y + 8 + normalAdjust : Math.max(0, y - h - 8 - normalAdjust);
      return { left: x, top, anchorTop, width: cardWidths[i] };
    });

    setBoxPositions(positions);
  }

  useEffect(() => {
    computePositions();
    const onResize = () => computePositions();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Measure card heights once after first render to improve bottom-anchor precision
  useEffect(() => {
    const heights = steps.map((_, i) => cardRefs.current[i]?.getBoundingClientRect().height || 128);
    setCardHeights(heights);
    // recompute with precise heights
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => computePositions(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapperRef} className="relative mt-8 w-full h-56 sm:h-64">
      {/* Full-bleed rail across the band */}
      <svg
        ref={svgRef}
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-full w-screen pointer-events-none"
      >
        <defs>
          <linearGradient id="rail" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <path
          ref={pathRef}
          d="M-20 180 C 260 20, 520 20, 760 120 S 1240 210, 1220 40"
          stroke="url(#rail)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M-20 180 C 260 20, 520 20, 760 120 S 1240 210, 1220 40"
          stroke="url(#rail)"
          strokeWidth="18"
          opacity=".25"
          filter="url(#glow)"
          fill="none"
        />
      </svg>

      {boxPositions && (
        <div className="relative z-10 w-full">
          {boxPositions.map((pos, i) => (
            <div
              key={steps[i].t}
              className="absolute flex -translate-x-1/2 flex-col items-center"
              style={{ left: pos.left, top: pos.top, width: Math.round(pos.width || 260) }}
            >
              {pos.anchorTop && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block h-3 w-3 rounded-full bg-white/90 ring-4 ring-white/15" />
              )}
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="glass rounded-2xl p-5 text-center min-h-[120px] flex flex-col justify-center w-full"
              >
                <div className="text-base font-semibold text-white">{steps[i].t}</div>
                <p className="mt-1 text-sm leading-6 text-white/70">{steps[i].d}</p>
              </div>
              {!pos.anchorTop && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-block h-3 w-3 rounded-full bg-white/90 ring-4 ring-white/15" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

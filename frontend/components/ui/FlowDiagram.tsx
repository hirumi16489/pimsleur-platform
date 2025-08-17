export function FlowDiagram() {
  return (
    <div className="w-full">
      <svg
        role="img"
        aria-label="User flow: capture, upload, analyze, learn"
        viewBox="0 0 1200 260"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fd-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="fd-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* connectors */}
        <g stroke="url(#fd-grad)" strokeWidth="3" fill="none" opacity="0.6">
          <path d="M270 130 H430" />
          <path d="M620 130 H780" />
          <path d="M970 130 H1130" />
          {/* arrow heads */}
          <path d="M430 130 l-10 -6 v12 z" fill="url(#fd-grad)" />
          <path d="M780 130 l-10 -6 v12 z" fill="url(#fd-grad)" />
          <path d="M1130 130 l-10 -6 v12 z" fill="url(#fd-grad)" />
        </g>

        {/* step 1: capture */}
        <g transform="translate(60,40)">
          <rect rx="18" width="200" height="180" fill="#0b0b0d" stroke="#2a2a30" />
          <rect
            rx="18"
            width="200"
            height="180"
            fill="#0b0b0d"
            stroke="url(#fd-grad)"
            opacity="0.25"
          />
          {/* camera icon */}
          <g transform="translate(30,60)" fill="none" stroke="#ffffff" strokeWidth="2.5">
            <rect x="8" y="14" width="84" height="56" rx="10" />
            <circle cx="50" cy="42" r="14" />
            <path d="M22 14 l10 -10 h36 l10 10" />
          </g>
          <text x="100" y="150" textAnchor="middle" fill="#ffffff" opacity="0.9" fontSize="14">
            Take a photo
          </text>
        </g>

        {/* step 2: upload */}
        <g transform="translate(410,40)">
          <rect rx="18" width="200" height="180" fill="#0b0b0d" stroke="#2a2a30" />
          <rect
            rx="18"
            width="200"
            height="180"
            fill="#0b0b0d"
            stroke="url(#fd-grad)"
            opacity="0.25"
          />
          {/* cloud upload icon */}
          <g transform="translate(36,58)" fill="none" stroke="#ffffff" strokeWidth="2.5">
            <path d="M40 70h44a18 18 0 0 0 0-36 24 24 0 0 0-44-8 18 18 0 0 0-6 44h6" />
            <path d="M62 70 V38" />
            <path d="M50 48 62 36 74 48" />
          </g>
          <text x="100" y="150" textAnchor="middle" fill="#ffffff" opacity="0.9" fontSize="14">
            Upload securely
          </text>
        </g>

        {/* step 3: analyze */}
        <g transform="translate(760,40)">
          <rect rx="18" width="200" height="180" fill="#0b0b0d" stroke="#2a2a30" />
          <rect
            rx="18"
            width="200"
            height="180"
            fill="#0b0b0d"
            stroke="url(#fd-grad)"
            opacity="0.25"
          />
          {/* sparkles/processing icon */}
          <g transform="translate(40,62)" fill="none" stroke="#ffffff" strokeWidth="2.5">
            <path d="M32 24 l6 12 12 6 -12 6 -6 12 -6 -12 -12 -6 12 -6z" />
            <circle cx="72" cy="26" r="6" />
            <circle cx="88" cy="58" r="8" />
          </g>
          <text x="100" y="150" textAnchor="middle" fill="#ffffff" opacity="0.9" fontSize="14">
            AI analysis
          </text>
        </g>

        {/* step 4: learn */}
        <g transform="translate(1110,40)">
          <rect rx="18" width="200" height="180" fill="#0b0b0d" stroke="#2a2a30" />
          <rect
            rx="18"
            width="200"
            height="180"
            fill="#0b0b0d"
            stroke="url(#fd-grad)"
            opacity="0.25"
          />
          {/* flashcards + audio icon */}
          <g transform="translate(32,58)" fill="none" stroke="#ffffff" strokeWidth="2.5">
            {/* flashcards */}
            <rect x="6" y="10" width="64" height="42" rx="6" />
            <rect x="18" y="18" width="64" height="42" rx="6" />
            {/* audio */}
            <path d="M98 26 v28" />
            <path d="M108 22 v36" />
            <path d="M118 26 v28" />
          </g>
          <text x="100" y="150" textAnchor="middle" fill="#ffffff" opacity="0.9" fontSize="14">
            Learn & track
          </text>
        </g>

        {/* soft glow behind nodes */}
        <g filter="url(#fd-glow)">
          <ellipse cx="160" cy="210" rx="120" ry="14" fill="url(#fd-grad)" opacity="0.15" />
          <ellipse cx="510" cy="210" rx="120" ry="14" fill="url(#fd-grad)" opacity="0.15" />
          <ellipse cx="860" cy="210" rx="120" ry="14" fill="url(#fd-grad)" opacity="0.15" />
          <ellipse cx="1210" cy="210" rx="120" ry="14" fill="url(#fd-grad)" opacity="0.15" />
        </g>
      </svg>
    </div>
  );
}

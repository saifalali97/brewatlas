/** Gulf peninsula map hero illustration — reference layout (map nodes, landmarks, brewer). */
export function RecipesDirectoryHeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="gulf-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C4A574" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#C4A574" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gulf-map-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8DCC8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#D4C4A8" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <ellipse cx="260" cy="200" rx="210" ry="170" fill="url(#gulf-glow)" />

      {/* Arabian Peninsula map */}
      <path
        d="M108 248c18-88 62-132 118-138 56-6 98 18 128 62 30 44 38 98 18 138-20 40-58 68-108 72-50 4-98-16-128-52-30-36-42-88-28-82z"
        fill="url(#gulf-map-fill)"
        stroke="#C4A574"
        strokeWidth="1.25"
        strokeOpacity="0.45"
      />

      {/* Connection lines */}
      <g stroke="#C4A574" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="4 6">
        <path d="M168 188 228 156 292 172 338 210" />
        <path d="M228 156 248 118" />
        <path d="M292 172 318 132" />
        <path d="M168 188 198 228" />
      </g>

      {/* Map nodes */}
      {[
        [168, 188],
        [228, 156],
        [292, 172],
        [338, 210],
        [198, 228],
        [248, 118],
        [318, 132],
      ].map(([cx, cy], index) => (
        <g key={index}>
          <circle cx={cx} cy={cy} r="10" fill="#C4A574" fillOpacity="0.12" />
          <circle cx={cx} cy={cy} r="4.5" fill="#C4A574" fillOpacity="0.85" />
        </g>
      ))}

      {/* Landmarks & brewer — faded line art */}
      <g stroke="#C4A574" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" opacity="0.38">
        <path d="M248 248V128l7-16 7 16v120M252 156h6M252 176h6M252 196h6" />
        <path d="M236 248h32" />
        <path d="M356 248V188h12v60M372 248V168h10v80M388 248V204h14v44" />
        <path d="M88 248V204h16v44M108 248V176h12v72" />
      </g>

      <g stroke="#C4A574" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" opacity="0.42">
        <path d="M392 96h52l-10 26H402L392 96z" />
        <path d="M402 122h32l-6 14h-20l-6-14z" />
        <path d="M412 136v14M424 136v14M436 136v14" />
        <ellipse cx="418" cy="96" rx="26" ry="6" opacity="0.65" />
        <path d="M404 150h28l-4 48h-20l-4-48z" />
        <ellipse cx="418" cy="150" rx="14" ry="4" opacity="0.65" />
      </g>

      {/* Botanical sketch */}
      <g stroke="#C4A574" strokeWidth="1" opacity="0.28">
        <path d="M430 300c-8-12-4-22 6-30M438 292c6-10 14-14 22-10" />
        <path d="M448 318c-10-8-8-18 2-24M456 310c8-6 16-4 20 4" />
      </g>
    </svg>
  );
}

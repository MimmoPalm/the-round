import { AMBER, FOAM, GLASS_PATH, INK } from '../lib/pintIcon'

/**
 * Homepage lockup: a crest (rings + the same pint-glass mark used
 * everywhere else) paired with the "The Round" wordmark. One inline SVG
 * for the mark, real HTML for the wordmark — keeps it accessible/SEO-able
 * while staying pixel-consistent with the rest of the icon system.
 */
export function Logo() {
  return (
    <div className="flex flex-col items-center">
      <svg width="84" height="84" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg">
        <circle cx="42" cy="42" r="41" fill="var(--color-surface)" stroke={INK} strokeOpacity="0.14" />
        <circle cx="42" cy="42" r="34" fill="none" stroke={AMBER} strokeOpacity="0.55" />
        <g transform="translate(22, 16) scale(1.25)">
          <defs>
            <clipPath id="logo-glass-clip">
              <path d={GLASS_PATH} />
            </clipPath>
          </defs>
          <rect x="5" y="8" width="22" height="27" fill={AMBER} clipPath="url(#logo-glass-clip)" />
          <path
            d="M6.7,3 L25.3,3 L25.0,9.4 C22.8,8.1 21.2,10.3 18.6,9.2 C16.1,8.1 14.3,10.4 11.8,9.3 C9.7,8.3 8.2,9.9 6.9,9.0 Z"
            fill={FOAM}
            clipPath="url(#logo-glass-clip)"
          />
          <path d={GLASS_PATH} fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
        </g>
      </svg>

      <div className="mt-4 flex items-center gap-2.5">
        <span className="h-px w-7 bg-brass/50" />
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-ink-muted">
          Pub Tracker
        </span>
        <span className="h-px w-7 bg-brass/50" />
      </div>
      <h1 className="mt-1.5 text-center font-display text-[46px] font-semibold leading-[1.05] tracking-tight text-ink">
        The Round
      </h1>
    </div>
  )
}

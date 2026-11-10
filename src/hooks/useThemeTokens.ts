import { useState } from 'react'

export type ThemeTokens = {
  acc: string
  acc2: string
  line: string
  mute: string
  ink: string
  surf2: string
  fontMono: string
}

const FALLBACK: ThemeTokens = {
  acc: 'currentColor',
  acc2: 'currentColor',
  line: 'currentColor',
  mute: 'currentColor',
  ink: 'currentColor',
  surf2: 'currentColor',
  fontMono: 'monospace',
}

function readTokens(): ThemeTokens {
  if (typeof window === 'undefined') {
    return FALLBACK
  }

  const styles = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback

  return {
    acc: read('--tp-acc', FALLBACK.acc),
    acc2: read('--tp-acc-2', FALLBACK.acc2),
    line: read('--tp-line', FALLBACK.line),
    mute: read('--tp-mute', FALLBACK.mute),
    ink: read('--tp-ink', FALLBACK.ink),
    surf2: read('--tp-surf-2', FALLBACK.surf2),
    fontMono: read('--tp-font-mono', FALLBACK.fontMono),
  }
}

/** Recharts needs concrete color strings, so theme tokens are resolved once at mount. */
export function useThemeTokens(): ThemeTokens {
  const [tokens] = useState<ThemeTokens>(readTokens)
  return tokens
}

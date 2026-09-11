import { formatKeys } from '@/utils/platform'

export interface KbdProps {
  /** e.g. 'mod+shift+n' */
  keys: string
}

/** renders a shortcut as a row of key caps, resolving 'mod' for the current platform */
export function Kbd({ keys }: KbdProps) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={keys}>
      {formatKeys(keys).map((k, i) => (
        <kbd
          key={i}
          className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-surface-2 px-1 text-[10px] leading-none text-muted"
        >
          {k}
        </kbd>
      ))}
    </span>
  )
}

import { FONTS } from '@/constants/fonts'
import { useSettingsStore } from '@/store/settings.store'
import { useFontLoader } from '@/hooks/useFontLoader'
import { cn } from '@/utils/cn'
import { track } from '@/utils/analytics'

/** segmented control. waits for the font file before switching so the editor never flashes a fallback. */
export function FontPicker() {
  const font = useSettingsStore((s) => s.font)
  const { load, loading } = useFontLoader()

  return (
    <div
      role="radiogroup"
      aria-label="editor font"
      className="flex h-8 items-center rounded-md bg-surface-2 p-0.5"
    >
      {FONTS.map((f) => {
        const selected = font === f.id
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-busy={loading === f.id || undefined}
            onClick={() => {
              if (!selected) {
                track('font', { id: f.id })
                void load(f.id)
              }
            }}
            className={cn(
              'h-7 rounded px-2.5 text-xs font-bold transition-colors duration-150',
              selected ? 'bg-bg text-fg shadow-sm' : 'text-muted hover:text-fg',
              loading === f.id && 'animate-pulse',
            )}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}

import { ACCENTS } from '@/constants/accents'
import { useSettingsStore } from '@/store/settings.store'
import { cn } from '@/utils/cn'

/** three dots. the chosen one grows a ring. */
export function AccentPicker() {
  const accent = useSettingsStore((s) => s.accent)
  const setAccent = useSettingsStore((s) => s.setAccent)

  return (
    <div role="radiogroup" aria-label="accent colour" className="flex items-center gap-1.5 px-1">
      {ACCENTS.map((a) => (
        <button
          key={a}
          type="button"
          role="radio"
          aria-checked={accent === a}
          aria-label={a}
          title={a}
          data-accent={a}
          onClick={() => setAccent(a)}
          className={cn(
            'flex size-6 items-center justify-center rounded-full transition-transform duration-150 hover:scale-110',
          )}
        >
          <span
            className={cn(
              'block size-3 rounded-full bg-accent transition-[box-shadow] duration-150',
              accent === a && 'ring-2 ring-accent ring-offset-2 ring-offset-bg',
            )}
          />
        </button>
      ))}
    </div>
  )
}

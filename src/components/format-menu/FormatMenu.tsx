import { type ToggleEvent, useId, useRef } from 'react'
import { FORMAT_GROUPS, getFormatsByGroup } from '@/constants/formats'
import { getShortcut, type ShortcutId } from '@/constants/shortcuts'
import { useEditorsStore } from '@/store/editors.store'
import { flushInput } from '@/hooks/useEditorContent'
import { track } from '@/utils/analytics'
import { IconButton } from '@/components/ui/IconButton'
import { Kbd } from '@/components/ui/Kbd'
import { TextAaIcon } from '@/components/ui/icons'

export interface FormatMenuProps {
  editorId: string
}

/** the format picker for one editor. native popover api — no positioning library. */
export function FormatMenu({ editorId }: FormatMenuProps) {
  const popoverId = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const applyFormat = useEditorsStore((s) => s.applyFormat)

  const apply = (formatId: string) => {
    flushInput(editorId)
    if (applyFormat(editorId, formatId)) track('format', { id: formatId, via: 'menu' })
    panel.current?.hidePopover()
  }

  // popovers live in the top layer, so anchor the panel to the trigger by hand when it opens
  const onToggle = (e: ToggleEvent<HTMLDivElement>) => {
    if (e.newState !== 'open' || !trigger.current || !panel.current) return
    const r = trigger.current.getBoundingClientRect()
    const el = panel.current
    const width = el.offsetWidth
    const left = Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8))
    el.style.top = `${r.bottom + 6}px`
    el.style.left = `${left}px`
  }

  return (
    <>
      <IconButton ref={trigger} icon={TextAaIcon} label="format" size="sm" popoverTarget={popoverId} />
      <div
        id={popoverId}
        ref={panel}
        popover="auto"
        role="menu"
        aria-label="formats"
        onToggle={onToggle}
        className="anim-pop fixed inset-auto m-0 hidden max-w-[92vw] grid-cols-2 gap-x-6 gap-y-4 overflow-hidden rounded-xl border border-line bg-bg p-4 text-fg shadow-2xl sm:grid-cols-[repeat(4,max-content)] [&:popover-open]:grid"
      >
        {FORMAT_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="mb-1.5 text-[11px] font-bold text-muted">{group.label}</p>
            <ul className="flex flex-col">
              {getFormatsByGroup(group.id).map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    role="menuitem"
                    aria-label={f.label}
                    onClick={() => apply(f.id)}
                    className="flex h-7 w-full items-center gap-3 rounded px-1.5 text-left text-xs whitespace-nowrap hover:bg-surface-2"
                  >
                    <span>{f.label}</span>
                    {f.shortcut && (
                      <span className="ml-auto">
                        <Kbd keys={getShortcut(f.shortcut as ShortcutId).keys} />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}

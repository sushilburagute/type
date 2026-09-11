import { useId, useRef } from 'react'
import { useUiStore } from '@/store/ui.store'
import { IconButton } from '@/components/ui/IconButton'
import { KeyboardIcon, ListIcon } from '@/components/ui/icons'
import { FontPicker } from '@/components/font-picker/FontPicker'
import { AccentPicker } from '@/components/accent-picker/AccentPicker'
import { ThemeToggle } from '@/components/theme-toggle/ThemeToggle'

export function HeaderMenu() {
  const popoverId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const setShortcutsOpen = useUiStore((state) => state.setShortcutsOpen)

  const openShortcuts = () => {
    panel.current?.hidePopover?.()
    setShortcutsOpen(true)
  }

  return (
    <>
      <IconButton icon={ListIcon} label="menu" popoverTarget={popoverId} />
      <div
        ref={panel}
        id={popoverId}
        popover="auto"
        role="dialog"
        aria-label="menu"
        className="anim-pop fixed inset-auto top-[3.75rem] right-2 m-0 hidden w-[min(22rem,calc(100vw-1rem))] rounded-xl border border-line bg-bg p-4 text-fg shadow-2xl [&:popover-open]:block"
      >
        <p className="mb-3 text-[11px] font-bold tracking-wider text-muted">appearance</p>
        <div className="flex items-center justify-between gap-4">
          <FontPicker />
          <ThemeToggle />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="text-xs font-bold text-muted">accent</span>
          <AccentPicker />
        </div>
        <button
          type="button"
          aria-label="keyboard shortcuts"
          onClick={openShortcuts}
          className="mt-3 flex h-9 w-full items-center gap-2 border-t border-line pt-3 text-left text-xs font-bold text-muted transition-colors hover:text-fg"
        >
          <KeyboardIcon size={16} weight="bold" aria-hidden />
          keyboard shortcuts
          <span className="ml-auto text-[10px] font-normal">?</span>
        </button>
      </div>
    </>
  )
}

import { useDeferredValue, useMemo } from 'react'
import { useEditorsStore } from '@/store/editors.store'
import { useSettingsStore } from '@/store/settings.store'
import { useUiStore } from '@/store/ui.store'
import { computeDiff } from '@/utils/diff'
import { cn } from '@/utils/cn'
import { type DiffMode } from '@/types/settings'
import { Dialog } from '@/components/ui/Dialog'
import { IconButton } from '@/components/ui/IconButton'
import { XIcon } from '@/components/ui/icons'
import { ComparePicker } from '@/components/compare/ComparePicker'
import { DiffView } from '@/components/compare/DiffView'

const MODES: { id: DiffMode; label: string }[] = [
  { id: 'split', label: 'split' },
  { id: 'unified', label: 'unified' },
]

/** full-screen overlay: pick a and b, see the diff. this chunk is the only place jsdiff lives. */
export default function CompareView() {
  const order = useEditorsStore((s) => s.order)
  const activeId = useEditorsStore((s) => s.activeEditorId)
  const compareA = useUiStore((s) => s.compareA)
  const compareB = useUiStore((s) => s.compareB)
  const setCompare = useUiStore((s) => s.setCompare)
  const close = () => useUiStore.getState().setCompareOpen(false)
  const mode = useSettingsStore((s) => s.diffMode)
  const setMode = useSettingsStore((s) => s.setDiffMode)

  // defaults: a = active (or first), b = the next one that isn't a
  const aId = compareA && order.includes(compareA) ? compareA : (activeId ?? order[0] ?? '')
  const bId =
    compareB && order.includes(compareB) && compareB !== aId
      ? compareB
      : (order.find((id) => id !== aId) ?? '')

  const aText = useEditorsStore((s) => s.editors[aId]?.content ?? '')
  const bText = useEditorsStore((s) => s.editors[bId]?.content ?? '')
  // deferred so switching a/b on huge texts doesn't block the select from updating
  const a = useDeferredValue(aText)
  const b = useDeferredValue(bText)
  const result = useMemo(() => computeDiff(a, b), [a, b])

  return (
    <Dialog
      open
      onClose={close}
      label="compare editors"
      className="flex h-[90dvh] flex-col [--dialog-w:80rem]"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
        <h2 className="text-lg font-bold">compare</h2>
        <div className="min-w-0 flex-1 basis-72">
          <ComparePicker aId={aId} bId={bId} onChange={setCompare} />
        </div>
        <div
          role="radiogroup"
          aria-label="diff layout"
          className="flex h-8 items-center rounded-md bg-surface-2 p-0.5"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                'h-7 rounded px-2.5 text-xs font-bold transition-colors duration-150',
                mode === m.id ? 'bg-bg text-fg shadow-sm' : 'text-muted hover:text-fg',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-xs tabular-nums" aria-live="polite">
          <span className="font-bold">+{result.added}</span>{' '}
          <span className="font-bold">−{result.removed}</span>
        </p>
        <IconButton icon={XIcon} label="close" onClick={close} />
      </div>
      <DiffView result={result} mode={mode} />
    </Dialog>
  )
}

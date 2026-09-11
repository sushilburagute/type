import { SHORTCUTS } from '@/constants/shortcuts'
import { useUiStore } from '@/store/ui.store'
import { Dialog } from '@/components/ui/Dialog'
import { Kbd } from '@/components/ui/Kbd'

/** lists every shortcut from the single constants source */
export default function KeyboardShortcutsSheet() {
  const close = () => useUiStore.getState().setShortcutsOpen(false)
  return (
    <Dialog open onClose={close} label="keyboard shortcuts" className="[--dialog-w:26rem]">
      <div className="p-5">
        <h2 className="mb-4 text-xl font-bold">shortcuts</h2>
        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2.5 text-sm">
          {SHORTCUTS.map((s) => (
            <div key={s.id} className="contents">
              <dt className="text-fg">{s.label}</dt>
              <dd className="justify-self-end">
                <Kbd keys={s.keys} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Dialog>
  )
}

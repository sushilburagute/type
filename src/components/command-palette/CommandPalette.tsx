import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { FORMATS } from '@/constants/formats'
import { useEditorsStore } from '@/store/editors.store'
import { useUiStore } from '@/store/ui.store'
import { flushInput } from '@/hooks/useEditorContent'
import { toggleTheme } from '@/hooks/useKeyboardShortcuts'
import { copyText } from '@/utils/clipboard'
import { track } from '@/utils/analytics'
import { cn } from '@/utils/cn'
import { Dialog } from '@/components/ui/Dialog'

interface Command {
  id: string
  label: string
  group: string
  keywords: string[]
  run: () => void
}

function buildCommands(): Command[] {
  const editors = useEditorsStore.getState()
  const ui = useUiStore.getState()
  const active = editors.activeEditorId

  const app: Command[] = [
    {
      id: 'new-editor',
      label: 'new editor',
      group: 'app',
      keywords: ['add', 'plus', 'open'],
      run: () => {
        const id = editors.addEditor()
        if (id) ui.requestFocus(id)
      },
    },
    {
      id: 'copy',
      label: 'copy active editor',
      group: 'app',
      keywords: ['clipboard'],
      run: () => {
        if (!active) return
        flushInput(active)
        void copyText(useEditorsStore.getState().editors[active]?.content ?? '').then((ok) =>
          ui.pushToast(ok ? 'copied' : 'could not copy'),
        )
      },
    },
    {
      id: 'compare',
      label: 'compare editors',
      group: 'app',
      keywords: ['diff', 'git'],
      run: () => {
        if (editors.order.length < 2) {
          ui.pushToast('open a second editor to compare')
          return
        }
        flushInput()
        ui.setCompareOpen(true)
      },
    },
    {
      id: 'toggle-theme',
      label: 'toggle theme',
      group: 'app',
      keywords: ['dark', 'light'],
      run: () => toggleTheme(),
    },
    {
      id: 'shortcuts',
      label: 'keyboard shortcuts',
      group: 'app',
      keywords: ['keys', 'help'],
      run: () => ui.setShortcutsOpen(true),
    },
  ]

  const formats: Command[] = FORMATS.map((f) => ({
    id: f.id,
    label: f.label,
    group: f.group,
    keywords: f.keywords ?? [],
    run: () => {
      if (!active) return
      flushInput(active)
      if (editors.applyFormat(active, f.id)) track('format', { id: f.id, via: 'palette' })
    },
  }))

  return [...formats, ...app]
}

function matches(cmd: Command, q: string): boolean {
  if (!q) return true
  const hay = [cmd.label, cmd.group, ...cmd.keywords].join(' ')
  return q.split(/\s+/).every((part) => hay.includes(part))
}

/** ctrl/cmd+k. runs formats and app commands against the active editor. */
export default function CommandPalette() {
  const close = () => useUiStore.getState().setPaletteOpen(false)
  const [query, setQueryState] = useState('')
  const [cursor, setCursor] = useState(0)
  const setQuery = (q: string) => {
    setQueryState(q)
    setCursor(0)
  }
  const listRef = useRef<HTMLUListElement>(null)
  const commands = useMemo(() => buildCommands(), [])
  const results = useMemo(
    () => commands.filter((c) => matches(c, query.trim().toLowerCase())),
    [commands, query],
  )

  useEffect(() => {
    listRef.current?.children[cursor]?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const run = (cmd: Command) => {
    close()
    cmd.run()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = results[cursor]
      if (cmd) run(cmd)
    }
  }

  return (
    <Dialog open onClose={close} label="command palette" className="[--dialog-w:32rem]">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="type a format or command…"
        aria-label="search commands"
        aria-controls="palette-list"
        aria-activedescendant={results[cursor] ? `palette-${results[cursor].id}` : undefined}
        role="combobox"
        aria-expanded
        className="h-12 w-full border-b border-line bg-transparent px-4 text-base font-bold outline-none placeholder:font-normal placeholder:text-muted"
      />
      <ul id="palette-list" ref={listRef} role="listbox" className="max-h-[50dvh] overflow-y-auto p-2">
        {results.length === 0 && (
          <li className="px-2 py-6 text-center text-sm text-muted">nothing matches</li>
        )}
        {results.map((cmd, i) => (
          <li
            key={cmd.id}
            id={`palette-${cmd.id}`}
            role="option"
            aria-selected={i === cursor}
            onMouseEnter={() => setCursor(i)}
            onClick={() => run(cmd)}
            className={cn(
              'flex h-9 cursor-pointer items-center justify-between rounded-md px-2 text-sm',
              i === cursor && 'bg-surface-2',
            )}
          >
            <span>{cmd.label}</span>
            <span className="text-[11px] text-muted">{cmd.group}</span>
          </li>
        ))}
      </ul>
    </Dialog>
  )
}

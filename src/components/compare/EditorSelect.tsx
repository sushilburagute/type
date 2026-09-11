import { useShallow } from 'zustand/react/shallow'
import { useEditorsStore } from '@/store/editors.store'

export interface EditorSelectProps {
  label: string
  value: string
  onChange: (id: string) => void
}

export function EditorSelect({ label, value, onChange }: EditorSelectProps) {
  const order = useEditorsStore(useShallow((s) => s.order))
  const titles = useEditorsStore(useShallow((s) => s.order.map((id) => s.editors[id]?.title ?? '')))

  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 text-xs">
      <span className="font-bold text-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`editor ${label}`}
        className="h-8 min-w-0 flex-1 rounded-md border border-line bg-bg px-2 text-sm"
      >
        {order.map((id, index) => (
          <option key={id} value={id}>
            {index + 1}. {titles[index]}
          </option>
        ))}
      </select>
    </label>
  )
}

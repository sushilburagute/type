import { IconButton } from '@/components/ui/IconButton'
import { ArrowsLeftRightIcon } from '@/components/ui/icons'
import { EditorSelect } from '@/components/compare/EditorSelect'

export interface ComparePickerProps {
  aId: string
  bId: string
  onChange: (aId: string, bId: string) => void
}

/** two selects and a swap. */
export function ComparePicker({ aId, bId, onChange }: ComparePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <EditorSelect label="a" value={aId} onChange={(id) => onChange(id, bId)} />
      <IconButton icon={ArrowsLeftRightIcon} label="swap" size="sm" onClick={() => onChange(bId, aId)} />
      <EditorSelect label="b" value={bId} onChange={(id) => onChange(aId, id)} />
    </div>
  )
}

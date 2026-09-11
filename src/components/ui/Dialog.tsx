import { type ReactNode, useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

export interface DialogProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
}

/** thin wrapper over native <dialog> so we get focus trapping, esc and a backdrop for free */
export function Dialog({ open, onClose, label, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        // click on the backdrop (outside the panel) closes
        if (e.target === e.currentTarget) onClose()
      }}
      className={cn(
        'm-auto max-h-[90dvh] w-[min(92vw,var(--dialog-w,40rem))] rounded-xl border border-line bg-bg p-0 text-fg shadow-2xl',
        'backdrop:bg-transparent',
        className,
      )}
    >
      {open ? children : null}
    </dialog>
  )
}

import { useEffect } from 'react'
import { TOAST_DURATION_MS } from '@/constants/limits'
import { type Toast as ToastModel } from '@/store/ui.store'

export interface ToastProps {
  toast: ToastModel
  onDismiss: (id: number) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS)
    return () => window.clearTimeout(t)
  }, [toast.id, onDismiss])

  return (
    <div
      role="status"
      className="anim-in pointer-events-auto rounded-md bg-fg px-3 py-1.5 text-xs font-bold text-bg shadow-lg"
    >
      {toast.message}
    </div>
  )
}
